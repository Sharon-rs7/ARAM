package com.aram.legalaid.controller;

import com.aram.legalaid.model.CaseAppointment;
import com.aram.legalaid.model.CaseDocumentRequest;
import com.aram.legalaid.model.CaseFeedback;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.aram.legalaid.service.AdditionalFlowsService;
import com.aram.legalaid.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
public class AdditionalFlowsController {
    private final AdditionalFlowsService additionalFlowsService;
    private final UserService userService;

    public AdditionalFlowsController(AdditionalFlowsService additionalFlowsService, UserService userService) {
        this.additionalFlowsService = additionalFlowsService;
        this.userService = userService;
    }

    // Document Requests
    @GetMapping("/api/documents/requests/complaint/{complaintId}")
    public ResponseEntity<List<CaseDocumentRequest>> getDocumentRequests(@PathVariable Long complaintId) {
        return ResponseEntity.ok(additionalFlowsService.getDocumentRequests(complaintId));
    }

    public record CreateDocReqPayload(Long complaintId, String documentName, String reason) {}

    @PostMapping("/api/documents/requests")
    public ResponseEntity<CaseDocumentRequest> createDocumentRequest(@RequestBody CreateDocReqPayload payload) {
        User user = userService.currentUser();
        return ResponseEntity.ok(additionalFlowsService.createDocumentRequest(
                payload.complaintId(), payload.documentName(), payload.reason(), user));
    }

    public record UploadDocPayload(String documentUrl) {}

    @PutMapping("/api/documents/requests/{id}/upload")
    public ResponseEntity<CaseDocumentRequest> uploadDocument(@PathVariable Long id, @RequestBody(required = false) UploadDocPayload payload) {
        User user = userService.currentUser();
        String url = payload != null ? payload.documentUrl() : null;
        return ResponseEntity.ok(additionalFlowsService.uploadDocument(id, url, user));
    }

    @PutMapping("/api/documents/requests/{id}/verify")
    public ResponseEntity<CaseDocumentRequest> verifyDocument(@PathVariable Long id) {
        User user = userService.currentUser();
        return ResponseEntity.ok(additionalFlowsService.verifyDocument(id, user));
    }

    public record RejectDocPayload(String reason) {}

    @PutMapping("/api/documents/requests/{id}/reject")
    public ResponseEntity<CaseDocumentRequest> rejectDocument(@PathVariable Long id, @RequestBody RejectDocPayload payload) {
        User user = userService.currentUser();
        return ResponseEntity.ok(additionalFlowsService.rejectDocument(id, payload.reason(), user));
    }

    // Call Appointments
    @GetMapping("/api/appointments/complaint/{complaintId}")
    public ResponseEntity<List<CaseAppointment>> getAppointments(@PathVariable Long complaintId) {
        return ResponseEntity.ok(additionalFlowsService.getAppointments(complaintId));
    }

    public record CreateAppointmentPayload(Long complaintId, String mode, String preferredTime, String note) {}

    @PostMapping("/api/appointments")
    public ResponseEntity<CaseAppointment> requestAppointment(@RequestBody CreateAppointmentPayload payload) {
        User user = userService.currentUser();
        return ResponseEntity.ok(additionalFlowsService.requestAppointment(
                payload.complaintId(), payload.mode(), payload.preferredTime(), payload.note(), user));
    }

    public record ScheduleAppointmentPayload(LocalDateTime scheduledAt) {}

    @PutMapping("/api/appointments/{id}/schedule")
    public ResponseEntity<CaseAppointment> scheduleAppointment(@PathVariable Long id, @RequestBody ScheduleAppointmentPayload payload) {
        User user = userService.currentUser();
        return ResponseEntity.ok(additionalFlowsService.scheduleAppointment(id, payload.scheduledAt(), user));
    }

    @PutMapping("/api/appointments/{id}/cancel")
    public ResponseEntity<CaseAppointment> cancelAppointment(@PathVariable Long id) {
        User user = userService.currentUser();
        return ResponseEntity.ok(additionalFlowsService.cancelAppointment(id, user));
    }

    // Feedback
    public record FeedbackPayload(Long complaintId, Integer rating, String comment, boolean helpful) {}

    @PostMapping("/api/feedback")
    public ResponseEntity<CaseFeedback> submitFeedback(@RequestBody FeedbackPayload payload) {
        User user = userService.currentUser();
        return ResponseEntity.ok(additionalFlowsService.submitFeedback(
                payload.complaintId(), payload.rating(), payload.comment(), payload.helpful(), user));
    }

    // Status Workflow Transitions
    public record StatusUpdatePayload(String status, String details) {}

    @PutMapping("/api/complaints/{id}/status-update")
    public ResponseEntity<Complaint> updateStatus(@PathVariable Long id, @RequestBody StatusUpdatePayload payload) {
        User user = userService.currentUser();
        return ResponseEntity.ok(additionalFlowsService.updateComplaintWorkflowStatus(id, payload.status(), payload.details(), user));
    }
}
