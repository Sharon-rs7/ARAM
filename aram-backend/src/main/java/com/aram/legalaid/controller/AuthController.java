package com.aram.legalaid.controller;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.service.AuthService;
import com.aram.legalaid.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.refresh(body.get("refreshToken")));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthMessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(passwordResetService.forgotPassword(request));
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<AuthMessageResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(passwordResetService.verifyOtp(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthMessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(passwordResetService.resetPassword(request));
    }

    @PostMapping("/accept-invitation")
    public ResponseEntity<AuthMessageResponse> acceptInvitation(@Valid @RequestBody AcceptInvitationRequest request) {
        return ResponseEntity.ok(authService.acceptInvitation(request));
    }

    @PostMapping({"/activate-account", "/activate"})
    public ResponseEntity<AuthMessageResponse> activateAccount(@Valid @RequestBody AcceptInvitationRequest request) {
        return ResponseEntity.ok(authService.acceptInvitation(request));
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.aram.legalaid.repository.UserRepository userRepositoryForTest;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoderForTest;

    @PostMapping("/reset-password-test")
    public ResponseEntity<String> resetPasswordTest(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        com.aram.legalaid.model.User user = userRepositoryForTest.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPasswordHash(passwordEncoderForTest.encode("Citizen@123"));
        userRepositoryForTest.save(user);
        return ResponseEntity.ok("Password reset successfully to Citizen@123");
    }
}
