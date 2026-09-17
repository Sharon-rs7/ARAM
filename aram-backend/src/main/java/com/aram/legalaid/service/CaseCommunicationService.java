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
    private final AIClientService aiClientService;
    private final LegalGuidePerformanceProfileRepository performanceProfileRepository;
    private final EmailService emailService;
    private final RedisNotificationPublisher redisNotificationPublisher;

    public CaseCommunicationService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            CaseChatThreadRepository chatThreadRepository,
            CaseMessageRepository messageRepository,
            LegalGuideCaseNoteRepository caseNoteRepository,
            NotificationService notificationService,
            AuditLogService auditLogService,
            UserService userService,
            AIClientService aiClientService,
            LegalGuidePerformanceProfileRepository performanceProfileRepository,
            EmailService emailService,
            RedisNotificationPublisher redisNotificationPublisher) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.chatThreadRepository = chatThreadRepository;
        this.messageRepository = messageRepository;
        this.caseNoteRepository = caseNoteRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.userService = userService;
        this.aiClientService = aiClientService;
        this.performanceProfileRepository = performanceProfileRepository;
        this.emailService = emailService;
        this.redisNotificationPublisher = redisNotificationPublisher;
    }

    @Transactional
    public Map<String, Object> assignLegalGuide(Long complaintId, Long legalGuideId, String overrideReason, String adminNote) {
        User currentUser = userService.currentUser();
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.SUPER_ADMIN) {
            throw new ForbiddenException("Only admins can assign legal guides");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        User guide = userRepository.findById(legalGuideId)
                .orElseThrow(() -> new ResourceNotFoundException("Legal Guide not found"));

        if (guide.getRole() != Role.HELPER) {
            throw new BadRequestException("Assigned user must be a Legal Guide");
        }

        // Priority Level and Experience validation check (override reason check)
        boolean isHighRiskPriority = complaint.getPriority() == PriorityLevel.HIGH || complaint.getPriority() == PriorityLevel.CRITICAL;
        boolean isJuniorLevel = guide.getExperienceLevel() == null || "JUNIOR".equalsIgnoreCase(guide.getExperienceLevel().trim());
        
        if (isHighRiskPriority && isJuniorLevel) {
            if (overrideReason == null || overrideReason.trim().length() < 10) {
                throw new BadRequestException("An override reason of at least 10 meaningful characters is required to assign a Junior Guide to a HIGH priority case.");
            }
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
        complaint.setAssignedAt(LocalDateTime.now());
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
                "Legal Guide assigned to your complaint " + complaint.getComplaintCustomId() + ".",
                NotificationType.IN_APP
        );
        notificationService.create(
                guide,
                "A new case " + complaint.getComplaintCustomId() + " has been assigned to you.",
                NotificationType.IN_APP
        );

        // Redis WebSocket dispatches
        redisNotificationPublisher.publishNotification(
                "GUIDE_ASSIGNED",
                complaintId,
                guide.getId(),
                "A new case has been assigned to you."
        );
        redisNotificationPublisher.publishNotification(
                "GUIDE_ASSIGNED",
                complaintId,
                complaint.getUser().getId(),
                "Legal Guide assigned to your complaint."
        );

        // Transactional Email Dispatches
        try {
            emailService.sendGuideAssignedEmail(
                complaint.getUser().getEmail(),
                complaint.getUser().getName(),
                complaint.getComplaintCustomId(),
                guide.getName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send guide assignment email to citizen: " + e.getMessage());
        }

        try {
            emailService.sendGuideNewCaseEmail(
                guide.getEmail(),
                guide.getName(),
                complaint.getComplaintCustomId(),
                complaint.getCategory() != null ? complaint.getCategory().name() : "GENERAL",
                complaint.getDistrict(),
                complaint.getLanguage() != null ? complaint.getLanguage() : "ENGLISH"
            );
        } catch (Exception e) {
            System.err.println("Failed to send new case notification email to guide: " + e.getMessage());
        }

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

        String complaintDistrict = complaint.getDistrict();
        List<User> guides = (complaintDistrict != null && !complaintDistrict.trim().isEmpty() && !"GLOBAL".equalsIgnoreCase(complaintDistrict))
                ? userRepository.findByRoleAndDistrict(Role.HELPER, complaintDistrict)
                : userRepository.findByRole(Role.HELPER);

        if (guides == null || guides.isEmpty()) {
            guides = userRepository.findByRole(Role.HELPER);
        }

        List<Map<String, Object>> volunteerPayloads = new ArrayList<>();
        for (User g : guides) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", g.getId());
            payload.put("name", g.getName());
            payload.put("gender", g.getGender() != null ? g.getGender() : "ANY");
            List<String> langs = g.getLanguagesKnown() != null ? Arrays.asList(g.getLanguagesKnown().split(",")) : List.of("English");
            List<String> specs = g.getSpecializationCategories() != null ? Arrays.asList(g.getSpecializationCategories().split(",")) : List.of("GENERAL_LEGAL_AID");
            payload.put("languagesKnown", langs);
            payload.put("specializationCategories", specs);
            payload.put("district", g.getDistrict() != null ? g.getDistrict() : "Coimbatore");
            payload.put("currentActiveCases", g.getCurrentActiveCases());
            payload.put("maxActiveCases", g.getMaxActiveCases());
            payload.put("experienceLevel", g.getExperienceLevel() != null ? g.getExperienceLevel() : "SENIOR");
            payload.put("womenSupportTrained", g.isWomenSupportTrained());
            payload.put("canHandleSensitiveCases", g.isCanHandleSensitiveCases());
            payload.put("availabilityStatus", g.getAvailabilityStatus());
            payload.put("supportsTanglish", g.isSupportsTanglish());
            payload.put("supportsHinglish", g.isSupportsHinglish());

            int eloRating = performanceProfileRepository.findByLegalGuideId(g.getId())
                    .map(LegalGuidePerformanceProfile::getEloRating)
                    .orElse(1000);
            double averageRating = performanceProfileRepository.findByLegalGuideId(g.getId())
                    .map(LegalGuidePerformanceProfile::getAverageRating)
                    .orElse(0.0);
            int feedbackCount = performanceProfileRepository.findByLegalGuideId(g.getId())
                    .map(LegalGuidePerformanceProfile::getCasesConfirmedResolved)
                    .orElse(0);

            payload.put("eloRating", eloRating);
            payload.put("averageRating", averageRating);
            payload.put("feedbackCount", feedbackCount);
            volunteerPayloads.add(payload);
        }

        String cat = complaint.getCategory() != null ? complaint.getCategory().name() : "GENERAL_LEGAL_AID";
        String lang = complaint.getLanguage() != null ? complaint.getLanguage() : "en";
        boolean preferWoman = complaint.isSensitive() || (complaint.getPreferredHelperGender() == HelperGender.FEMALE);

        return aiClientService.recommendVolunteers(
            complaint.getComplaintCustomId(),
            cat,
            lang,
            preferWoman,
            complaint.getDistrict(),
            volunteerPayloads
        );
    }

    public List<CaseMessage> getChatMessages(Long complaintId) {
        User currentUser = userService.currentUser();
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        // Access checks
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.SUPER_ADMIN) {
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

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.SUPER_ADMIN) {
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

        if (currentUser.getRole() != Role.HELPER && currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.SUPER_ADMIN) {
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
        if (currentUser.getRole() != Role.HELPER && currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.SUPER_ADMIN) {
            throw new ForbiddenException("Access denied");
        }
        return caseNoteRepository.findByComplaintIdOrderByCreatedAtDesc(complaintId);
    }

    @Transactional
    public void acknowledgeComplaint(Long complaintId) {
        acknowledgeComplaint(complaintId, userService.currentUser());
    }

    @Transactional
    public void acknowledgeComplaint(Long complaintId, User helper) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(helper.getId())) {
            throw new ForbiddenException("Unauthorized: You are not the assigned guide for this complaint");
        }

        // Transition status from HELPER_ASSIGNED (or SUBMITTED) to IN_PROGRESS
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        complaint.setAcknowledgedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());
        complaintRepository.save(complaint);

        // System message in chat thread
        chatThreadRepository.findByComplaintId(complaintId).ifPresent(thread -> {
            CaseMessage msg = new CaseMessage();
            msg.setThreadId(thread.getId());
            msg.setComplaintId(complaintId);
            msg.setSenderId(helper.getId());
            msg.setSenderRole("HELPER");
            msg.setMessageType("SYSTEM");
            msg.setMessageText("Legal Guide " + helper.getName() + " has acknowledged this case and is active.");
            msg.setCreatedAt(LocalDateTime.now());
            messageRepository.save(msg);
        });

        // 1. Persistent Notifications
        notificationService.create(
                complaint.getUser(),
                "Your Legal Guide " + helper.getName() + " has acknowledged your case ARAM-" + complaintId + " and started review.",
                NotificationType.IN_APP
        );

        if (complaint.getDistrict() != null && !complaint.getDistrict().isEmpty()) {
            userRepository.findByRoleAndDistrict(Role.ADMIN, complaint.getDistrict())
                    .forEach(admin -> notificationService.create(
                            admin,
                            "Guide " + helper.getName() + " has acknowledged case ARAM-" + complaintId + " in " + complaint.getDistrict() + ".",
                            NotificationType.IN_APP
                    ));
        }

        // 2. WebSocket Notifications via Redis
        redisNotificationPublisher.publishNotification(
                "GUIDE_ACKNOWLEDGED",
                complaintId,
                complaint.getUser().getId(),
                "Legal Guide acknowledged case"
        );

        // Audit Log
        auditLogService.log(
                "GUIDE_ACKNOWLEDGED",
                helper.getEmail(),
                "Acknowledged case ARAM-" + complaintId
        );
    }

    @Transactional
    public Complaint resolveCase(Long complaintId, String resolutionSummary, String resolutionType) {
        User currentUser = userService.currentUser();
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.SUPER_ADMIN) {
            if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("Unauthorized: You are not assigned to resolve this case");
            }
        }

        String finalSummary = (resolutionSummary != null && !resolutionSummary.isBlank())
                ? resolutionSummary
                : "Case successfully resolved.";
        String finalType = (resolutionType != null && !resolutionType.isBlank())
                ? resolutionType
                : "COMMUNITY_MEDIATION";

        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint.setResolvedAt(LocalDateTime.now());
        complaint.setResolutionSummary(finalSummary);
        complaint.setResolutionType(finalType);
        complaint.setUpdatedAt(LocalDateTime.now());
        Complaint saved = complaintRepository.save(complaint);

        // System message in chat thread
        chatThreadRepository.findByComplaintId(complaintId).ifPresent(thread -> {
            CaseMessage msg = new CaseMessage();
            msg.setThreadId(thread.getId());
            msg.setComplaintId(complaintId);
            msg.setSenderId(currentUser.getId());
            msg.setSenderRole(currentUser.getRole().name());
            msg.setMessageType("SYSTEM");
            msg.setMessageText("Case resolved. Resolution summary: " + finalSummary);
            msg.setCreatedAt(LocalDateTime.now());
            messageRepository.save(msg);
        });

        // 1. Persistent Notification
        notificationService.create(
                complaint.getUser(),
                "Your case " + complaint.getComplaintCustomId() + " has been marked as RESOLVED. Please provide your feedback.",
                NotificationType.IN_APP
        );

        if (complaint.getDistrict() != null && !complaint.getDistrict().isEmpty()) {
            userRepository.findByRoleAndDistrict(Role.ADMIN, complaint.getDistrict())
                    .forEach(admin -> notificationService.create(
                            admin,
                            "Case " + complaint.getComplaintCustomId() + " in " + complaint.getDistrict() + " was resolved by " + currentUser.getName() + ".",
                            NotificationType.IN_APP
                    ));
        }

        // 2. Async Email to Citizen
        if (complaint.getUser() != null && complaint.getUser().getEmail() != null) {
            emailService.sendCaseResolvedEmail(
                    complaint.getUser().getEmail(),
                    complaint.getUser().getName(),
                    complaint.getComplaintCustomId(),
                    finalSummary
            );
        }

        // 3. WebSocket notification via Redis
        redisNotificationPublisher.publishNotification(
                "CASE_RESOLVED",
                complaintId,
                complaint.getUser().getId(),
                "Case resolved"
        );

        // 4. Audit Log
        auditLogService.log(
                "CASE_RESOLVED",
                currentUser.getEmail(),
                "Resolved case " + complaint.getComplaintCustomId() + " with type: " + finalType
        );

        return saved;
    }
}
