package com.aram.legalaid.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiDocumentVerifyResponse(
    String documentType,
    String ocrTextMasked,
    String exactText,
    String extractedText,
    double ocrConfidence,
    double imageQualityScore,
    double verificationScore,
    Integer readinessScore,
    String clarityScore,
    String status,
    List<String> reasons,
    List<String> errors,
    List<String> warnings,
    Map<String, Object> extractedFields,
    List<String> detectedDates,
    List<String> detectedReferenceNumbers,
    List<String> detectedParties,
    Boolean sealOrSignatureDetected,
    String legalRelevance,
    String evidenceSummary,
    String evidentiaryStrength,
    String actionableAdvice,
    Map<String, Object> evidenceAnalysis,
    String recommendations,
    String engine,
    String modelVersion
) {
    public AiDocumentVerifyResponse(
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
    ) {
        this(
            documentType,
            ocrTextMasked,
            ocrTextMasked,
            ocrTextMasked,
            ocrConfidence,
            imageQualityScore,
            verificationScore,
            (int)(verificationScore * 100),
            imageQualityScore >= 0.75 ? "High Quality" : "Acceptable",
            status,
            reasons,
            errors,
            warnings,
            extractedFields,
            List.of(),
            List.of(),
            List.of(),
            false,
            reasons != null && !reasons.isEmpty() ? String.join("; ", reasons) : "Evidence analyzed",
            documentType + " verified",
            "STRONG",
            "Keep original document safe.",
            Map.of(),
            "Document verified.",
            engine,
            modelVersion
        );
    }
}
