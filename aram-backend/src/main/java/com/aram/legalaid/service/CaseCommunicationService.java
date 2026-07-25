package com.aram.legalaid.service;

import com.aram.legalaid.enums.*;
import com.aram.legalaid.exception.BadRequestException;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.*;
import com.aram.legalaid.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CaseCommunicationService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final CaseChatThreadRepository chatThreadRepository;
    private final CaseMessageRepository messageRepository;
    private final LegalGuideCaseNoteRepository caseNoteRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final UserService userService;

    public CaseCommunicationService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            CaseChatThreadRepository chatThreadRepository,
            CaseMessageRepository messageRepository,
            LegalGuideCaseNoteRepository caseNoteRepository,
            NotificationService notificationService,
            AuditLogService auditLogService,
            UserService userService) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.chatThreadRepository = chatThreadRepository;
        this.messageRepository = messageRepository;
        this.caseNoteRepository = caseNoteRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.userService = userService;
    }

    @Transactional
    public Map<String, Object> assignLegalGuide(Long complaintId, Long legalGuideId, String overrideReason, String adminNote) {
        User currentUser = userService.currentUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only admins can assign legal guides");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        User guide = userRepository.findById(legalGuideId)
                .orElseThrow(() -> new ResourceNotFoundException("Legal Guide not found"));

        if (guide.getRole() != Role.HELPER) {
            throw new BadRequestException("Assigned user must be a Legal Guide");
        }

        // Sensitive workflow controls
        boolean isSensitive = complaint.isSensitive();
        boolean prefersFemale = complaint.getPreferredHelperGender() == HelperGender.FEMALE;

        if (isSensitive || prefersFemale) {
            boolean isFemale = "FEMALE".equalsIgnoreCase(guide.getGender());
            boolean isTrained = guide.isWomenSupportTrained();
            boolean canHandleSensitive = guide.isCanHandleSensitiveCases();

            boolean matchesCriteria = isFemale && isTrained && canHandleSensitive;
            if (!matchesCriteria) {
                if (overrideReason == null || overrideReason.trim().isEmpty()) {
                    throw new BadRequestException("An override reason is required for assigning a non-preferred or untrained guide to a sensitive case.");
                }
            }
        }

        complaint.setAssignedHelper(guide);
        complaint.setStatus(ComplaintStatus.HELPER_ASSIGNED);
        complaint.setUpdatedAt(LocalDateTime.now());
        complaintRepository.save(complaint);

        // Create Chat Thread
        CaseChatThread thread = chatThreadRepository.findByComplaintId(complaintId)
                .orElseGet(() -> {
                    CaseChatThread t = new CaseChatThread();
                    t.setComplaintId(complaintId);
                    t.setPublicUserId(complaint.getUser().getId());
                    t.setLegalGuideId(guide.getId());
                    t.setStatus("OPEN");
                    t.setCreatedAt(LocalDateTime.now());
                    t.setUpdatedAt(LocalDateTime.now());
                    return chatThreadRepository.save(t);
                });

        // System message in chat
        CaseMessage systemMsg = new CaseMessage();
        systemMsg.setThreadId(thread.getId());
        systemMsg.setComplaintId(complaintId);
        systemMsg.setSenderId(currentUser.getId());
        systemMsg.setSenderRole("SYSTEM");
        systemMsg.setMessageType("SYSTEM");
        systemMsg.setMessageText("Legal Guide " + guide.getName() + " has been assigned to this case.");
        systemMsg.setCreatedAt(LocalDateTime.now());
        messageRepository.save(systemMsg);

        // Notifications
        notificationService.create(
                complaint.getUser(),
                "Legal Guide assigned to your complaint ARAM-2026-000" + complaintId + ".",
                NotificationType.IN_APP
        );
        notificationService.create(
                guide,
                "A new case ARAM-2026-000" + complaintId + " has been assigned to you.",
                NotificationType.IN_APP
        );

        // Audit Log
        String details = "Assigned Legal Guide " + guide.getEmail() + " to complaint ID " + complaintId;
        if (overrideReason != null && !overrideReason.trim().isEmpty()) {
            details += " | Override Reason: " + overrideReason;
        }
        auditLogService.log("COMPLAINT_ASSIGNED", currentUser.getEmail(), details);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("complaintId", complaintId);
        response.put("assignedLegalGuideId", legalGuideId);
        response.put("chatThreadId", thread.getId());
        response.put("message", "Legal Guide assigned successfully");
        return response;
    }

    public List<Map<String, Object>> getRecommendedGuides(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        List<User> guides = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.HELPER && "ACTIVE".equalsIgnoreCase(u.getAvailabilityStatus()))
                .toList();

        List<Map<String, Object>> recommendations = new ArrayList<>();

        for (User g : guides) {
            int score = 0;
            StringBuilder reason = new StringBuilder();

            // Language match
            if (complaint.getLanguage() != null && g.getLanguagesKnown() != null 
                    && g.getLanguagesKnown().toLowerCase().contains(complaint.getLanguage().toLowerCase())) {
                score += 30;
                reason.append("Language matched (").append(complaint.getLanguage()).append("). ");
            }

            // Specialization match
            String compCat = complaint.getCategory() != null ? complaint.getCategory().name() : "";
            if (g.getSpecializationCategories() != null && g.getSpecializationCategories().contains(compCat)) {
                score += 30;
                reason.append("Specialization matched (").append(compCat).append("). ");
            }

            // Sensitive / Female Support match
            if (complaint.isSensitive()) {
                if ("FEMALE".equalsIgnoreCase(g.getGender())) {
                    score += 20;
                    reason.append("Preferred female gender match for sensitive case. ");
                }
                if (g.isWomenSupportTrained()) {
                    score += 20;
                    reason.append("Women support trained badge. ");
                }
            }

            // Workload match
            if (g.getCurrentActiveCases() < g.getMaxActiveCases()) {
                score += 20;
                reason.append("Low workload occupancy. ");
            }

            Map<String, Object> rec = new HashMap<>();
            rec.put("legalGuideId", g.getId());
            rec.put("name", g.getName());
            rec.put("languages", g.getLanguagesKnown() != null ? g.getLanguagesKnown() : "English");
            rec.put("specializations", g.getSpecialization() != null ? g.getSpecialization() : "General Legal Aid");
            rec.put("gender", g.getGender() != null ? g.getGender() : "ANY");
            rec.put("womenSupportTrained", g.isWomenSupportTrained());
            rec.put("workload", g.getCurrentActiveCases() + " / " + g.getMaxActiveCases());
            rec.put("matchScore", score);
            rec.put("matchLabel", score >= 70 ? "Excellent Match" : score >= 40 ? "Good Match" : "Standard Match");
            rec.put("recommendationReason", reason.toString());
            rec.put("adminWarning", complaint.isSensitive() && !g.isWomenSupportTrained() ? "Requires trained guide override approval." : "");

            recommendations.add(rec);
        }

        recommendations.sort((a, b) -> (Integer) b.get("matchScore") - (Integer) a.get("matchScore"));
        return recommendations;
    }

    public List<CaseMessage> getChatMessages(Long complaintId) {
        User currentUser = userService.currentUser();
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        // Access checks
        if (currentUser.getRole() != Role.ADMIN) {
            boolean isCitizenOwner = currentUser.getId().equals(complaint.getUser().getId());
            boolean isAssignedHelper = complaint.getAssignedHelper() != null && currentUser.getId().equals(complaint.getAssignedHelper().getId());
            if (!isCitizenOwner && !isAssignedHelper) {
                throw new ForbiddenException("Access to this chat is forbidden");
            }
        }

        CaseChatThread thread = chatThreadRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat thread not found for this complaint"));

        return messageRepository.findByThreadIdOrderByCreatedAtAsc(thread.getId());
    }

    @Transactional
    public CaseMessage sendMessage(Long complaintId, String messageText, String messageType, String fileReference) {
        User currentUser = userService.currentUser();
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (currentUser.getRole() != Role.ADMIN) {
            boolean isCitizenOwner = currentUser.getId().equals(complaint.getUser().getId());
            boolean isAssignedHelper = complaint.getAssignedHelper() != null && currentUser.getId().equals(complaint.getAssignedHelper().getId());
            if (!isCitizenOwner && !isAssignedHelper) {
                throw new ForbiddenException("You cannot send messages to this chat");
            }
        }

        CaseChatThread thread = chatThreadRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat thread not found. Guides must be assigned first."));

        CaseMessage msg = new CaseMessage();
        msg.setThreadId(thread.getId());
        msg.setComplaintId(complaintId);
        msg.setSenderId(currentUser.getId());
        msg.setSenderRole(currentUser.getRole().name());
        msg.setMessageType(messageType != null ? messageType : "TEXT");
        msg.setMessageText(messageText);
        msg.setFileReference(fileReference);
        msg.setCreatedAt(LocalDateTime.now());

        CaseMessage saved = messageRepository.save(msg);

        // Send notifications to counterpart
        if (currentUser.getRole() == Role.CITIZEN) {
            if (complaint.getAssignedHelper() != null) {
                notificationService.create(
                        complaint.getAssignedHelper(),
                        "Public User replied in case ARAM-2026-000" + complaintId + ".",
                        NotificationType.IN_APP
                );
            }
        } else if (currentUser.getRole() == Role.HELPER) {
            notificationService.create(
                    complaint.getUser(),
                    "Legal Guide sent a new message in ARAM-2026-000" + complaintId + ".",
                    NotificationType.IN_APP
            );
        }

        return saved;
    }

    @Transactional
    public void markMessageAsRead(Long messageId) {
        CaseMessage msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        msg.setReadStatus(true);
        messageRepository.save(msg);
    }

    @Transactional
    public LegalGuideCaseNote addCaseNote(Long complaintId, String noteText, String visibility) {
        User currentUser = userService.currentUser();
        if (currentUser.getRole() != Role.HELPER) {
            throw new ForbiddenException("Only Legal Guides can record case notes");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only add notes to assigned complaints");
        }

        LegalGuideCaseNote note = new LegalGuideCaseNote();
        note.setComplaintId(complaintId);
        note.setLegalGuideId(currentUser.getId());
        note.setNoteText(noteText);
        note.setVisibility(visibility != null ? visibility : "PRIVATE");
        note.setCreatedAt(LocalDateTime.now());

        return caseNoteRepository.save(note);
    }

    @Transactional
    public Complaint updateStatus(Long complaintId, String status) {
        User currentUser = userService.currentUser();
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (currentUser.getRole() != Role.HELPER && currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Not authorized to update case status");
        }

        if (currentUser.getRole() == Role.HELPER) {
            if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You can only update your assigned cases");
            }
        }

        ComplaintStatus newStatus = ComplaintStatus.valueOf(status.toUpperCase());
        complaint.setStatus(newStatus);
        complaint.setUpdatedAt(LocalDateTime.now());
        Complaint saved = complaintRepository.save(complaint);

        // System message
        chatThreadRepository.findByComplaintId(complaintId).ifPresent(thread -> {
            CaseMessage systemMsg = new CaseMessage();
            systemMsg.setThreadId(thread.getId());
            systemMsg.setComplaintId(complaintId);
            systemMsg.setSenderId(currentUser.getId());
            systemMsg.setSenderRole("SYSTEM");
            systemMsg.setMessageType("STATUS_UPDATE");
            systemMsg.setMessageText("Case status updated to: " + status);
            systemMsg.setCreatedAt(LocalDateTime.now());
            messageRepository.save(systemMsg);
        });

        // Notifications
        notificationService.create(
                complaint.getUser(),
                "Case status updated to " + status + " for ARAM-2026-000" + complaintId + ".",
                NotificationType.IN_APP
        );

        auditLogService.log("COMPLAINT_STATUS_UPDATED", currentUser.getEmail(), "Updated status of complaint ID " + complaintId + " to " + status);

        return saved;
    }

    @Transactional
    public void requestDocuments(Long complaintId, String documentName) {
        User currentUser = userService.currentUser();
        if (currentUser.getRole() != Role.HELPER) {
            throw new ForbiddenException("Only Legal Guides can request documents");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only request documents on assigned cases");
        }

        complaint.setStatus(ComplaintStatus.DOCUMENTS_PENDING);
        complaintRepository.save(complaint);

        chatThreadRepository.findByComplaintId(complaintId).ifPresent(thread -> {
            CaseMessage msg = new CaseMessage();
            msg.setThreadId(thread.getId());
            msg.setComplaintId(complaintId);
            msg.setSenderId(currentUser.getId());
            msg.setSenderRole("HELPER");
            msg.setMessageType("DOCUMENT_REQUEST");
            msg.setMessageText("Document requested: " + documentName);
            msg.setCreatedAt(LocalDateTime.now());
            messageRepository.save(msg);
        });

        notificationService.create(
                complaint.getUser(),
                "Legal Guide requested additional documents: " + documentName,
                NotificationType.IN_APP
        );
    }

    @Transactional
    public void escalateCase(Long complaintId, String reason) {
        User currentUser = userService.currentUser();
        if (currentUser.getRole() != Role.HELPER) {
            throw new ForbiddenException("Only Legal Guides can escalate cases");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only escalate assigned cases");
        }

        complaint.setStatus(ComplaintStatus.IN_PROGRESS); // Keeps it active but logs escalation
        complaintRepository.save(complaint);

        chatThreadRepository.findByComplaintId(complaintId).ifPresent(thread -> {
            CaseMessage msg = new CaseMessage();
            msg.setThreadId(thread.getId());
            msg.setComplaintId(complaintId);
            msg.setSenderId(currentUser.getId());
            msg.setSenderRole("HELPER");
            msg.setMessageType("SYSTEM");
            msg.setMessageText("Case escalated to Admin. Reason: " + reason);
            msg.setCreatedAt(LocalDateTime.now());
            messageRepository.save(msg);
        });

        // Notify Admins
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .forEach(admin -> notificationService.create(
                        admin,
                        "Legal Guide escalated case ARAM-2026-000" + complaintId + ". Reason: " + reason,
                        NotificationType.SYSTEM
                ));

        auditLogService.log("COMPLAINT_ESCALATED", currentUser.getEmail(), "Escalated complaint ID " + complaintId + " | Reason: " + reason);
    }

    public List<LegalGuideCaseNote> getCaseNotes(Long complaintId) {
        User currentUser = userService.currentUser();
        if (currentUser.getRole() != Role.HELPER && currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Access denied");
        }
        return caseNoteRepository.findByComplaintIdOrderByCreatedAtDesc(complaintId);
    }
}
