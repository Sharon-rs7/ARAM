package com.aram.legalaid.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CaseActionPlanResponse(
    Long id,
    Long complaintId,
    Long legalGuideId,
    Long adminId,
    String summary,
    List<String> immediateSteps,
    List<String> documentChecklist,
    String recommendedAuthorityName,
    String authorityCategory,
    boolean visitRequired,
    boolean onlineSubmissionAvailable,
    String expectedTimeline,
    String safetyNote,
    String legalGuideNote,
    String status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
