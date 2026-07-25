package com.aram.legalaid.controller;

import com.aram.legalaid.dto.CaseActionPlanRequest;
import com.aram.legalaid.dto.CaseActionPlanResponse;
import com.aram.legalaid.model.User;
import com.aram.legalaid.service.CaseActionPlanService;
import com.aram.legalaid.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class ActionPlanController {
    private final CaseActionPlanService caseActionPlanService;
    private final UserService userService;

    public ActionPlanController(CaseActionPlanService caseActionPlanService, UserService userService) {
        this.caseActionPlanService = caseActionPlanService;
        this.userService = userService;
    }

    @GetMapping("/api/citizen/complaints/{complaintId}/action-plan")
    public ResponseEntity<CaseActionPlanResponse> getCitizenActionPlan(@PathVariable Long complaintId) {
        User user = userService.currentUser();
        CaseActionPlanResponse response = caseActionPlanService.getPlanByComplaintId(complaintId, user);
        if (response != null && !"SHARED".equals(response.status()) && !"COMPLETED".equals(response.status())) {
            return ResponseEntity.ok(null);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/complaints/{complaintId}/action-plan")
    public ResponseEntity<CaseActionPlanResponse> getAdminActionPlan(@PathVariable Long complaintId) {
        User user = userService.currentUser();
        return ResponseEntity.ok(caseActionPlanService.getPlanByComplaintId(complaintId, user));
    }

    @GetMapping("/api/volunteer/cases/{complaintId}/action-plan")
    public ResponseEntity<CaseActionPlanResponse> getVolunteerActionPlan(@PathVariable Long complaintId) {
        User user = userService.currentUser();
        return ResponseEntity.ok(caseActionPlanService.getPlanByComplaintId(complaintId, user));
    }

    @PostMapping("/api/volunteer/cases/{complaintId}/action-plan")
    public ResponseEntity<CaseActionPlanResponse> createVolunteerActionPlan(
            @PathVariable Long complaintId,
            @RequestBody CaseActionPlanRequest request) {
        User user = userService.currentUser();
        return ResponseEntity.ok(caseActionPlanService.createOrUpdatePlan(complaintId, request, user));
    }

    @PutMapping("/api/volunteer/cases/{complaintId}/action-plan")
    public ResponseEntity<CaseActionPlanResponse> updateVolunteerActionPlan(
            @PathVariable Long complaintId,
            @RequestBody CaseActionPlanRequest request) {
        User user = userService.currentUser();
        return ResponseEntity.ok(caseActionPlanService.createOrUpdatePlan(complaintId, request, user));
    }

    @PostMapping("/api/volunteer/cases/{complaintId}/share-action-plan")
    public ResponseEntity<CaseActionPlanResponse> shareVolunteerActionPlan(@PathVariable Long complaintId) {
        User user = userService.currentUser();
        return ResponseEntity.ok(caseActionPlanService.sharePlan(complaintId, user));
    }
}
