package com.aram.legalaid.dto;

import com.aram.legalaid.enums.Role;
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
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).+$", message = "Password must be at least 8 characters and include uppercase, lowercase, number and special character")
        String password,

        Role role,
        String gender,
        String specialization
) {}
