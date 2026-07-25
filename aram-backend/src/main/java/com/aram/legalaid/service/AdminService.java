package com.aram.legalaid.service;

import com.aram.legalaid.dto.AdminDashboardResponse;
import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.PriorityLevel;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import com.aram.legalaid.model.User;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;

    public AdminService(UserRepository userRepository, ComplaintRepository complaintRepository) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
    }

    public AdminDashboardResponse dashboard() {
        Map<String, Long> categoryCounts = new java.util.LinkedHashMap<>();
        for (ComplaintCategory category : ComplaintCategory.values()) {
            categoryCounts.put(category.getDisplayName(), complaintRepository.countByCategory(category));
        }
        long highPriority = complaintRepository.findAll().stream()
                .filter(c -> c.getPriority() == PriorityLevel.HIGH || c.getPriority() == PriorityLevel.CRITICAL)
                .count();
        return new AdminDashboardResponse(
                userRepository.count(),
                userRepository.findByRole(Role.HELPER).size(),
                complaintRepository.count(),
                complaintRepository.countByStatus(ComplaintStatus.SUBMITTED),
                complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS),
                complaintRepository.countByStatus(ComplaintStatus.RESOLVED),
                highPriority,
                categoryCounts
        );
    }

    public List<Map<String, Object>> getComplaintTrends() {
        List<Complaint> complaints = complaintRepository.findAll();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        Map<String, Long> grouped = new LinkedHashMap<>();
        
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            String monthStr = now.minusMonths(i).format(formatter);
            grouped.put(monthStr, 0L);
        }
        
        for (Complaint c : complaints) {
            if (c.getCreatedAt() != null) {
                String monthStr = c.getCreatedAt().format(formatter);
                if (grouped.containsKey(monthStr)) {
                    grouped.put(monthStr, grouped.get(monthStr) + 1);
                }
            }
        }
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Long> entry : grouped.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("month", entry.getKey());
            point.put("count", entry.getValue());
            result.add(point);
        }
        return result;
    }

    public List<Map<String, Object>> getCategoryDistribution() {
        long total = complaintRepository.count();
        List<Map<String, Object>> result = new ArrayList<>();
        for (ComplaintCategory cat : ComplaintCategory.values()) {
            long count = complaintRepository.countByCategory(cat);
            double percentage = total == 0 ? 0 : ((double) count / total) * 100;
            Map<String, Object> item = new HashMap<>();
            item.put("category", cat.name());
            item.put("displayName", cat.getDisplayName());
            item.put("count", count);
            item.put("percentage", Math.round(percentage * 100.0) / 100.0);
            result.add(item);
        }
        return result;
    }

    public Map<String, Object> getVolunteerWorkload() {
        List<User> volunteers = userRepository.findByRole(Role.HELPER);
        List<Map<String, Object>> volunteerList = new ArrayList<>();
        Map<String, Map<String, Long>> districtStats = new HashMap<>();
        
        for (User v : volunteers) {
            double utilization = v.getMaxActiveCases() == 0 ? 0 : ((double) v.getCurrentActiveCases() / v.getMaxActiveCases()) * 100;
            Map<String, Object> item = new HashMap<>();
            item.put("volunteerId", v.getId());
            item.put("volunteerName", v.getName());
            item.put("district", v.getDistrict() != null ? v.getDistrict() : "Unknown");
            item.put("currentActiveCases", v.getCurrentActiveCases());
            item.put("maxActiveCases", v.getMaxActiveCases());
            item.put("utilization", Math.round(utilization * 100.0) / 100.0);
            volunteerList.add(item);
            
            if (v.getDistrict() != null) {
                districtStats.computeIfAbsent(v.getDistrict(), d -> {
                    Map<String, Long> stats = new HashMap<>();
                    stats.put("current", 0L);
                    stats.put("max", 0L);
                    return stats;
                });
                Map<String, Long> stats = districtStats.get(v.getDistrict());
                stats.put("current", stats.get("current") + v.getCurrentActiveCases());
                stats.put("max", stats.get("max") + v.getMaxActiveCases());
            }
        }
        
        List<Map<String, Object>> districtList = new ArrayList<>();
        for (Map.Entry<String, Map<String, Long>> entry : districtStats.entrySet()) {
            long current = entry.getValue().get("current");
            long max = entry.getValue().get("max");
            double utilization = max == 0 ? 0 : ((double) current / max) * 100;
            Map<String, Object> item = new HashMap<>();
            item.put("district", entry.getKey());
            item.put("currentActiveCases", current);
            item.put("maxActiveCases", max);
            item.put("utilization", Math.round(utilization * 100.0) / 100.0);
            districtList.add(item);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("volunteers", volunteerList);
        result.put("districts", districtList);
        return result;
    }
}
