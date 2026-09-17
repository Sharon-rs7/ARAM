package com.auth.service;

import com.auth.dto.AuthMessageResponse;
import com.auth.dto.ForgotPasswordRequest;
import com.auth.dto.ResetPasswordRequest;
import com.auth.dto.VerifyOtpRequest;
import com.auth.entity.PasswordResetOtp;
import com.auth.entity.AppUser;
import com.auth.exception.BadRequestException;
import com.auth.repository.PasswordResetOtpRepository;
import com.auth.repository.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class PasswordResetService {
    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final AppUserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(AppUserRepository userRepository, PasswordResetOtpRepository otpRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthMessageResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.email().trim().toLowerCase();
        boolean userExists = userRepository.existsByEmail(email);

        Optional<PasswordResetOtp> existingOpt = otpRepository.findTopByEmailOrderByCreatedAtDesc(email);
        if (existingOpt.isPresent()) {
            PasswordResetOtp existing = existingOpt.get();
            if (existing.getBlockedUntil() != null && existing.getBlockedUntil().isAfter(LocalDateTime.now())) {
                throw new BadRequestException("Too many wrong attempts. Reset is blocked. Please try again later.");
            }
        }

        String otp = String.format("%06d", new Random().nextInt(1000000));
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);

        PasswordResetOtp newOtp = new PasswordResetOtp();
        newOtp.setEmail(email);
        newOtp.setOtp(otp);
        newOtp.setExpiryTime(expiryTime);
        newOtp.setAttempts(0);
        newOtp.setUsed(false);
        otpRepository.save(newOtp);

        System.out.println("\n==================================================");
        System.out.println("[DEV ONLY] PASSWORD RESET OTP FOR: " + email);
        System.out.println("OTP CODE: " + otp);
        System.out.println("EXPIRES AT: " + expiryTime);
        System.out.println("==================================================\n");

        if (userExists) {
            log.info("PASSWORD_RESET_REQUESTED: {} | Forgot password OTP requested.", email);
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
            if (attempts >= 3) {
                resetOtp.setBlockedUntil(LocalDateTime.now().plusMinutes(10));
                otpRepository.save(resetOtp);
                log.warn("PASSWORD_RESET_BLOCKED: {} | Too many wrong attempts. Reset blocked for 10 minutes.", email);
                throw new BadRequestException("Invalid OTP. Too many wrong attempts. Password reset blocked for 10 minutes.");
            }
            otpRepository.save(resetOtp);
            throw new BadRequestException("Invalid OTP. Attempts remaining: " + (3 - attempts));
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

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found."));

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        resetOtp.setUsed(true);
        otpRepository.save(resetOtp);

        log.info("PASSWORD_RESET_SUCCESS: {} | Password reset successfully completed.", email);

        return new AuthMessageResponse("Password has been reset successfully.", true);
    }
}
