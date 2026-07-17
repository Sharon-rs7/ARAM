package com.aram.legalaid.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email or mobile is required")
        String username,

        @NotBlank(message = "Password is required")
        String password
) {}
