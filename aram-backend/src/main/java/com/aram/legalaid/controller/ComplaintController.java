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
    public ResponseEntity<ComplaintResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getById(id));
    }

    @PostMapping("/{id}/reanalyze")
    public ResponseEntity<AIResultResponse> reAnalyze(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.reAnalyze(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(complaintService.updateStatus(id, request));
    }

    @PostMapping("/check-similarity")
    public ResponseEntity<java.util.Map<String, Object>> checkSimilarity(@RequestBody java.util.Map<String, String> payload) {
        String title = payload.getOrDefault("title", "");
        String description = payload.getOrDefault("description", "");
        return ResponseEntity.ok(complaintService.checkSimilarity(title, description));
    }
}
