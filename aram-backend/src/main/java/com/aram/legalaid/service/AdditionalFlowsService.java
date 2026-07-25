package com.aram.legalaid.service;

import com.aram.legalaid.enums.*;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.*;
import com.aram.legalaid.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdditionalFlowsService {
    private final CaseDocumentRequestRepository caseDocumentRequestRepository;
    private final CaseAppointmentRepository caseAppointmentRepository;
    private final CaseFeedbackRepository caseFeedbackRepository;
    private final ComplaintRepository complaintRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public AdditionalFlowsService(
            CaseDocumentRequestRepository caseDocumentRequestRepository,
            CaseAppointmentRepository caseAppointmentRepository,
            CaseFeedbackRepository caseFeedbackRepository,
            ComplaintRepository complaintRepository,
            AuditLogService auditLogService,
            NotificationService notificationService
    ) {
        this.caseDocumentRequestRepository = caseDocumentRequestRepository;
        this.caseAppointmentRepository = caseAppointmentRepository;
        this.caseFeedbackRepository = caseFeedbackRepository;
        this.complaintRepository = complaintRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
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
        auditLogService.log("CASE_FEEDBACK_SUBMITTED", currentUser.getEmail(), "User submitted feedback: " + rating + " stars");

        return saved;
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
                auditLogService.log("USER_CONFIRMED_RESOLVED", currentUser.getEmail(), "Citizen marked complaint " + complaintId + " as closed");
                break;

            case "REOPEN_REQUESTED":
                // Verify Owner
                if (!complaint.getUser().getId().equals(currentUser.getId())) {
                    throw new ForbiddenException("Unauthorized status modification");
                }
                complaint.setStatus(ComplaintStatus.REOPEN_REQUESTED);
                complaint.setReopenReason(details);
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
}
