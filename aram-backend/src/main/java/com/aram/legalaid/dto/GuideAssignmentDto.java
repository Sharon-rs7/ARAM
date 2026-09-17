package com.aram.legalaid.dto;

public record GuideAssignmentDto(
        Long legalGuideId,
        String overrideReason,
        String adminNote
) {}
