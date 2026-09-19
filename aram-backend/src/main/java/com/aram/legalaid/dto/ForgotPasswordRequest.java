package com.aram.legalaid.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "Email address or 10-digit mobile number is required")
        String email
) {}
