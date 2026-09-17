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

    public PasswordResetService(UserRepository userRepository, PasswordResetOtpRepository otpRepository, PasswordEncoder passwordEncoder, AuditLogService auditLogService, EmailService emailService) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
    }

    @Transactional
    public AuthMessageResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.email().trim().toLowerCase();
        
        // Security best practice: don't reveal in response if email exists or not
        boolean userExists = userRepository.existsByEmail(email);

        Optional<PasswordResetOtp> existingOpt = otpRepository.findTopByEmailOrderByCreatedAtDesc(email);
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
        newOtp.setOtp(otp);
        newOtp.setExpiryTime(expiryTime);
        newOtp.setAttempts(0);
        newOtp.setUsed(false);
        otpRepository.save(newOtp);

        // [DEV ONLY] Log OTP in backend console
        System.out.println("\n==================================================");
        System.out.println("[DEV ONLY] PASSWORD RESET OTP FOR: " + email);
        System.out.println("OTP CODE: " + otp);
        System.out.println("EXPIRES AT: " + expiryTime);
        System.out.println("==================================================\n");

        if (userExists) {
            auditLogService.log("PASSWORD_RESET_REQUESTED", email, "Forgot password OTP requested.");
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                emailService.sendPasswordResetOtpEmail(email, userOpt.get().getName(), otp);
            }
        }

        return new AuthMessageResponse("If the email is registered, a password reset OTP has been sent.", true);
    }

    @Transactional
    public AuthMessageResponse verifyOtp(VerifyOtpRequest request) {
        String email = request.email().trim().toLowerCase();
        String otp = request.otp().trim();

        PasswordResetOtp resetOtp = otpRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new BadRequestException("No password reset request found for this email."));

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
                resetOtp.setBlockedUntil(LocalDateTime.now().plusMinutes(10));
                otpRepository.save(resetOtp);
                auditLogService.log("PASSWORD_RESET_BLOCKED", email, "Too many wrong attempts. Reset blocked for 10 minutes.");
                throw new BadRequestException("Invalid OTP. Too many wrong attempts. Password reset blocked for 10 minutes.");
            }
            otpRepository.save(resetOtp);
            throw new BadRequestException("Invalid OTP. Attempts remaining: " + (5 - attempts));
        }

        return new AuthMessageResponse("OTP verified successfully.", true);
    }

    @Transactional
    public AuthMessageResponse resetPassword(ResetPasswordRequest request) {
        String email = request.email().trim().toLowerCase();
        String otp = request.otp().trim();

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match.");
        }

        PasswordResetOtp resetOtp = otpRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new BadRequestException("No password reset request found for this email."));

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

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found."));

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
