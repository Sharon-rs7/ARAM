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

import java.util.EnumMap;
import java.util.Map;

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
}
