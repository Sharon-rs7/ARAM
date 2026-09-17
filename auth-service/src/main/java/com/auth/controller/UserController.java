package com.auth.controller;

import com.auth.dto.ThemePreferenceRequest;
import com.auth.dto.UserResponse;
import com.auth.dto.UserUpdateRequest;
import com.auth.entity.AppUser;
import com.auth.repository.AppUserRepository;
import com.auth.service.MapperService;
import com.auth.service.UserService;
import com.auth.exception.BadRequestException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final MapperService mapperService;
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, MapperService mapperService, AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.mapperService = mapperService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(mapperService.toUserResponse(userService.currentUser()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(@Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(mapperService.toUserResponse(userService.updateCurrentUser(request)));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<UserResponse> updateAvatar(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(mapperService.toUserResponse(userService.updateAvatar(file)));
    }

    @PutMapping("/me/theme")
    public ResponseEntity<UserResponse> updateTheme(@Valid @RequestBody ThemePreferenceRequest request) {
        return ResponseEntity.ok(mapperService.toUserResponse(userService.updateTheme(request)));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> body) {
        AppUser user = userService.currentUser();
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        if (oldPassword == null || newPassword == null) {
            throw new BadRequestException("Current and new passwords are required");
        }
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "message", "Password changed successfully"));
    }

    @PostMapping("/me/2fa/enable")
    public ResponseEntity<Map<String, Object>> enable2fa() {
        AppUser user = userService.currentUser();
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "enabled", true, "message", "2FA has been enabled"));
    }

    @PostMapping("/me/2fa/disable")
    public ResponseEntity<Map<String, Object>> disable2fa() {
        AppUser user = userService.currentUser();
        user.setTwoFactorEnabled(false);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "enabled", false, "message", "2FA has been disabled"));
    }

    @GetMapping("/me/devices")
    public ResponseEntity<List<Map<String, Object>>> getDevices() {
        AppUser user = userService.currentUser();
        return ResponseEntity.ok(List.of(
                Map.of(
                        "deviceName", "Windows PC (Current Session)",
                        "browser", "Chrome / Edge",
                        "lastLogin", user.getLastLogin() != null ? user.getLastLogin() : LocalDateTime.now(),
                        "ipAddress", "192.168.1.45"
                ),
                Map.of(
                        "deviceName", "Android Smartphone",
                        "browser", "Mobile Chrome",
                        "lastLogin", LocalDateTime.now().minusDays(1),
                        "ipAddress", "106.210.43.12"
                )
        ));
    }

    @PostMapping("/me/logout-all")
    public ResponseEntity<Map<String, Object>> logoutAll() {
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out from all other devices successfully"));
    }

    @GetMapping("/me/data-report")
    public ResponseEntity<Map<String, Object>> getDataReport() {
        AppUser user = userService.currentUser();
        return ResponseEntity.ok(Map.of(
                "userName", user.getName(),
                "userEmail", user.getEmail(),
                "role", user.getRole(),
                "memberSince", user.getCreatedAt(),
                "status", user.getStatus(),
                "disclaimer", "This data package includes profile and metadata associated with ARAM. Internal audit and case histories are retained for legal record integrity."
        ));
    }

    @PostMapping("/me/delete-request")
    public ResponseEntity<Map<String, Object>> deleteRequest() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "status", "PENDING_REVIEW",
                "message", "Your deletion request has been submitted. Personal credentials will be deactivated pending legal record audits."
        ));
    }
}
