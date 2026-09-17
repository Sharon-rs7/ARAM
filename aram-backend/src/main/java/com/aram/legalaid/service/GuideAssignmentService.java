package com.aram.legalaid.service;

import com.aram.legalaid.dto.GuideAssignmentDto;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class GuideAssignmentService {
    private final CaseCommunicationService caseCommunicationService;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public GuideAssignmentService(
            CaseCommunicationService caseCommunicationService,
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            AuditLogService auditLogService
    ) {
        this.caseCommunicationService = caseCommunicationService;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<Map<String, Object>> getRecommendedGuides(Long complaintId, User admin) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        // Enforce Regional Admin Scope
        if (admin.getRole() == Role.ADMIN && admin.getDistrict() != null && !admin.getDistrict().equalsIgnoreCase("GLOBAL")) {
            if (complaint.getDistrict() == null || !complaint.getDistrict().equalsIgnoreCase(admin.getDistrict())) {
                throw new ForbiddenException("Unauthorized: Regional Admin cannot access complaints from other districts");
            }
        }

        return caseCommunicationService.getRecommendedGuides(complaintId);
    }

    @Transactional
    public Map<String, Object> assignGuide(Long complaintId, Long guideId, GuideAssignmentDto dto, User admin) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        User guide = userRepository.findById(guideId)
                .orElseThrow(() -> new ResourceNotFoundException("Legal Guide not found"));

        // Enforce Regional Admin Scope constraints on both Complaint and Guide
        if (admin.getRole() == Role.ADMIN && admin.getDistrict() != null && !admin.getDistrict().equalsIgnoreCase("GLOBAL")) {
            String adminDistrict = admin.getDistrict();
            
            if (complaint.getDistrict() == null || !complaint.getDistrict().equalsIgnoreCase(adminDistrict)) {
                throw new ForbiddenException("Unauthorized: Regional Admin cannot assign guides to cases outside their district");
            }
            
            if (guide.getDistrict() == null || !guide.getDistrict().equalsIgnoreCase(adminDistrict)) {
                throw new ForbiddenException("Unauthorized: Regional Admin can only assign guides registered in their district");
            }
        }

        Map<String, Object> result = caseCommunicationService.assignLegalGuide(
                complaintId,
                guideId,
                dto.overrideReason(),
                dto.adminNote()
        );

        // Explicit Audit Log Entry for Sensitive Assignment decisions
        if (complaint.isSensitive() || complaint.isWomenSensitive()) {
            auditLogService.log(
                    "SENSITIVE_CASE_ASSIGNMENT",
                    admin.getEmail(),
                    "Supervised Sensitive case ARAM-" + complaintId + " assignment to Guide " + guide.getEmail()
            );
        }

        return result;
    }
}
