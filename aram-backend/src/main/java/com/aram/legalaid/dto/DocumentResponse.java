package com.aram.legalaid.dto;

import com.aram.legalaid.enums.VerificationStatus;
import java.time.LocalDateTime;

public record DocumentResponse(
        Long id,
        Long complaintId,
        String fileName,
        String fileType,
        VerificationStatus verificationStatus,
        String predictedDocumentType,
        Double verificationScore,
        LocalDateTime uploadedAt
) {}
