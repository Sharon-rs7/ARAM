package com.aram.legalaid.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.aram.legalaid.enums.HelperGender;
import com.aram.legalaid.enums.IdentityVisibility;
import com.aram.legalaid.enums.InputMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ComplaintRequest(
        @NotBlank(message = "Complaint title is required")
        @Size(min = 5, max = 150, message = "Title must be 5 to 150 characters")
        String title,

        @NotBlank(message = "Complaint description is required")
        @Size(min = 20, max = 5000, message = "Description must be 20 to 5000 characters")
        String description,

        @NotBlank(message = "Language is required")
        String language,

        @Size(max = 100, message = "District must be less than 100 characters")
        String district,

        @NotNull(message = "Input mode is required")
        InputMode inputMode,

        String transcribedText,
        Double transcriptionConfidence,
        @JsonAlias("isSensitive")
        Boolean sensitive,
        HelperGender preferredHelperGender,
        IdentityVisibility identityVisibility,
        Boolean disclaimerAccepted,
        String safeContactMethod,
        String safeContactTime,
        String category,
        String priority,
        String citizenOpinion,
        String additionalDetails,
        String submissionMode
) {}
