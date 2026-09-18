package com.aram.legalaid.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleAuthRequest(
        @NotBlank(message = "Google email is required")
        String email,
        String name,
        String avatarUrl,
        String googleId,
        String role,
        String district
) {}
