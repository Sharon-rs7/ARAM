package com.aram.legalaid.service;

import com.aram.legalaid.dto.AuthMessageResponse;
import com.aram.legalaid.dto.ForgotPasswordRequest;
import com.aram.legalaid.dto.ResetPasswordRequest;
import com.aram.legalaid.dto.VerifyOtpRequest;
import com.aram.legalaid.exception.BadRequestException;
import com.aram.legalaid.model.PasswordResetOtp;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.PasswordResetOtpRepository;
import com.aram.legalaid.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class PasswordResetService {
    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final EmailService emailService;
    private final SmsService smsService;
    private final WhatsAppService whatsAppService;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetOtpRepository otpRepository,
            PasswordEncoder passwordEncoder,
            AuditLogService auditLogService,
            EmailService emailService,
            SmsService smsService,
            WhatsAppService whatsAppService
    ) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
        this.smsService = smsService;
        this.whatsAppService = whatsAppService;
    }

    private User resolveUser(String input) {
        if (input == null || input.isBlank()) {
            throw new BadRequestException("Email address or 10-digit mobile number is required.");
        }
        String clean = input.trim();
        if (clean.contains("@")) {
            return userRepository.findByEmail(clean.toLowerCase())
                    .orElseThrow(() -> new BadRequestException("No account found with this email address. Please create a new account."));
        }

        String digits = clean.replaceAll("[^0-9]", "");
        if (digits.startsWith("91") && digits.length() == 12) {
            digits = digits.substring(2);
        } else if (digits.startsWith("0") && digits.length() == 11) {
            digits = digits.substring(1);
        }

        if (digits.length() == 10) {
            final String mobile = digits;
            return userRepository.findByMobile(mobile)
                    .orElseThrow(() -> new BadRequestException("No account found with mobile number +91" + mobile + ". Please verify or register."));
        }

        // Fallback attempt by email
        return userRepository.findByEmail(clean.toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid email address or 10-digit mobile number."));
    }

    @Transactional
    public AuthMessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = resolveUser(request.email());
        String email = user.getEmail();
        String mobile = user.getMobile();

        // Rate limiting: max 3 requests in the last 10 minutes
        LocalDateTime tenMinutesAgo = LocalDateTime.now().minusMinutes(10);
        long recentCount = otpRepository.countByEmailAndCreatedAtAfter(email, tenMinutesAgo);
        if (recentCount >= 3) {
            throw new BadRequestException("Too many OTP requests. Please wait 10 minutes before trying again.");
        }

        Optional<PasswordResetOtp> existingOpt = otpRepository.findTopByEmailOrMobileNumberOrderByCreatedAtDesc(email, mobile);
        if (existingOpt.isPresent()) {
            PasswordResetOtp existing = existingOpt.get();
            if (existing.getBlockedUntil() != null && existing.getBlockedUntil().isAfter(LocalDateTime.now())) {
                throw new BadRequestException("Too many wrong attempts. Reset is blocked. Please try again later.");
            }
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);

        PasswordResetOtp newOtp = new PasswordResetOtp();
        newOtp.setEmail(email);
        newOtp.setMobileNumber(mobile);
        newOtp.setOtp(otp);
        newOtp.setExpiryTime(expiryTime);
        newOtp.setAttempts(0);
        newOtp.setUsed(false);
        otpRepository.save(newOtp);

        // [DEV ONLY] Log OTP in backend console
        System.out.println("\n==================================================");
        System.out.println("[DEV ONLY] PASSWORD RESET OTP FOR: " + email + (mobile != null ? " / +91" + mobile : ""));
        System.out.println("OTP CODE: " + otp);
        System.out.println("EXPIRES AT: " + expiryTime);
        System.out.println("==================================================\n");

        auditLogService.log("PASSWORD_RESET_REQUESTED", email, "Forgot password OTP requested via Multi-Channel.");

        // 1. Dispatch Email
        try {
            emailService.sendPasswordResetOtpEmail(email, user.getName(), otp);
        } catch (Exception e) {
            System.err.println("Email dispatch error: " + e.getMessage());
        }

        // 2. Dispatch Normal SMS
        if (mobile != null && !mobile.isBlank()) {
            try {
                smsService.sendOtp(mobile, otp);
            } catch (Exception e) {
                System.err.println("SMS dispatch error: " + e.getMessage());
            }
        }

        // 3. Dispatch WhatsApp OTP
        if (mobile != null && !mobile.isBlank()) {
            try {
                whatsAppService.sendOtpMessage(mobile, otp);
            } catch (Exception e) {
                System.err.println("WhatsApp OTP error: " + e.getMessage());
            }
        }

        return new AuthMessageResponse("Password reset OTP has been sent to your registered mobile and email.", true);
    }

    @Transactional
    public AuthMessageResponse verifyOtp(VerifyOtpRequest request) {
        User user = resolveUser(request.email());
        String email = user.getEmail();
        String mobile = user.getMobile();
        String otp = request.otp().trim();

        PasswordResetOtp resetOtp = otpRepository.findTopByEmailOrMobileNumberOrderByCreatedAtDesc(email, mobile)
                .orElseThrow(() -> new BadRequestException("No password reset request found for this account."));

        if (resetOtp.getBlockedUntil() != null && resetOtp.getBlockedUntil().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Too many wrong attempts. Reset is blocked. Please try again later.");
        }

        if (resetOtp.isUsed()) {
            throw new BadRequestException("This OTP has already been used.");
        }

        if (resetOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This OTP has expired. Please request a new one.");
        }

        if (!resetOtp.getOtp().equals(otp)) {
            int attempts = resetOtp.getAttempts() + 1;
            resetOtp.setAttempts(attempts);
            if (attempts >= 5) {
                resetOtp.setBlockedUntil(LocalDateTime.now().plusMinutes(15));
                otpRepository.save(resetOtp);
                auditLogService.log("PASSWORD_RESET_BLOCKED", email, "Too many wrong attempts. Reset blocked for 15 minutes.");
                throw new BadRequestException("Invalid OTP. Too many wrong attempts. Password reset blocked for 15 minutes.");
            }
            otpRepository.save(resetOtp);
            throw new BadRequestException("Invalid OTP. Attempts remaining: " + (5 - attempts));
        }

        return new AuthMessageResponse("OTP verified successfully.", true);
    }

    @Transactional
    public AuthMessageResponse resetPassword(ResetPasswordRequest request) {
        User user = resolveUser(request.email());
        String email = user.getEmail();
        String mobile = user.getMobile();
        String otp = request.otp().trim();

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match.");
        }

        PasswordResetOtp resetOtp = otpRepository.findTopByEmailOrMobileNumberOrderByCreatedAtDesc(email, mobile)
                .orElseThrow(() -> new BadRequestException("No password reset request found for this account."));

        if (resetOtp.getBlockedUntil() != null && resetOtp.getBlockedUntil().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Too many wrong attempts. Reset is blocked. Please try again later.");
        }

        if (resetOtp.isUsed()) {
            throw new BadRequestException("This OTP has already been used.");
        }

        if (resetOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This OTP has expired. Please request a new one.");
        }

        if (!resetOtp.getOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP.");
        }

        // Update password with encoder
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // Mark OTP as used
        resetOtp.setUsed(true);
        otpRepository.save(resetOtp);

        auditLogService.log("PASSWORD_RESET_SUCCESS", email, "Password reset successfully completed.");

        // Send security alert email
        emailService.sendPasswordChangedEmail(email, user.getName());

        return new AuthMessageResponse("Password has been reset successfully.", true);
    }
}
