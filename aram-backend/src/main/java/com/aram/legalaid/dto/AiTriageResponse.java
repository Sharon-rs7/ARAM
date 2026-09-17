package com.aram.legalaid.dto;

import java.util.List;

@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public record AiTriageResponse(
    String category,
    double categoryConfidence,
    List<CategoryProbability> topCategories,
    String priority,
    double priorityConfidence,
    List<String> requiredDocuments,
    String recommendedAuthority,
    double authorityConfidence,
    boolean similarComplaintFound,
    boolean manualReviewRequired,
    List<String> manualReviewReasons,
    String modelVersion,
    boolean fallbackUsed,
    String explanation,
    List<String> nextSteps,
    List<String> detectedIssues,
    List<String> urgencyFlags,
    String complexity,
    String recommendedRouting,
    String detectedLanguage,
    String responseLanguage,
    java.util.Map<String, Object> caseSummary
) {
    public record CategoryProbability(String category, double probability) {}
}
