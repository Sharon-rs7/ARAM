package com.aram.legalaid.service;

import com.aram.legalaid.enums.*;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.*;
import com.aram.legalaid.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;


@Service
public class AdditionalFlowsService {
    private final CaseDocumentRequestRepository caseDocumentRequestRepository;
    private final CaseAppointmentRepository caseAppointmentRepository;
    private final CaseFeedbackRepository caseFeedbackRepository;
    private final ComplaintRepository complaintRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final LegalGuideLevelService levelService;
    private final LegalGuideEloHistoryRepository eloHistoryRepository;
    private final LegalGuidePerformanceProfileRepository performanceProfileRepository;
    private final AIResultRepository aiResultRepository;
    private final AIClientService aiClientService;

    public AdditionalFlowsService(
            CaseDocumentRequestRepository caseDocumentRequestRepository,
            CaseAppointmentRepository caseAppointmentRepository,
            CaseFeedbackRepository caseFeedbackRepository,
            ComplaintRepository complaintRepository,
            AuditLogService auditLogService,
            NotificationService notificationService,
            LegalGuideLevelService levelService,
            LegalGuideEloHistoryRepository eloHistoryRepository,
            LegalGuidePerformanceProfileRepository performanceProfileRepository,
            AIResultRepository aiResultRepository,
            AIClientService aiClientService
    ) {
        this.caseDocumentRequestRepository = caseDocumentRequestRepository;
        this.caseAppointmentRepository = caseAppointmentRepository;
        this.caseFeedbackRepository = caseFeedbackRepository;
        this.complaintRepository = complaintRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
        this.levelService = levelService;
        this.eloHistoryRepository = eloHistoryRepository;
        this.performanceProfileRepository = performanceProfileRepository;
        this.aiResultRepository = aiResultRepository;
        this.aiClientService = aiClientService;
    }

    // Document Requests
    public List<CaseDocumentRequest> getDocumentRequests(Long complaintId) {
        return caseDocumentRequestRepository.findByComplaintId(complaintId);
    }

    @Transactional
    public CaseDocumentRequest createDocumentRequest(Long complaintId, String documentName, String reason, User currentUser) {
        Complaint complaint = getComplaintAndVerifyAccess(complaintId, currentUser, true);

        CaseDocumentRequest req = new CaseDocumentRequest();
        req.setComplaintId(complaintId);
        req.setLegalGuideId(complaint.getAssignedHelper() != null ? complaint.getAssignedHelper().getId() : currentUser.getId());
        req.setDocumentName(documentName);
        req.setReason(reason);
        req.setRequired(true);
        req.setStatus("REQUESTED");

        CaseDocumentRequest saved = caseDocumentRequestRepository.save(req);

        // Award credit
        levelService.addCredit(saved.getLegalGuideId(), complaintId, "DOCUMENT_REQUEST_CREATED", 5, "Requested document: " + documentName, currentUser.getId(), currentUser.getRole().name(), "SYSTEM");

        // Update status of complaint to documents pending
        complaint.setStatus(ComplaintStatus.DOCUMENTS_PENDING);
        complaintRepository.save(complaint);

        auditLogService.log("DOCUMENT_REQUESTED", currentUser.getEmail(), "Requested: " + documentName + " for case " + complaintId);
        
        notificationService.create(
                complaint.getUser(),
                "Your Legal Guide has requested document: " + documentName + ".",
                NotificationType.IN_APP
        );

        return saved;
    }

    @Transactional
    public CaseDocumentRequest uploadDocument(Long requestId, String documentUrl, User currentUser) {
        CaseDocumentRequest req = caseDocumentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Document request not found"));

        Complaint complaint = complaintRepository.findById(req.getComplaintId())
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        // Only owner or admin can upload
        if (currentUser.getRole() != Role.ADMIN && !complaint.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the complaint owner can upload documents");
        }

        req.setStatus("UPLOADED");
        req.setDocumentUrl(documentUrl != null ? documentUrl : "evidence_slip_" + req.getComplaintId() + ".pdf");
        CaseDocumentRequest saved = caseDocumentRequestRepository.save(req);

        auditLogService.log("DOCUMENT_UPLOADED", currentUser.getEmail(), "Uploaded: " + req.getDocumentName() + " for case " + req.getComplaintId());

        if (complaint.getAssignedHelper() != null) {
            notificationService.create(
                    complaint.getAssignedHelper(),
                    "Public User uploaded requested document: " + req.getDocumentName() + ".",
                    NotificationType.IN_APP
            );
        }

        return saved;
    }

    @Transactional
    public CaseDocumentRequest verifyDocument(Long requestId, User currentUser) {
        CaseDocumentRequest req = caseDocumentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Document request not found"));

        Complaint complaint = getComplaintAndVerifyAccess(req.getComplaintId(), currentUser, true);

        req.setStatus("VERIFIED");
        req.setRejectionReason(null);
        CaseDocumentRequest saved = caseDocumentRequestRepository.save(req);

        auditLogService.log("DOCUMENT_VERIFIED", currentUser.getEmail(), "Verified: " + req.getDocumentName() + " for case " + req.getComplaintId());

        notificationService.create(
                complaint.getUser(),
                "Your uploaded document: " + req.getDocumentName() + " has been verified.",
                NotificationType.IN_APP
        );

        return saved;
    }

    @Transactional
    public CaseDocumentRequest rejectDocument(Long requestId, String reason, User currentUser) {
        CaseDocumentRequest req = caseDocumentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Document request not found"));

        Complaint complaint = getComplaintAndVerifyAccess(req.getComplaintId(), currentUser, true);

        req.setStatus("REJECTED");
        req.setRejectionReason(reason);
        CaseDocumentRequest saved = caseDocumentRequestRepository.save(req);

        auditLogService.log("DOCUMENT_REJECTED", currentUser.getEmail(), "Rejected: " + req.getDocumentName() + " (Reason: " + reason + ")");

        notificationService.create(
                complaint.getUser(),
                "Your document: " + req.getDocumentName() + " was rejected. Reason: " + reason,
                NotificationType.IN_APP
        );

        return saved;
    }

    // Call / Appointments
    public List<CaseAppointment> getAppointments(Long complaintId) {
        return caseAppointmentRepository.findByComplaintId(complaintId);
    }

    @Transactional
    public CaseAppointment requestAppointment(Long complaintId, String mode, String preferredTime, String note, User currentUser) {
        Complaint complaint = getComplaintAndVerifyAccess(complaintId, currentUser, false);

        CaseAppointment app = new CaseAppointment();
        app.setComplaintId(complaintId);
        app.setPublicUserId(complaint.getUser().getId());
        app.setLegalGuideId(complaint.getAssignedHelper() != null ? complaint.getAssignedHelper().getId() : currentUser.getId());
        app.setRequestedBy(currentUser.getRole() == Role.CITIZEN ? "CITIZEN" : "HELPER");
        app.setMode(mode);
        app.setPreferredTime(preferredTime);
        app.setStatus("REQUESTED");
        app.setNote(note);

        CaseAppointment saved = caseAppointmentRepository.save(app);

        auditLogService.log("APPOINTMENT_REQUESTED", currentUser.getEmail(), "Call/Meeting requested for case " + complaintId);

        // Notify counterpart
        User receiver = currentUser.getRole() == Role.CITIZEN ? complaint.getAssignedHelper() : complaint.getUser();
        if (receiver != null) {
            notificationService.create(
                    receiver,
                    "New call/appointment requested by " + (currentUser.getRole() == Role.CITIZEN ? "Public User" : "Legal Guide") + ".",
                    NotificationType.IN_APP
            );
        }

        return saved;
    }

    @Transactional
    public CaseAppointment scheduleAppointment(Long appointmentId, LocalDateTime scheduledAt, User currentUser) {
        CaseAppointment app = caseAppointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        Complaint complaint = getComplaintAndVerifyAccess(app.getComplaintId(), currentUser, true);

        app.setScheduledAt(scheduledAt);
        app.setStatus("SCHEDULED");
        CaseAppointment saved = caseAppointmentRepository.save(app);

        auditLogService.log("APPOINTMENT_SCHEDULED", currentUser.getEmail(), "Call/Meeting scheduled at " + scheduledAt);

        notificationService.create(
                complaint.getUser(),
                "Your call/appointment is scheduled for " + scheduledAt.toLocalDate() + " at " + scheduledAt.toLocalTime() + ".",
                NotificationType.IN_APP
        );

        return saved;
    }

    @Transactional
    public CaseAppointment cancelAppointment(Long appointmentId, User currentUser) {
        CaseAppointment app = caseAppointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        Complaint complaint = getComplaintAndVerifyAccess(app.getComplaintId(), currentUser, false);

        app.setStatus("CANCELLED");
        CaseAppointment saved = caseAppointmentRepository.save(app);

        auditLogService.log("APPOINTMENT_CANCELLED", currentUser.getEmail(), "Call/Meeting cancelled");

        User receiver = currentUser.getRole() == Role.CITIZEN ? complaint.getAssignedHelper() : complaint.getUser();
        if (receiver != null) {
            notificationService.create(
                    receiver,
                    "The scheduled call/appointment has been cancelled.",
                    NotificationType.IN_APP
            );
        }

        return saved;
    }

    // Feedback
    @Transactional
    public CaseFeedback submitFeedback(Long complaintId, Integer rating, String comment, boolean helpful, User currentUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (!complaint.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the complaint owner can submit feedback");
        }

        CaseFeedback fb = caseFeedbackRepository.findByComplaintId(complaintId).orElseGet(CaseFeedback::new);
        fb.setComplaintId(complaintId);
        fb.setPublicUserId(currentUser.getId());
        fb.setLegalGuideId(complaint.getAssignedHelper() != null ? complaint.getAssignedHelper().getId() : 1L);
        fb.setRating(rating);
        fb.setComment(comment);
        fb.setHelpful(helpful);

        CaseFeedback saved = caseFeedbackRepository.save(fb);

        // Award credit based on feedback rating
        int points = 0;
        String type = "";
        if (rating == 5) { points = 10; type = "USER_FEEDBACK_5_STAR"; }
        else if (rating == 4) { points = 7; type = "USER_FEEDBACK_4_STAR"; }
        else if (rating == 2) { points = -10; type = "LOW_USER_FEEDBACK_2_STAR"; }
        else if (rating == 1) { points = -15; type = "LOW_USER_FEEDBACK_1_STAR"; }
        
        if (points != 0 && saved.getLegalGuideId() != null) {
            levelService.addCredit(saved.getLegalGuideId(), complaintId, type, points, "User gave " + rating + " star feedback rating", currentUser.getId(), "CITIZEN", "USER_FEEDBACK");
        }

        auditLogService.log("CASE_FEEDBACK_SUBMITTED", currentUser.getEmail(), "User submitted feedback: " + rating + " stars");
        updateReputationAndElo(complaintId, rating, comment);

        return saved;
    }

    public Optional<CaseFeedback> getFeedback(Long complaintId) {
        return caseFeedbackRepository.findByComplaintId(complaintId);
    }

    // Status Transitions
    @Transactional
    public Complaint updateComplaintWorkflowStatus(Long complaintId, String targetStatus, String details, User currentUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        switch (targetStatus.toUpperCase()) {
            case "RESOLVED_BY_GUIDE":
                // Verify Guide or Admin
                if (currentUser.getRole() != Role.ADMIN && (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(currentUser.getId()))) {
                    throw new ForbiddenException("Unauthorized status modification");
                }
                complaint.setStatus(ComplaintStatus.RESOLVED_BY_GUIDE);
                complaint.setResolutionSummary(details);
                complaint.setResolvedAt(LocalDateTime.now());
                
                if (complaint.getAssignedHelper() != null) {
                    levelService.addCredit(complaint.getAssignedHelper().getId(), complaintId, "CASE_RESOLVED_BY_GUIDE", 20, "Guide resolved case", currentUser.getId(), "HELPER", "SYSTEM");
                }
                
                auditLogService.log("RESOLUTION_SHARED", currentUser.getEmail(), "Legal Guide resolved case " + complaintId);
                notificationService.create(
                        complaint.getUser(),
                        "Your Legal Guide has shared the case resolution. Please confirm to close your case.",
                        NotificationType.IN_APP
                );
                break;

            case "CLOSED_BY_USER":
                // Verify Owner
                if (!complaint.getUser().getId().equals(currentUser.getId())) {
                    throw new ForbiddenException("Unauthorized status modification");
                }
                complaint.setStatus(ComplaintStatus.CLOSED_BY_USER);
                
                if (complaint.getAssignedHelper() != null) {
                    levelService.addCredit(complaint.getAssignedHelper().getId(), complaintId, "USER_CONFIRMED_RESOLVED", 20, "Citizen confirmed resolved case", currentUser.getId(), "CITIZEN", "SYSTEM");
                }
                
                auditLogService.log("USER_CONFIRMED_RESOLVED", currentUser.getEmail(), "Citizen marked complaint " + complaintId + " as closed");
                updateReputationAndElo(complaintId, null, "Citizen marked case as closed without feedback");
                break;

            case "REOPEN_REQUESTED":
                // Verify Owner
                if (!complaint.getUser().getId().equals(currentUser.getId())) {
                    throw new ForbiddenException("Unauthorized status modification");
                }
                complaint.setStatus(ComplaintStatus.REOPEN_REQUESTED);
                complaint.setReopenReason(details);
                
                if (complaint.getAssignedHelper() != null) {
                    levelService.addCredit(complaint.getAssignedHelper().getId(), complaintId, "CASE_REOPENED_POOR_GUIDANCE", -15, "Citizen reopened case due to poor guidance", currentUser.getId(), "CITIZEN", "SYSTEM");
                }
                
                auditLogService.log("REOPEN_REQUESTED", currentUser.getEmail(), "Citizen requested reopening case: " + details);
                
                // Notify admin
                List<User> admins = complaintRepository.findAll().stream()
                        .map(Complaint::getUser)
                        .filter(u -> u.getRole() == Role.ADMIN)
                        .toList();
                if (!admins.isEmpty()) {
                    notificationService.create(admins.get(0), "Public User requested to reopen case ARAM-2026-" + String.format("%06d", complaintId), NotificationType.IN_APP);
                }
                break;

            default:
                throw new IllegalArgumentException("Unsupported workflow status target: " + targetStatus);
        }

        return complaintRepository.save(complaint);
    }

    private Complaint getComplaintAndVerifyAccess(Long complaintId, User currentUser, boolean requireGuideOrAdmin) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        if (currentUser.getRole() == Role.ADMIN) {
            return complaint;
        }

        if (requireGuideOrAdmin) {
            if (currentUser.getRole() != Role.HELPER) {
                throw new ForbiddenException("Helper privilege required");
            }
            if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("This case is not assigned to you");
            }
        } else {
            // Citizen, Helper, or Admin
            if (currentUser.getRole() == Role.CITIZEN) {
                if (!complaint.getUser().getId().equals(currentUser.getId())) {
                    throw new ForbiddenException("You do not own this complaint");
                }
            } else if (currentUser.getRole() == Role.HELPER) {
                if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(currentUser.getId())) {
                    throw new ForbiddenException("This case is not assigned to you");
                }
            } else {
                throw new ForbiddenException("Access Denied");
            }
        }

        return complaint;
    }

    @Transactional
    public void updateReputationAndElo(Long complaintId, Integer rating, String comment) {
        if (eloHistoryRepository.findByComplaintId(complaintId).isPresent()) {
            return;
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        if (complaint.getAssignedHelper() == null) return;
        Long guideId = complaint.getAssignedHelper().getId();

        LegalGuidePerformanceProfile perf = levelService.getOrCreatePerformanceProfile(guideId);

        double resolutionTimeHours = 24.0;
        if (complaint.getAssignedAt() != null && complaint.getResolvedAt() != null) {
            long diffMillis = java.time.Duration.between(complaint.getAssignedAt(), complaint.getResolvedAt()).toMillis();
            resolutionTimeHours = (double) diffMillis / (1000.0 * 60.0 * 60.0);
        }

        int prevCompleted = perf.getCompletedCases();
        int newCompleted = prevCompleted + 1;
        perf.setCompletedCases(newCompleted);

        double totalTime = (perf.getAverageResolutionTime() * prevCompleted) + resolutionTimeHours;
        perf.setAverageResolutionTime(totalTime / newCompleted);

        double timelinessScore = Math.max(0.0, 1.0 - (resolutionTimeHours / 48.0));
        double deadlineScore = (resolutionTimeHours <= 48.0) ? 1.0 : 0.0;

        double totalDeadlines = (perf.getDeadlineSuccessRate() * prevCompleted) + deadlineScore;
        perf.setDeadlineSuccessRate(totalDeadlines / newCompleted);

        double feedbackScore = 0.5;
        if (rating != null) {
            int prevFbCount = perf.getFeedbackCount();
            int newFbCount = prevFbCount + 1;
            perf.setFeedbackCount(newFbCount);
            double totalRating = (perf.getAverageRating() * prevFbCount) + rating;
            perf.setAverageRating(totalRating / newFbCount);
            feedbackScore = (double) rating / 5.0;
        }

        double qualityScore = 0.5;
        if (rating != null) {
            if (rating == 5) qualityScore = 1.0;
            else if (rating == 4) qualityScore = 0.8;
            else if (rating == 3) qualityScore = 0.6;
            else if (rating == 2) qualityScore = 0.3;
            else if (rating == 1) qualityScore = 0.0;
        }

        double reopenScore = 1.0;
        if (perf.getCasesAssigned() > 0) {
            reopenScore = 1.0 - ((double) perf.getCasesReopened() / perf.getCasesAssigned());
        }
        reopenScore = Math.max(0.0, Math.min(1.0, reopenScore));

        double outcomeScore = 1.0;
        if (complaint.getStatus() == ComplaintStatus.CLOSED_BY_USER) {
            outcomeScore = 1.0;
            perf.setSuccessfulCases(perf.getSuccessfulCases() + 1);
        } else if (complaint.getStatus() == ComplaintStatus.REOPEN_REQUESTED) {
            outcomeScore = 0.0;
        }

        double performanceScore = (0.30 * qualityScore) +
                                   (0.20 * timelinessScore) +
                                   (0.15 * deadlineScore) +
                                   (0.20 * feedbackScore) +
                                   (0.10 * reopenScore) +
                                   (0.05 * outcomeScore);

        String complexity = aiResultRepository.findByComplaint(complaint).map(AIResult::getComplexity).orElse("MEDIUM");
        double complexityWeight = 1.5;
        if ("EASY".equalsIgnoreCase(complexity)) complexityWeight = 1.0;
        else if ("MEDIUM".equalsIgnoreCase(complexity)) complexityWeight = 1.5;
        else if ("COMPLEX".equalsIgnoreCase(complexity)) complexityWeight = 2.5;
        else if ("CRITICAL".equalsIgnoreCase(complexity)) complexityWeight = 4.0;

        int oldElo = perf.getEloRating();
        double expected = 1.0 / (1.0 + Math.pow(10.0, (1400.0 - oldElo) / 400.0));
        int delta = (int) Math.round(32.0 * complexityWeight * (performanceScore - expected));
        delta = Math.max(-50, Math.min(50, delta));
        int newElo = oldElo + delta;

        perf.setEloRating(newElo);
        perf.setLastEloUpdate(LocalDateTime.now());

        double normalizedElo = 1.0 / (1.0 + Math.pow(10.0, (1400.0 - newElo) / 400.0));
        double reputationScore = (0.7 * normalizedElo) + (0.3 * performanceScore);
        perf.setReputationScore(Math.max(0.0, Math.min(1.0, reputationScore)));

        performanceProfileRepository.save(perf);

        LegalGuideEloHistory history = new LegalGuideEloHistory(
            guideId, complaintId, oldElo, newElo, delta, performanceScore, "Feedback rating: " + rating + " - " + comment
        );
        eloHistoryRepository.save(history);

        // Sync to MongoDB
        try {
            aiClientService.syncResolvedComplaint(
                complaint.getComplaintCustomId(),
                complaint.getStatus().name(),
                guideId.toString(),
                complaint.getAssignedHelper().getName(),
                complexity,
                resolutionTimeHours,
                (double) (rating != null ? rating : 5),
                "SUCCESS"
            );
        } catch (Exception e) {
            System.err.println("FastAPI resolved embedding sync failed: " + e.getMessage());
        }
    }
}
