package com.aram.legalaid.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInMinutes,
        UserResponse user
) {}
