package com.aram.legalaid.dto;

import java.util.List;
import java.util.Map;

public record RegionalAnalyticsDto(
        List<Map<String, Object>> complaintTrend,
        Map<String, Long> statusDistribution,
        Map<String, Long> categoryDistribution,
        Map<String, Long> priorityDistribution,
        Map<String, Long> languageDistribution,
        double resolutionRate,
        List<Map<String, Object>> guideWorkload,
        long slaRisks,
        List<Map<String, Object>> guideRequestTrend,
        List<Map<String, Object>> casesByDate
) {}
