package com.aram.legalaid.dto;

import java.util.Map;

public record AdminDashboardResponse(
        long totalUsers,
        long helperUsers,
        long totalComplaints,
        long submittedComplaints,
        long inProgressComplaints,
        long resolvedComplaints,
        long highPriorityComplaints,
        Map<String, Long> categoryCounts
) {}
