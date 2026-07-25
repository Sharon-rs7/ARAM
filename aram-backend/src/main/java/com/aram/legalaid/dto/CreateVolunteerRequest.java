package com.aram.legalaid.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateVolunteerRequest(
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be 2 to 100 characters")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    String email,

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Mobile number must be a valid 10 digit Indian number")
    String mobile,

    String gender,
    String district,
    String languagesKnown,
    String specializationCategories,
    int maxActiveCases,
    boolean womenSupportTrained,
    boolean canHandleSensitiveCases,
    String serviceArea,
    String subSpecializations,
    String experienceLevel
) {}
