package com.aram.legalaid.controller;

import com.aram.legalaid.dto.DocumentResponse;
import com.aram.legalaid.dto.DocumentVerificationRequest;
import com.aram.legalaid.dto.AiDocumentVerifyResponse;
import com.aram.legalaid.enums.VerificationStatus;
import com.aram.legalaid.model.DocumentVerificationResult;
import com.aram.legalaid.service.DocumentService;
import com.aram.legalaid.service.AIClientService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class DocumentController {
    private final DocumentService documentService;
    private final AIClientService aiClientService;

    public DocumentController(DocumentService documentService, AIClientService aiClientService) {
        this.documentService = documentService;
        this.aiClientService = aiClientService;
    }

    // --- Core Legacy mappings ---
    @PostMapping(value = "/api/documents/verify-ai", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AiDocumentVerifyResponse> verifyAi(
            @RequestParam("file") MultipartFile file,
            @RequestParam("expectedDocumentType") String expectedType,
            @RequestParam("complaintCategory") String category
    ) {
        return ResponseEntity.ok(aiClientService.verifyDocument(file, expectedType, category));
    }

    @PostMapping(value = "/api/documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponse> upload(@RequestParam Long complaintId, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(documentService.upload(complaintId, file));
    }

    @GetMapping("/api/documents/complaint/{complaintId}")
    public ResponseEntity<List<DocumentResponse>> byComplaint(@PathVariable Long complaintId) {
        return ResponseEntity.ok(documentService.byComplaint(complaintId));
    }

    @PutMapping("/api/documents/{documentId}/verification")
    public ResponseEntity<DocumentResponse> updateVerification(@PathVariable Long documentId, @Valid @RequestBody DocumentVerificationRequest request) {
        return ResponseEntity.ok(documentService.updateVerification(documentId, request));
    }

    @GetMapping("/api/documents/download/{id}")
    public ResponseEntity<org.springframework.core.io.Resource> download(@PathVariable Long id) {
        java.nio.file.Path path = documentService.getSecureDocumentPath(id);
        try {
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(path.toUri());
            String contentType = java.nio.file.Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + path.getFileName().toString() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // --- New Public Citizen mappings ---
    @PostMapping(value = "/api/citizen/complaints/{complaintId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponse> citizenUpload(@PathVariable Long complaintId, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(documentService.upload(complaintId, file));
    }

    @GetMapping("/api/citizen/complaints/{complaintId}/documents")
    public ResponseEntity<List<DocumentResponse>> citizenByComplaint(@PathVariable Long complaintId) {
        return ResponseEntity.ok(documentService.byComplaint(complaintId));
    }

    // --- New Legal Guide / Volunteer mappings ---
    @GetMapping("/api/volunteer/cases/{complaintId}/documents")
    public ResponseEntity<List<DocumentResponse>> volunteerByComplaint(@PathVariable Long complaintId) {
        return ResponseEntity.ok(documentService.byComplaint(complaintId));
    }

    @PutMapping("/api/volunteer/documents/{documentId}/verify")
    public ResponseEntity<DocumentResponse> volunteerVerifyDocument(@PathVariable Long documentId) {
        DocumentVerificationRequest req = new DocumentVerificationRequest(
                VerificationStatus.VERIFIED, "Verified by Legal Guide", 1.0
        );
        return ResponseEntity.ok(documentService.updateVerification(documentId, req));
    }

    @PutMapping("/api/volunteer/documents/{documentId}/reject")
    public ResponseEntity<DocumentResponse> volunteerRejectDocument(@PathVariable Long documentId) {
        DocumentVerificationRequest req = new DocumentVerificationRequest(
                VerificationStatus.REJECTED, "Rejected by Legal Guide", 0.0
        );
        return ResponseEntity.ok(documentService.updateVerification(documentId, req));
    }

    // --- New Admin mappings ---
    @GetMapping("/api/admin/complaints/{complaintId}/documents")
    public ResponseEntity<List<DocumentResponse>> adminByComplaint(@PathVariable Long complaintId) {
        return ResponseEntity.ok(documentService.byComplaint(complaintId));
    }

    @GetMapping("/api/admin/documents/{documentId}/verification")
    public ResponseEntity<DocumentVerificationResult> adminGetVerification(@PathVariable Long documentId) {
        return ResponseEntity.ok(documentService.getVerificationResult(documentId));
    }

    @PutMapping("/api/admin/documents/{documentId}/manual-verify")
    public ResponseEntity<DocumentResponse> adminManualVerify(@PathVariable Long documentId) {
        DocumentVerificationRequest req = new DocumentVerificationRequest(
                VerificationStatus.VERIFIED, "Manually verified by Admin", 1.0
        );
        return ResponseEntity.ok(documentService.updateVerification(documentId, req));
    }

    @PutMapping("/api/admin/documents/{documentId}/reject")
    public ResponseEntity<DocumentResponse> adminReject(@PathVariable Long documentId) {
        DocumentVerificationRequest req = new DocumentVerificationRequest(
                VerificationStatus.REJECTED, "Rejected by Admin", 0.0
        );
        return ResponseEntity.ok(documentService.updateVerification(documentId, req));
    }

    // --- New AI OCR Verify Trigger Proxy mapping ---
    @PostMapping("/api/documents/{documentId}/ocr-verify")
    public ResponseEntity<DocumentResponse> ocrVerifyDocument(@PathVariable Long documentId) {
        return ResponseEntity.ok(documentService.ocrVerify(documentId));
    }
}
