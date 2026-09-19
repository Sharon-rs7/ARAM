package com.aram.legalaid.controller;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {
    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public ResponseEntity<ComplaintResponse> submit(@Valid @RequestBody ComplaintRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(complaintService.submit(request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> myComplaints() {
        return ResponseEntity.ok(complaintService.myComplaints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getById(@PathVariable String id) {
        try {
            Long numericId = Long.parseLong(id);
            return ResponseEntity.ok(complaintService.getById(numericId));
        } catch (NumberFormatException e) {
            return ResponseEntity.ok(complaintService.getByCustomId(id));
        }
    }

    @GetMapping("/custom/{customId}")
    public ResponseEntity<ComplaintResponse> getByCustomId(@PathVariable String customId) {
        return ResponseEntity.ok(complaintService.getByCustomId(customId));
    }

    @PostMapping("/{id}/reanalyze")
    public ResponseEntity<AIResultResponse> reAnalyze(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.reAnalyze(id));
    }

    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<ComplaintResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(complaintService.updateStatus(id, request));
    }

    @PostMapping("/{id}/email-copy")
    public ResponseEntity<java.util.Map<String, Object>> emailCopy(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.emailCopy(id));
    }

    @PostMapping("/check-similarity")
    public ResponseEntity<java.util.Map<String, Object>> checkSimilarity(@RequestBody java.util.Map<String, String> payload) {
        String title = payload.getOrDefault("title", "");
        String description = payload.getOrDefault("description", "");
        return ResponseEntity.ok(complaintService.checkSimilarity(title, description));
    }

    @GetMapping("/{id}/status-pdf")
    public ResponseEntity<byte[]> downloadStatusPdf(@PathVariable Long id) {
        byte[] pdf = complaintService.generateStatusPdf(id);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ARAM_Complaint_" + id + "_Status.pdf\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/{id}/send-whatsapp-pdf")
    public ResponseEntity<java.util.Map<String, Object>> sendWhatsappPdf(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.sendWhatsappPdf(id));
    }
}
