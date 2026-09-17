package com.auth.dto;

import com.auth.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be 2 to 100 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        String email,

        @NotBlank(message = "Mobile number is required")
        @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Mobile number must be a valid 10 digit Indian number")
        String mobile,

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 72, message = "Password must be at least 6 characters")
        String password,

        Role role,
        String gender,
        String specialization,
        String district
) {}
