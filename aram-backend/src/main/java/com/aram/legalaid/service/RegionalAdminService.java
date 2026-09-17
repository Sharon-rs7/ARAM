package com.aram.legalaid.service;

import com.aram.legalaid.dto.RegionalAnalyticsDto;
import com.aram.legalaid.dto.RegionalDashboardDto;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.PriorityLevel;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RegionalAdminService {
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public RegionalAdminService(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    private void validateDistrictAccess(User admin, String targetDistrict) {
        if (admin.getRole() == Role.SUPER_ADMIN) {
            return; // Super Admin has unrestricted statewide access to all 38 districts
        }
        if (admin.getDistrict() != null && ("GLOBAL".equalsIgnoreCase(admin.getDistrict()) || "Statewide".equalsIgnoreCase(admin.getDistrict()))) {
            return; // Global or Statewide admin has access to all districts
        }
        if (admin.getRole() == Role.ADMIN) {
            if (admin.getDistrict() == null || !admin.getDistrict().equalsIgnoreCase(targetDistrict)) {
                throw new ForbiddenException("Access Denied: You are restricted strictly to your assigned district: " + admin.getDistrict());
            }
        }
    }

    public RegionalDashboardDto getDashboardStats(User admin, String district) {
        validateDistrictAccess(admin, district);

        List<Complaint> districtComplaints = complaintRepository.findByDistrictOrderByCreatedAtDesc(district);
        List<User> districtUsers = userRepository.findByDistrict(district);

        long citizens = districtUsers.stream().filter(u -> u.getRole() == Role.CITIZEN).count();
        long totalComplaints = districtComplaints.size();
        long active = districtComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.IN_PROGRESS).count();
        long pending = districtComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.SUBMITTED || c.getStatus() == ComplaintStatus.HELPER_ASSIGNED || c.getStatus() == ComplaintStatus.AI_ANALYZED).count();
        long resolved = districtComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.RESOLVED || c.getStatus() == ComplaintStatus.RESOLVED_BY_GUIDE).count();
        
        List<User> guides = districtUsers.stream().filter(u -> u.getRole() == Role.HELPER).toList();
        long totalGuides = guides.size();
        long availableGuides = guides.stream().filter(g -> "AVAILABLE".equalsIgnoreCase(g.getAvailabilityStatus())).count();

        long pendingGuideRequests = districtComplaints.stream().filter(c -> c.isGuideRequested() && c.getAssignedHelper() == null).count();
        
        // SLA Risk: pending or active cases created more than 48 hours ago
        LocalDateTime threshold = LocalDateTime.now().minusHours(48);
        long slaRiskCases = districtComplaints.stream()
                .filter(c -> c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.CLOSED && c.getStatus() != ComplaintStatus.RESOLVED_BY_GUIDE)
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isBefore(threshold))
                .count();

        Map<String, Long> categoryCounts = districtComplaints.stream()
                .filter(c -> c.getCategory() != null)
                .collect(Collectors.groupingBy(c -> c.getCategory().name(), Collectors.counting()));

        return new RegionalDashboardDto(
                district,
                citizens,
                totalComplaints,
                active,
                pending,
                resolved,
                totalGuides,
                availableGuides,
                pendingGuideRequests,
                slaRiskCases,
                categoryCounts
        );
    }

    public RegionalAnalyticsDto getAnalytics(User admin, String district, String range) {
        validateDistrictAccess(admin, district);

        List<Complaint> allComplaints = complaintRepository.findByDistrictOrderByCreatedAtDesc(district);
        List<User> allUsers = userRepository.findByDistrict(district);
        List<User> guides = allUsers.stream().filter(u -> u.getRole() == Role.HELPER).toList();

        LocalDateTime rangeLimit = resolveRangeLimit(range);

        List<Complaint> rangeComplaints = allComplaints.stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(rangeLimit))
                .toList();

        // 1. Complaint Trend (by date)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> trendMap = rangeComplaints.stream()
                .collect(Collectors.groupingBy(c -> c.getCreatedAt().format(formatter), Collectors.counting()));
        List<Map<String, Object>> trend = trendMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> Map.of("date", e.getKey(), "count", (Object) e.getValue()))
                .collect(Collectors.toList());

        // 2. Status Distribution
        Map<String, Long> statuses = rangeComplaints.stream()
                .filter(c -> c.getStatus() != null)
                .collect(Collectors.groupingBy(c -> c.getStatus().name(), Collectors.counting()));

        // 3. Category Distribution
        Map<String, Long> categories = rangeComplaints.stream()
                .filter(c -> c.getCategory() != null)
                .collect(Collectors.groupingBy(c -> c.getCategory().name(), Collectors.counting()));

        // 4. Priority Distribution
        Map<String, Long> priorities = rangeComplaints.stream()
                .filter(c -> c.getPriority() != null)
                .collect(Collectors.groupingBy(c -> c.getPriority().name(), Collectors.counting()));

        // 5. Language Distribution
        Map<String, Long> languages = rangeComplaints.stream()
                .filter(c -> c.getLanguage() != null)
                .collect(Collectors.groupingBy(c -> c.getLanguage(), Collectors.counting()));

        // 6. Resolution Rate
        long totalClosed = allComplaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED || c.getStatus() == ComplaintStatus.RESOLVED_BY_GUIDE || c.getStatus() == ComplaintStatus.CLOSED)
                .count();
        double resolutionRate = allComplaints.isEmpty() ? 0.0 : ((double) totalClosed / allComplaints.size()) * 100.0;

        // 7. Guide Workload
        List<Map<String, Object>> workload = guides.stream().map(g -> Map.of(
                "name", (Object) g.getName(),
                "activeCases", (Object) g.getCurrentActiveCases(),
                "maxCases", (Object) g.getMaxActiveCases(),
                "utilization", (Object) (g.getMaxActiveCases() > 0 ? ((double) g.getCurrentActiveCases() / g.getMaxActiveCases()) * 100.0 : 0.0)
        )).toList();

        // 8. SLA Risks count in range
        LocalDateTime threshold = LocalDateTime.now().minusHours(48);
        long slaRisks = rangeComplaints.stream()
                .filter(c -> c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.CLOSED && c.getStatus() != ComplaintStatus.RESOLVED_BY_GUIDE)
                .filter(c -> c.getCreatedAt().isBefore(threshold))
                .count();

        // 9. Guide Request Trend (Grouped request dates)
        Map<String, Long> reqTrendMap = rangeComplaints.stream()
                .filter(Complaint::isGuideRequested)
                .collect(Collectors.groupingBy(c -> c.getCreatedAt().format(formatter), Collectors.counting()));
        List<Map<String, Object>> reqTrend = reqTrendMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> Map.of("date", e.getKey(), "requests", (Object) e.getValue()))
                .collect(Collectors.toList());

        // 10. Cases By Date (List details formatted for charts timeline)
        List<Map<String, Object>> casesByDate = rangeComplaints.stream().map(c -> Map.of(
                "id", (Object) c.getId(),
                "title", (Object) c.getTitle(),
                "category", (Object) (c.getCategory() != null ? c.getCategory().name() : "GENERAL"),
                "priority", (Object) (c.getPriority() != null ? c.getPriority().name() : "MEDIUM"),
                "date", (Object) c.getCreatedAt().format(formatter)
        )).toList();

        return new RegionalAnalyticsDto(
                trend,
                statuses,
                categories,
                priorities,
                languages,
                resolutionRate,
                workload,
                slaRisks,
                reqTrend,
                casesByDate
        );
    }

    private LocalDateTime resolveRangeLimit(String range) {
        if ("7d".equalsIgnoreCase(range) || "7 DAYS".equalsIgnoreCase(range)) {
            return LocalDateTime.now().minusDays(7);
        } else if ("30d".equalsIgnoreCase(range) || "30 DAYS".equalsIgnoreCase(range)) {
            return LocalDateTime.now().minusDays(30);
        } else if ("90d".equalsIgnoreCase(range) || "90 DAYS".equalsIgnoreCase(range)) {
            return LocalDateTime.now().minusDays(90);
        } else if ("6m".equalsIgnoreCase(range) || "6 MONTHS".equalsIgnoreCase(range)) {
            return LocalDateTime.now().minusMonths(6);
        } else if ("1y".equalsIgnoreCase(range) || "1 YEAR".equalsIgnoreCase(range)) {
            return LocalDateTime.now().minusYears(1);
        }
        return LocalDateTime.now().minusDays(30); // Default to 30 days
    }
}
