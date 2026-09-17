package com.aram.legalaid.controller;

import com.aram.legalaid.model.CaseMessage;
import com.aram.legalaid.model.LegalGuideCaseNote;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.service.CaseCommunicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CaseCommunicationController {

    private final CaseCommunicationService communicationService;

    public CaseCommunicationController(CaseCommunicationService communicationService) {
        this.communicationService = communicationService;
    }

    // Admin Assign
    @PostMapping("/admin/complaints/{complaintId}/assign-legal-guide")
    public ResponseEntity<Map<String, Object>> assignLegalGuide(
            @PathVariable Long complaintId,
            @RequestBody Map<String, Object> body) {
        Long legalGuideId = Long.valueOf(body.get("legalGuideId").toString());
        String overrideReason = body.getOrDefault("overrideReason", "").toString();
        String adminNote = body.getOrDefault("adminNote", "").toString();

        Map<String, Object> res = communicationService.assignLegalGuide(complaintId, legalGuideId, overrideReason, adminNote);
        return ResponseEntity.ok(res);
    }

    // Admin Recommendations
    @GetMapping({"/admin/complaints/{complaintId}/recommended-guides", "/admin/complaints/{complaintId}/recommend-guide", "/admin/cases/{complaintId}/recommend-guide"})
    public ResponseEntity<List<Map<String, Object>>> getRecommendedGuides(@PathVariable Long complaintId) {
        return ResponseEntity.ok(communicationService.getRecommendedGuides(complaintId));
    }

    // Messages Get
    @GetMapping({"/cases/{complaintId}/messages", "/complaints/{complaintId}/messages", "/volunteer/cases/{complaintId}/messages"})
    public ResponseEntity<List<CaseMessage>> getMessages(@PathVariable Long complaintId) {
        return ResponseEntity.ok(communicationService.getChatMessages(complaintId));
    }

    // Messages Post
    @PostMapping({"/cases/{complaintId}/messages", "/complaints/{complaintId}/messages", "/volunteer/cases/{complaintId}/messages"})
    public ResponseEntity<CaseMessage> sendMessage(
            @PathVariable Long complaintId,
            @RequestBody Map<String, String> body) {
        String messageText = body.get("messageText");
        String messageType = body.getOrDefault("messageType", "TEXT");
        String fileReference = body.getOrDefault("fileReference", null);

        CaseMessage msg = communicationService.sendMessage(complaintId, messageText, messageType, fileReference);
        return ResponseEntity.ok(msg);
    }

    // Messages Read status
    @PutMapping("/cases/messages/{messageId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long messageId) {
        communicationService.markMessageAsRead(messageId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // Get Case Notes (Guides and Admin)
    @GetMapping("/cases/{complaintId}/notes")
    public ResponseEntity<List<LegalGuideCaseNote>> getCaseNotes(@PathVariable Long complaintId) {
        return ResponseEntity.ok(communicationService.getCaseNotes(complaintId));
    }

    // Add Case Notes
    @PostMapping("/volunteer/cases/{complaintId}/notes")
    public ResponseEntity<LegalGuideCaseNote> addCaseNote(
            @PathVariable Long complaintId,
            @RequestBody Map<String, String> body) {
        String noteText = body.get("noteText");
        String visibility = body.getOrDefault("visibility", "PRIVATE");
        return ResponseEntity.ok(communicationService.addCaseNote(complaintId, noteText, visibility));
    }

    // Update Status
    @PutMapping("/volunteer/cases/{complaintId}/status")
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable Long complaintId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(communicationService.updateStatus(complaintId, status));
    }

    // Request Documents
    @PostMapping("/volunteer/cases/{complaintId}/request-documents")
    public ResponseEntity<Map<String, Object>> requestDocuments(
            @PathVariable Long complaintId,
            @RequestBody Map<String, String> body) {
        String documentName = body.get("documentName");
        communicationService.requestDocuments(complaintId, documentName);
        return ResponseEntity.ok(Map.of("success", true, "message", "Document request sent successfully"));
    }

    // Escalate Case
    @PostMapping({"/volunteer/cases/{complaintId}/escalate", "/cases/{complaintId}/escalate"})
    public ResponseEntity<Map<String, Object>> escalateCase(
            @PathVariable Long complaintId,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        communicationService.escalateCase(complaintId, reason);
        return ResponseEntity.ok(Map.of("success", true, "message", "Case escalated to Admin"));
    }

    // Acknowledge Case
    @PostMapping({"/volunteer/cases/{complaintId}/acknowledge", "/cases/{complaintId}/acknowledge"})
    public ResponseEntity<Map<String, Object>> acknowledgeCase(@PathVariable Long complaintId) {
        communicationService.acknowledgeComplaint(complaintId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Case acknowledged successfully"));
    }

    // Resolve Case
    @PostMapping({"/volunteer/cases/{complaintId}/resolve", "/cases/{complaintId}/resolve", "/helper/cases/{complaintId}/resolve"})
    public ResponseEntity<Map<String, Object>> resolveCase(
            @PathVariable Long complaintId,
            @RequestBody(required = false) Map<String, String> body) {
        String resolutionSummary = body != null ? body.get("resolutionSummary") : null;
        String resolutionType = body != null ? body.get("resolutionType") : null;
        Complaint res = communicationService.resolveCase(complaintId, resolutionSummary, resolutionType);
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", res.getId());
        map.put("complaintCustomId", res.getComplaintCustomId());
        map.put("status", res.getStatus().name());
        map.put("resolutionType", res.getResolutionType());
        map.put("resolutionSummary", res.getResolutionSummary());
        map.put("resolvedAt", res.getResolvedAt());
        return ResponseEntity.ok(map);
    }
}
