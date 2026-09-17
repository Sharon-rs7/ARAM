package com.aram.legalaid.dto;

import java.util.Map;

public record RegionalDashboardDto(
        String district,
        long totalCitizens,
        long totalComplaints,
        long activeComplaints,
        long pendingComplaints,
        long resolvedComplaints,
        long totalGuides,
        long availableGuides,
        long pendingGuideRequests,
        long slaRiskCases,
        Map<String, Long> categoryCounts
) {}
