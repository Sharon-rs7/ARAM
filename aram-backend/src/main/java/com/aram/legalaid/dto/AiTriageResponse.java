package com.aram.legalaid.dto;

import java.util.List;

public record AiTriageResponse(
    String category,
    String priority,
    int priorityScore,
    double confidence,
    String recommendedAuthority,
    double authorityConfidence,
    List<String> requiredDocuments,
    double documentConfidence,
    List<String> nextSteps,
    boolean manualReviewRequired,
    boolean modelBased
) {}
