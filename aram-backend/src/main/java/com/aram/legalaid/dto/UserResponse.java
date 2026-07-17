package com.aram.legalaid.dto;

import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.ThemePreference;
import com.aram.legalaid.enums.UserStatus;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String name,
        String email,
        String mobile,
        Role role,
        UserStatus status,
        String gender,
        String specialization,
        boolean helperVerified,
        String avatarUrl,
        String bio,
        String district,
        String address,
        String preferredLanguage,
        ThemePreference themePreference,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime lastLogin
) {}
