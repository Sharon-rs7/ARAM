package com.aram.legalaid.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @Size(min = 2, max = 100, message = "Name must be 2 to 100 characters")
        String name,

        @Email(message = "Invalid email address")
        String email,

        @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Mobile number must be a valid 10 digit Indian number")
        String mobile,

        @Size(max = 500, message = "Bio must be less than 500 characters")
        String bio,

        @Size(max = 100, message = "District must be less than 100 characters")
        String district,

        @Size(max = 500, message = "Address must be less than 500 characters")
        String address,

        @Size(max = 40, message = "Preferred language must be less than 40 characters")
        String preferredLanguage,

        String gender,
        String specialization,
        com.aram.legalaid.enums.UserStatus status
) {}
