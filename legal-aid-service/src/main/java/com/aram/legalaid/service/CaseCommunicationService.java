package com.aram.legalaid.service;

import com.aram.legalaid.enums.*;
import com.aram.legalaid.exception.*;
import com.aram.legalaid.model.*;
import com.aram.legalaid.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CaseCommunicationService {

    private final ComplaintRepository complaintRepository;
    private final CaseChatThreadRepository chatThreadRepository;
    private final CaseMessageRepository messageRepository;
    private final LegalGuideCaseNoteRepository caseNoteRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final UserService userService;
    private final LegalGuideProfileRepository guideProfileRepository;
    private final LegalGuideLevelService levelService;

    public CaseCommunicationService(
            ComplaintRepository complaintRepository,
            CaseChatThreadRepository chatThreadRepository,
            CaseMessageRepository messageRepository,
            LegalGuideCaseNoteRepository caseNoteRepository,
            NotificationService notificationService,
            AuditLogService auditLogService,
            UserService userService,
            LegalGuideProfileRepository guideProfileRepository,
            LegalGuideLevelService levelService) {
        this.complaintRepository = complaintRepository;
        this.chatThreadRepository = chatThreadRepository;
        this.messageRepository = messageRepository;
        this.caseNoteRepository = caseNoteRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.userService = userService;
        this.guideProfileRepository = guideProfileRepository;
        this.levelService = levelService;
    }

    public Map<String, Object> assignLegalGuide(Long complaintId, Long legalGuideId, String overrideReason, String adminNote) {
        User currentUser = userService.currentUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only admin can assign legal guides");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        LegalGuideProfile guide = guideProfileRepository.findByUserId(legalGuideId)
                .orElseThrow(() -> new ResourceNotFoundException("Legal Guide not found"));

        // Workload capacity check
        if (guide.getCurrentWorkload() >= guide.getMaxCaseCapacity() && guide.getMaxCaseCapacity() > 0) {
            if (overrideReason == null || overrideReason.trim().length() < 10) {
                throw new BadRequestException("Legal Guide " + guide.getFullName() + " has reached maximum active case workload (" + guide.getMaxCaseCapacity() + " cases). An Admin override reason of at least 10 characters is required to assign.");
            }
        }

        // Level-based eligibility check
        LegalGuidePerformanceProfile perf = levelService.getOrCreatePerformanceProfile(guide.getUserId());
        int guideLevelNum = perf.getCurrentLevelNumber();
        String guideLevelName = perf.getCurrentLevelName();

        boolean isHighOrCritical = complaint.getPriority() == PriorityLevel.HIGH || complaint.getPriority() == PriorityLevel.CRITICAL;
        boolean isBelowSeniorLevel = guideLevelNum < 3; // 1 = JUNIOR, 2 = GUIDE, 3 = SENIOR, 4 = EXPERT

        if (isHighOrCritical && isBelowSeniorLevel) {
            if (overrideReason == null || overrideReason.trim().length() < 10) {
                throw new BadRequestException("Selected Guide " + guide.getFullName() + " is " + guideLevelName + " (Level " + guideLevelNum + "), which is below the recommended level (SENIOR/EXPERT) for " + complaint.getPriority() + " priority cases. An Admin override reason of at least 10 characters is required.");
            }
            auditLogService.log("GUIDE_ASSIGNMENT_OVERRIDE", "ADMIN_" + currentUser.getId(),
                "Admin override: Assigned " + guideLevelName + " (ID " + guide.getUserId() + ") to " + complaint.getPriority() + " Case " + complaintId + ". Reason: " + overrideReason);
        }

        User guideUserPOJO = new User(guide.getUserId(), guide.getFullName(), guide.getEmail(), Role.HELPER);
        complaint.setAssignedHelper(guideUserPOJO);
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        if (overrideReason != null) {
            complaint.setAssignmentOverrideReason(overrideReason);
        }
        complaintRepository.save(complaint);

        guide.setCurrentWorkload(guide.getCurrentWorkload() + 1);
        guideProfileRepository.save(guide);

        String msg = "Guide " + guide.getFullName() + " (" + guideLevelName + ") has been assigned to complaint ID " + complaintId;
        notificationService.notifyAdmins(msg);

        return Map.of("success", true, "message", "Legal Guide assigned successfully");
    }

    public List<Map<String, Object>> getRecommendedGuides(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        List<LegalGuideProfile> guides = guideProfileRepository.findAll();

        List<Map<String, Object>> volunteerPayloads = new ArrayList<>();
        for (LegalGuideProfile g : guides) {
            LegalGuidePerformanceProfile perf = levelService.getOrCreatePerformanceProfile(g.getUserId());
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", g.getUserId());
            payload.put("name", g.getFullName());
            payload.put("gender", g.getGender() != null ? g.getGender() : "ANY");
            payload.put("languagesKnown", g.getLanguagesKnown() != null ? g.getLanguagesKnown() : "English");
            payload.put("specializationCategories", g.getExpertiseCategories() != null ? g.getExpertiseCategories() : "GENERAL_LEGAL_AID");
            payload.put("district", g.getDistrict() != null ? g.getDistrict() : "Coimbatore");
            payload.put("currentActiveCases", g.getCurrentWorkload());
            payload.put("maxActiveCases", g.getMaxCaseCapacity());
            payload.put("experienceLevel", perf.getCurrentLevelName());
            payload.put("levelNumber", perf.getCurrentLevelNumber());
            payload.put("levelName", perf.getCurrentLevelName());
            payload.put("creditScore", perf.getCreditScore());
            payload.put("womenSupportTrained", g.isWomenSupportTrained());
            volunteerPayloads.add(payload);
        }

        for (Map<String, Object> v : volunteerPayloads) {
            double score = 100.0;

            if (complaint.getPreferredHelperGender() != null && complaint.getPreferredHelperGender() != HelperGender.ANY) {
                if (!complaint.getPreferredHelperGender().name().equalsIgnoreCase((String) v.get("gender"))) {
                    score -= 40.0;
                }
            }

            String compLang = complaint.getLanguage() != null ? complaint.getLanguage().toLowerCase() : "";
            String vLangs = ((String) v.get("languagesKnown")).toLowerCase();
            if (!vLangs.contains(compLang)) {
                score -= 20.0;
            }

            if (complaint.getDistrict() != null && v.get("district") != null) {
                if (complaint.getDistrict().equalsIgnoreCase((String) v.get("district"))) {
                    score += 15.0;
                }
            }

            String compCategory = complaint.getCategory() != null ? complaint.getCategory().name() : "";
            String vExpertise = ((String) v.get("specializationCategories")).toLowerCase();
            if (vExpertise.contains(compCategory.toLowerCase())) {
                score += 25.0;
            }

            int active = (int) v.get("currentActiveCases");
            int max = (int) v.get("maxActiveCases");
            if (active >= max) {
                score -= 50.0;
            } else if (active > 0) {
                score -= (active * 5.0);
            }

            boolean isHighRisk = complaint.isHighRisk() || complaint.isSensitive();
            boolean isTrained = (boolean) v.get("womenSupportTrained");
            if (isHighRisk && !isTrained) {
                score -= 30.0;
            }

            // Level & Priority match scoring
            int lvlNum = (int) v.get("levelNumber");
            if (complaint.getPriority() == PriorityLevel.CRITICAL) {
                if (lvlNum >= 4) score += 20.0;
                else if (lvlNum == 3) score += 10.0;
                else score -= 30.0;
            } else if (complaint.getPriority() == PriorityLevel.HIGH) {
                if (lvlNum >= 3) score += 20.0;
                else if (lvlNum == 2) score += 5.0;
                else score -= 20.0;
            } else {
                score += 10.0;
            }

            v.put("matchScore", Math.max(0.0, Math.min(100.0, score)));
        }

        String compLang = complaint.getLanguage() != null ? complaint.getLanguage().toLowerCase() : "";
        boolean hasExactLanguageMatch = volunteerPayloads.stream().anyMatch(v -> ((String) v.get("languagesKnown")).toLowerCase().contains(compLang));
        if (!hasExactLanguageMatch) {
            for (Map<String, Object> v : volunteerPayloads) {
                v.put("adminWarning", "No exact language match available for " + complaint.getLanguage() + " — manual review or best-effort assignment required.");
            }
        }

        volunteerPayloads.sort((v1, v2) -> Double.compare((double) v2.get("matchScore"), (double) v1.get("matchScore")));
        return volunteerPayloads;
    }

    public List<CaseMessage> getChatMessages(Long complaintId) {
        User currentUser = userService.currentUser();
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (currentUser.getRole() != Role.ADMIN) {
            boolean isCitizenOwner = currentUser.getId().equals(complaint.getUserId());
            boolean isAssignedHelper = complaint.getAssignedHelperId() != null && currentUser.getId().equals(complaint.getAssignedHelperId());
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
            boolean isCitizenOwner = currentUser.getId().equals(complaint.getUserId());
            boolean isAssignedHelper = complaint.getAssignedHelperId() != null && currentUser.getId().equals(complaint.getAssignedHelperId());
            if (!isCitizenOwner && !isAssignedHelper) {
                throw new ForbiddenException("You cannot send messages to this chat");
            }
        }

        CaseChatThread thread = chatThreadRepository.findByComplaintId(complaintId)
                .orElseGet(() -> {
                    CaseChatThread newThread = new CaseChatThread();
                    newThread.setComplaintId(complaintId);
                    newThread.setPublicUserId(complaint.getUserId());
                    newThread.setLegalGuideId(complaint.getAssignedHelperId() != null ? complaint.getAssignedHelperId() : 0L);
                    return chatThreadRepository.save(newThread);
                });

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
        System.out.println("[DEBUG addCaseNote] currentUser: " + (currentUser != null ? currentUser.getEmail() : "null")
                + ", role: " + (currentUser != null ? currentUser.getRole() : "null")
                + ", id: " + (currentUser != null ? currentUser.getId() : "null"));

        if (currentUser.getRole() != Role.HELPER) {
            throw new ForbiddenException("Only Legal Guides can record case notes");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        System.out.println("[DEBUG addCaseNote] complaint ID: " + complaintId + ", assignedHelperId: " + complaint.getAssignedHelperId());

        if (complaint.getAssignedHelperId() == null || !complaint.getAssignedHelperId().equals(currentUser.getId())) {
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

        System.out.println("[DEBUG updateStatus] currentUser: " + (currentUser != null ? currentUser.getEmail() : "null")
                + ", role: " + (currentUser != null ? currentUser.getRole() : "null")
                + ", id: " + (currentUser != null ? currentUser.getId() : "null")
                + ", assignedHelperId: " + complaint.getAssignedHelperId());

        if (currentUser.getRole() != Role.HELPER && currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Not authorized to update case status");
        }

        if (currentUser.getRole() == Role.HELPER) {
            if (complaint.getAssignedHelperId() == null || !complaint.getAssignedHelperId().equals(currentUser.getId())) {
                throw new ForbiddenException("You can only update your assigned cases");
            }
        }

        ComplaintStatus newStatus = ComplaintStatus.valueOf(status.toUpperCase());
        complaint.setStatus(newStatus);
        complaint.setUpdatedAt(LocalDateTime.now());
        Complaint saved = complaintRepository.save(complaint);

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

        if (complaint.getAssignedHelperId() == null || !complaint.getAssignedHelperId().equals(currentUser.getId())) {
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
                "Document requested: " + documentName + " for ARAM-2026-000" + complaintId + ".",
                NotificationType.IN_APP
        );
    }

    @Transactional
    public void escalateCase(Long complaintId, String reason) {
        User currentUser = userService.currentUser();
        if (currentUser.getRole() != Role.HELPER) {
            throw new ForbiddenException("Only assigned Legal Guides can escalate cases");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
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

        for (User admin : userService.getAdmins()) {
            notificationService.create(
                    admin,
                    "Legal Guide escalated case ARAM-2026-000" + complaintId + ". Reason: " + reason,
                    NotificationType.SYSTEM
            );
        }

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
