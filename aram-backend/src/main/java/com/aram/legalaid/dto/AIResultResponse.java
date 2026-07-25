package com.aram.legalaid.dto;

import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.PriorityLevel;
import java.time.LocalDateTime;
import java.util.List;

public record AIResultResponse(
        Long id,
        ComplaintCategory category,
        String categoryLabel,
        PriorityLevel priority,
        Integer priorityScore,
        Double confidence,
        String recommendedAuthority,
        String reason,
        List<String> requiredDocuments,
        List<String> nextSteps,
        boolean manualReviewRequired,
        LocalDateTime createdAt,
        String detectedLanguage,
        String translatedSummary,
        String spokenSummaryText,
        boolean readAloudAvailable
) {}
