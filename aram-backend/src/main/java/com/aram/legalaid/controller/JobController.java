package com.aram.legalaid.controller;

import com.aram.legalaid.enums.Role;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.Job;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.service.DocumentService;
import com.aram.legalaid.service.JobService;
import com.aram.legalaid.service.UserService;
import com.aram.legalaid.service.RedisNotificationPublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobService jobService;
    private final UserService userService;
    private final DocumentService documentService;
    private final ComplaintRepository complaintRepository;
    private final RedisNotificationPublisher redisNotificationPublisher;
    private final ObjectMapper objectMapper;
    private final com.aram.legalaid.service.AIAnalysisService aiAnalysisService;

    @Value("${app.internal-token:aram-secret-token-2026}")
    private String internalToken;

    public JobController(JobService jobService, UserService userService,
                         DocumentService documentService, ComplaintRepository complaintRepository,
                         RedisNotificationPublisher redisNotificationPublisher,
                         com.aram.legalaid.service.AIAnalysisService aiAnalysisService) {
        this.jobService = jobService;
        this.userService = userService;
        this.documentService = documentService;
        this.complaintRepository = complaintRepository;
        this.redisNotificationPublisher = redisNotificationPublisher;
        this.objectMapper = new ObjectMapper();
        this.aiAnalysisService = aiAnalysisService;
    }

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        User current = userService.currentUser();
        if (current == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (current.getRole() != Role.ADMIN && current.getRole() != Role.SUPER_ADMIN) {
            throw new ForbiddenException("Only admins can list all jobs");
        }
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobStatus(@PathVariable String id) {
        Job job = jobService.getJob(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));

        User current = userService.currentUser();
        if (current == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Apply Job API Security Scoping
        if (current.getRole() == Role.CITIZEN) {
            boolean authorized = false;
            if (current.getId().equals(job.getUserId())) {
                authorized = true;
            } else if (job.getComplaintId() != null) {
                Complaint comp = complaintRepository.findById(job.getComplaintId()).orElse(null);
                if (comp != null && comp.getUser().getId().equals(current.getId())) {
                    authorized = true;
                }
            }
            if (!authorized) {
                throw new ForbiddenException("You are not authorized to access this job status");
            }
        } else if (current.getRole() == Role.HELPER) {
            boolean authorized = false;
            if (job.getComplaintId() != null) {
                Complaint comp = complaintRepository.findById(job.getComplaintId()).orElse(null);
                if (comp != null && comp.getAssignedHelper() != null && comp.getAssignedHelper().getId().equals(current.getId())) {
                    authorized = true;
                }
            }
            if (!authorized) {
                throw new ForbiddenException("You are not authorized to access this job status");
            }
        }

        return ResponseEntity.ok(job);
    }

    @PostMapping("/callback")
    public ResponseEntity<Map<String, String>> callback(
            @RequestHeader(value = "X-Internal-Token", required = false) String token,
            @RequestBody Map<String, String> payload
    ) {
        // Authenticate FastAPI request using internal token
        if (token == null || !token.equals(internalToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Forbidden"));
        }

        String jobId = payload.get("jobId");
        String status = payload.get("status");
        String error = payload.get("error");
        String resultData = payload.get("resultData");

        if (jobId == null || status == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "jobId and status are required"));
        }

        try {
            Job updatedJob = jobService.updateJobStatus(jobId, status, error, resultData);
            
            // Post-processing business logic for OCR task type on COMPLETED / FAILED
            if ("OCR".equalsIgnoreCase(updatedJob.getTaskType())) {
                String metadataJson = updatedJob.getRequestMetadata();
                if (metadataJson != null && !metadataJson.isEmpty()) {
                    Map<String, Object> metadata = objectMapper.readValue(metadataJson, Map.class);
                    Long documentId = ((Number) metadata.get("documentId")).longValue();
                    
                    if ("COMPLETED".equalsIgnoreCase(updatedJob.getStatus())) {
                        if (resultData != null && !resultData.isEmpty()) {
                            Map<String, Object> verifyRes = objectMapper.readValue(resultData, Map.class);
                            documentService.completeOcrJob(documentId, verifyRes);
                        }
                    } else if ("FAILED".equalsIgnoreCase(updatedJob.getStatus())) {
                        documentService.failOcrJob(documentId);
                    }
                }
            }

            // Post-processing business logic for COMPLAINT_ANALYSIS task type on COMPLETED
            if ("COMPLAINT_ANALYSIS".equalsIgnoreCase(updatedJob.getTaskType())) {
                if ("COMPLETED".equalsIgnoreCase(updatedJob.getStatus())) {
                    if (resultData != null && !resultData.isEmpty()) {
                        com.aram.legalaid.dto.AiTriageResponse triageRes = objectMapper.readValue(resultData, com.aram.legalaid.dto.AiTriageResponse.class);
                        Complaint complaint = complaintRepository.findById(updatedJob.getComplaintId())
                                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found: " + updatedJob.getComplaintId()));
                        aiAnalysisService.processAndSaveTriageResult(complaint, triageRes);
                    }
                }
            }

            // Publish real-time notification update to Redis channel
            redisNotificationPublisher.publishNotification(
                "JOB_UPDATE",
                updatedJob.getComplaintId(),
                updatedJob.getUserId(),
                "Job status updated to " + updatedJob.getStatus() + " for task: " + updatedJob.getTaskType()
            );

            return ResponseEntity.ok(Map.of("message", "Job status updated successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
