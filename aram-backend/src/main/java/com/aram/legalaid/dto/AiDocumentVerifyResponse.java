package com.aram.legalaid.dto;

import java.util.List;
import java.util.Map;

public record AiDocumentVerifyResponse(
    String documentType,
    String ocrTextMasked,
    double ocrConfidence,
    double imageQualityScore,
    double verificationScore,
    String status,
    List<String> reasons,
    List<String> errors,
    List<String> warnings,
    Map<String, Object> extractedFields,
    String engine,
    String modelVersion
) {}
