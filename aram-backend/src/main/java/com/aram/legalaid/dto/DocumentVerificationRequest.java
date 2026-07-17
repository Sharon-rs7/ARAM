package com.aram.legalaid.dto;

import com.aram.legalaid.enums.VerificationStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record DocumentVerificationRequest(
        @NotNull(message = "Verification status is required")
        VerificationStatus verificationStatus,
        String predictedDocumentType,
        @DecimalMin(value = "0.0", message = "Verification score must be >= 0")
        @DecimalMax(value = "1.0", message = "Verification score must be <= 1")
        Double verificationScore
) {}
