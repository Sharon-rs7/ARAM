package com.aram.legalaid.controller;

import com.aram.legalaid.dto.DocumentResponse;
import com.aram.legalaid.dto.DocumentVerificationRequest;
import com.aram.legalaid.service.DocumentService;
import com.aram.legalaid.dto.AiDocumentVerifyResponse;
import com.aram.legalaid.service.AIClientService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    private final DocumentService documentService;
    private final AIClientService aiClientService;

    public DocumentController(DocumentService documentService, AIClientService aiClientService) {
        this.documentService = documentService;
        this.aiClientService = aiClientService;
    }

    @PostMapping(value = "/verify-ai", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AiDocumentVerifyResponse> verifyAi(
            @RequestParam("file") MultipartFile file,
            @RequestParam("expectedDocumentType") String expectedType,
            @RequestParam("complaintCategory") String category
    ) {
        return ResponseEntity.ok(aiClientService.verifyDocument(file, expectedType, category));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponse> upload(@RequestParam Long complaintId, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(documentService.upload(complaintId, file));
    }

    @GetMapping("/complaint/{complaintId}")
    public ResponseEntity<List<DocumentResponse>> byComplaint(@PathVariable Long complaintId) {
        return ResponseEntity.ok(documentService.byComplaint(complaintId));
    }

    @PutMapping("/{documentId}/verification")
    public ResponseEntity<DocumentResponse> updateVerification(@PathVariable Long documentId, @Valid @RequestBody DocumentVerificationRequest request) {
        return ResponseEntity.ok(documentService.updateVerification(documentId, request));
    }
}
