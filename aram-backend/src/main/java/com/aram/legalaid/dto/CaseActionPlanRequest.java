package com.aram.legalaid.dto;

import java.util.List;

public record CaseActionPlanRequest(
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
    String status
) {}
