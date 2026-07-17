package com.aram.legalaid.dto;

import java.util.List;

public record AiDocumentVerifyResponse(
    String documentType,
    String ocrTextMasked,
    double ocrConfidence,
    double cnnConfidence,
    double keywordScore,
    double finalScore,
    String status,
    List<String> matchedKeywords,
    List<String> missingKeywords
) {}
