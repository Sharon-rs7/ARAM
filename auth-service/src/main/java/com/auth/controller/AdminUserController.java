package com.auth.controller;

import com.auth.dto.UserResponse;
import com.auth.dto.UserUpdateRequest;
import com.auth.entity.AppUser;
import com.auth.entity.Role;
import com.auth.entity.UserStatus;
import com.auth.exception.ResourceNotFoundException;
import com.auth.repository.AppUserRepository;
import com.auth.service.MapperService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users-internal")
public class AdminUserController {
    private final AppUserRepository userRepository;
    private final MapperService mapperService;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(AppUserRepository userRepository, MapperService mapperService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.mapperService = mapperService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> users() {
        return ResponseEntity.ok(userRepository.findAll().stream().map(mapperService::toUserResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> user(@PathVariable Long id) {
        AppUser user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(mapperService.toUserResponse(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        AppUser user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (request.name() != null) user.setName(request.name());
        if (request.email() != null) user.setEmail(request.email());
        if (request.mobile() != null) user.setMobile(request.mobile());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.district() != null) user.setDistrict(request.district());
        if (request.address() != null) user.setAddress(request.address());
        if (request.preferredLanguage() != null) user.setPreferredLanguage(request.preferredLanguage());
        if (request.gender() != null) user.setGender(request.gender());
        if (request.specialization() != null) user.setSpecialization(request.specialization());
        if (request.status() != null) user.setStatus(request.status());

        AppUser saved = userRepository.save(user);
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<UserResponse> deleteUser(@PathVariable Long id) {
        AppUser user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.SUSPENDED); // soft delete status
        AppUser saved = userRepository.save(user);
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }

    @GetMapping("/helpers")
    public ResponseEntity<List<UserResponse>> helpers() {
        return ResponseEntity.ok(userRepository.findByRole(Role.HELPER).stream().map(mapperService::toUserResponse).toList());
    }

    @PutMapping("/helpers/{id}/verify")
    public ResponseEntity<UserResponse> verifyHelper(@PathVariable Long id) {
        AppUser helper = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Helper not found"));
        helper.setHelperVerified(true);
        helper.setStatus(UserStatus.ACTIVE);
        AppUser saved = userRepository.save(helper);
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }

    @PutMapping("/helpers/{id}/reject")
    public ResponseEntity<UserResponse> rejectHelper(@PathVariable Long id) {
        AppUser helper = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Helper not found"));
        helper.setHelperVerified(false);
        helper.setStatus(UserStatus.SUSPENDED);
        AppUser saved = userRepository.save(helper);
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }

    @PostMapping("/helpers")
    public ResponseEntity<UserResponse> createHelper(@RequestBody Map<String, Object> body) {
        AppUser helper = new AppUser();
        helper.setName((String) body.get("name"));
        helper.setEmail((String) body.get("email"));
        helper.setMobile((String) body.get("mobile"));
        helper.setRole(Role.HELPER);
        helper.setStatus(UserStatus.ACTIVE);
        helper.setHelperVerified(true);

        String tempPassword = "AramVol@" + helper.getMobile().substring(6);
        helper.setPasswordHash(passwordEncoder.encode(tempPassword));
        helper.setForcePasswordChange(true);

        helper.setGender((String) body.get("gender"));
        helper.setDistrict((String) body.get("district"));
        helper.setLanguagesKnown((String) body.get("languagesKnown"));
        helper.setSpecializationCategories((String) body.get("specializationCategories"));
        helper.setMaxActiveCases(5);
        helper.setWomenSupportTrained(Boolean.TRUE.equals(body.get("womenSupportTrained")));
        helper.setCanHandleSensitiveCases(Boolean.TRUE.equals(body.get("canHandleSensitiveCases")));
        helper.setServiceArea((String) body.get("serviceArea"));
        helper.setSubSpecializations((String) body.get("subSpecializations"));
        helper.setExperienceLevel((String) body.get("experienceLevel"));
        helper.setAvailabilityStatus("AVAILABLE");
        helper.setCurrentActiveCases(0);

        AppUser saved = userRepository.save(helper);
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }
}
