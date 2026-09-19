package com.aram.legalaid.controller;

import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicMetricsController {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public PublicMetricsController(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getPublicMetrics() {
        Map<String, Object> metrics = new LinkedHashMap<>();

        long total = complaintRepository.count();
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        long inReview = complaintRepository.countByStatus(ComplaintStatus.UNDER_REVIEW)
                + complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        long helpers = userRepository.countByRole(Role.HELPER);

        metrics.put("totalComplaints", Math.max(total, 0));
        metrics.put("activeInReview", Math.max(inReview, 0));
        metrics.put("resolvedCases", Math.max(resolved, 0));
        metrics.put("legalGuides", Math.max(helpers, 0));
        metrics.put("districtsCovered", 38);
        metrics.put("updatedAt", LocalDateTime.now().toString());
        metrics.put("source", "ARAM Statewide Central Civic Registry");

        return ResponseEntity.ok(metrics);
    }
}
