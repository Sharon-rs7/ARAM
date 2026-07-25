package com.aram.legalaid.service;

import com.aram.legalaid.dto.CaseActionPlanRequest;
import com.aram.legalaid.dto.CaseActionPlanResponse;
import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.NotificationType;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.CaseActionPlan;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.CaseActionPlanRepository;
import com.aram.legalaid.repository.ComplaintRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class CaseActionPlanService {
    private final CaseActionPlanRepository caseActionPlanRepository;
    private final ComplaintRepository complaintRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public CaseActionPlanService(
            CaseActionPlanRepository caseActionPlanRepository,
            ComplaintRepository complaintRepository,
            AuditLogService auditLogService,
            NotificationService notificationService
    ) {
        this.caseActionPlanRepository = caseActionPlanRepository;
        this.complaintRepository = complaintRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    public CaseActionPlanResponse getPlanByComplaintId(Long complaintId, User currentUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        // Access control:
        // - Admin can access all
        // - Public User (Citizen) can access only own
        // - Assigned Legal Guide (Helper) can access only assigned
        if (currentUser.getRole() != Role.ADMIN) {
            if (currentUser.getRole() == Role.CITIZEN) {
                if (!complaint.getUser().getId().equals(currentUser.getId())) {
                    throw new ForbiddenException("You can only access your own complaint's action plan");
                }
            } else if (currentUser.getRole() == Role.HELPER) {
                if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(currentUser.getId())) {
                    throw new ForbiddenException("You can only access action plans of complaints assigned to you");
                }
            } else {
                throw new ForbiddenException("Access Denied");
            }
        }

        Optional<CaseActionPlan> planOpt = caseActionPlanRepository.findByComplaintId(complaintId);
        if (planOpt.isEmpty()) {
            return null; // Return null if plan doesn't exist yet
        }

        return toResponse(planOpt.get());
    }

    @Transactional
    public CaseActionPlanResponse createOrUpdatePlan(Long complaintId, CaseActionPlanRequest request, User currentUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        // Access control:
        // - Only assigned Legal Guide (Helper) or Admin can create/update action plans
        if (currentUser.getRole() != Role.ADMIN) {
            if (currentUser.getRole() != Role.HELPER) {
                throw new ForbiddenException("Only Legal Guides or Admins can modify action plans");
            }
            if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You can only modify action plans for complaints assigned to you");
            }
        }

        Optional<CaseActionPlan> planOpt = caseActionPlanRepository.findByComplaintId(complaintId);
        CaseActionPlan plan = planOpt.orElseGet(CaseActionPlan::new);

        plan.setComplaintId(complaintId);
        if (plan.getLegalGuideId() == null) {
            plan.setLegalGuideId(complaint.getAssignedHelper() != null ? complaint.getAssignedHelper().getId() : currentUser.getId());
        }
        if (currentUser.getRole() == Role.ADMIN) {
            plan.setAdminId(currentUser.getId());
        }

        plan.setSummary(request.summary());
        plan.setImmediateSteps(request.immediateSteps() != null ? String.join("\n", request.immediateSteps()) : "");
        plan.setDocumentChecklist(request.documentChecklist() != null ? String.join("\n", request.documentChecklist()) : "");
        plan.setRecommendedAuthorityName(request.recommendedAuthorityName());
        
        if (request.authorityCategory() != null) {
            try {
                plan.setAuthorityCategory(ComplaintCategory.valueOf(request.authorityCategory().toUpperCase()));
            } catch (IllegalArgumentException e) {
                plan.setAuthorityCategory(ComplaintCategory.GENERAL_LEGAL_AID);
            }
        }

        plan.setVisitRequired(request.visitRequired());
        plan.setOnlineSubmissionAvailable(request.onlineSubmissionAvailable());
        plan.setExpectedTimeline(request.expectedTimeline());
        plan.setSafetyNote(request.safetyNote());
        plan.setLegalGuideNote(request.legalGuideNote());

        String previousStatus = plan.getStatus();
        String newStatus = request.status() != null ? request.status().toUpperCase() : "DRAFT";
        plan.setStatus(newStatus);

        CaseActionPlan saved = caseActionPlanRepository.save(plan);

        // Share action plan workflow trigger
        if ("SHARED".equals(newStatus) && !"SHARED".equals(previousStatus)) {
            // Update status and audit log
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
            complaintRepository.save(complaint);

            auditLogService.log("ACTION_PLAN_SHARED", currentUser.getEmail(), "Action plan shared for complaint ID " + complaintId);
            
            // Format complaint ID as ARAM-2026-000123
            String formattedId = String.format("ARAM-2026-%06d", complaintId);
            notificationService.create(
                    complaint.getUser(),
                    "Your Legal Guide has shared next steps for complaint " + formattedId + ".",
                    NotificationType.IN_APP
            );
        } else {
            auditLogService.log("ACTION_PLAN_UPDATED", currentUser.getEmail(), "Action plan saved as " + newStatus + " for complaint ID " + complaintId);
        }

        return toResponse(saved);
    }

    @Transactional
    public CaseActionPlanResponse sharePlan(Long complaintId, User currentUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        if (currentUser.getRole() != Role.ADMIN) {
            if (currentUser.getRole() != Role.HELPER) {
                throw new ForbiddenException("Only Legal Guides or Admins can share action plans");
            }
            if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You can only share action plans for complaints assigned to you");
            }
        }

        CaseActionPlan plan = caseActionPlanRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("No action plan found to share for complaint id: " + complaintId));

        plan.setStatus("SHARED");
        CaseActionPlan saved = caseActionPlanRepository.save(plan);

        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        complaintRepository.save(complaint);

        auditLogService.log("ACTION_PLAN_SHARED", currentUser.getEmail(), "Action plan shared for complaint ID " + complaintId);

        String formattedId = String.format("ARAM-2026-%06d", complaintId);
        notificationService.create(
                complaint.getUser(),
                "Your Legal Guide has shared next steps for complaint " + formattedId + ".",
                NotificationType.IN_APP
        );

        return toResponse(saved);
    }

    private CaseActionPlanResponse toResponse(CaseActionPlan plan) {
        List<String> steps = plan.getImmediateSteps() != null && !plan.getImmediateSteps().trim().isEmpty()
                ? Arrays.asList(plan.getImmediateSteps().split("\n"))
                : Collections.emptyList();

        List<String> checklist = plan.getDocumentChecklist() != null && !plan.getDocumentChecklist().trim().isEmpty()
                ? Arrays.asList(plan.getDocumentChecklist().split("\n"))
                : Collections.emptyList();

        return new CaseActionPlanResponse(
                plan.getId(),
                plan.getComplaintId(),
                plan.getLegalGuideId(),
                plan.getAdminId(),
                plan.getSummary(),
                steps,
                checklist,
                plan.getRecommendedAuthorityName(),
                plan.getAuthorityCategory() != null ? plan.getAuthorityCategory().name() : null,
                plan.isVisitRequired(),
                plan.isOnlineSubmissionAvailable(),
                plan.getExpectedTimeline(),
                plan.getSafetyNote(),
                plan.getLegalGuideNote(),
                plan.getStatus(),
                plan.getCreatedAt(),
                plan.getUpdatedAt()
        );
    }
}
