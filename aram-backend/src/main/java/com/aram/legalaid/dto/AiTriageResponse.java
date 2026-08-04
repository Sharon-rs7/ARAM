package com.aram.legalaid.dto;

import java.util.List;

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
    List<String> nextSteps
) {
    public record CategoryProbability(String category, double probability) {}
}
