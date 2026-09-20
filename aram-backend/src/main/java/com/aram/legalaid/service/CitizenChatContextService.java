package com.aram.legalaid.service;

import com.aram.legalaid.dto.CitizenChatContextDTO;
import com.aram.legalaid.dto.CitizenChatContextDTO.*;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.model.CaseMessage;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.UploadedDocument;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.CaseMessageRepository;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.UploadedDocumentRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class CitizenChatContextService {

    private static final Pattern COMPLAINT_ID_PATTERN = Pattern.compile("(?i)ARAM-(?:[0-9]{2,4}-[A-Z]{2,3}-[A-Z]{2,4}-[0-9]{3,8}|[0-9]{4}-[0-9]{3,8}|[0-9]{6,10})");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final UserService userService;
    private final ComplaintRepository complaintRepository;
    private final UploadedDocumentRepository uploadedDocumentRepository;
    private final CaseMessageRepository caseMessageRepository;

    public CitizenChatContextService(UserService userService,
                                    ComplaintRepository complaintRepository,
                                    UploadedDocumentRepository uploadedDocumentRepository,
                                    CaseMessageRepository caseMessageRepository) {
        this.userService = userService;
        this.complaintRepository = complaintRepository;
        this.uploadedDocumentRepository = uploadedDocumentRepository;
        this.caseMessageRepository = caseMessageRepository;
    }

    public CitizenChatContextDTO buildContext(String userMessage, Long explicitComplaintId, String explicitCustomId) {
        User currentUser = null;
        try {
            currentUser = userService.currentUser();
        } catch (Exception e) {
            return new CitizenChatContextDTO(null, List.of(), List.of(), null, null);
        }

        if (currentUser == null) {
            return new CitizenChatContextDTO(null, List.of(), List.of(), null, null);
        }

        UserSummary userSummary = new UserSummary(
                currentUser.getId(),
                currentUser.getName(),
                currentUser.getDistrict() != null ? currentUser.getDistrict() : "Coimbatore",
                currentUser.getState() != null ? currentUser.getState() : "Tamil Nadu",
                currentUser.getPreferredLanguage() != null ? currentUser.getPreferredLanguage() : "en",
                currentUser.getRole() != null ? currentUser.getRole().name() : "CITIZEN"
        );

        List<Complaint> userComplaints = complaintRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        if (userComplaints == null) {
            userComplaints = List.of();
        }

        List<Complaint> activeComplaintEntities = userComplaints.stream()
                .filter(c -> c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.REJECTED)
                .limit(3)
                .collect(Collectors.toList());

        List<CaseSummary> activeCases = activeComplaintEntities.stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        List<CaseSummary> recentCases = userComplaints.stream()
                .limit(3)
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        String detectedCustomId = explicitCustomId;
        if ((detectedCustomId == null || detectedCustomId.isBlank()) && userMessage != null) {
            Matcher matcher = COMPLAINT_ID_PATTERN.matcher(userMessage);
            if (matcher.find()) {
                detectedCustomId = matcher.group().toUpperCase();
            } else {
                Matcher numMatcher = Pattern.compile("(?i)\\b(?:case|complaint)\\s*#?\\s*([0-9]{1,8})\\b").matcher(userMessage);
                if (numMatcher.find()) {
                    try {
                        Long numId = Long.parseLong(numMatcher.group(1));
                        Optional<Complaint> cOpt = complaintRepository.findById(numId);
                        if (cOpt.isPresent()) {
                            detectedCustomId = cOpt.get().getComplaintCustomId();
                        }
                    } catch (Exception ignored) {}
                }
            }
        }

        Complaint targetEntity = null;
        String matchedCaseId = null;

        if (detectedCustomId != null && !detectedCustomId.isBlank()) {
            Optional<Complaint> foundOpt = complaintRepository.findByComplaintCustomId(detectedCustomId.trim().toUpperCase());
            if (foundOpt.isPresent()) {
                Complaint candidate = foundOpt.get();
                if (candidate.getUser() != null && candidate.getUser().getId().equals(currentUser.getId())) {
                    targetEntity = candidate;
                    matchedCaseId = candidate.getComplaintCustomId();
                } else {
                    matchedCaseId = "UNAUTHORIZED";
                }
            } else {
                matchedCaseId = "UNAUTHORIZED";
            }
        } else if (explicitComplaintId != null) {
            Optional<Complaint> foundOpt = complaintRepository.findById(explicitComplaintId);
            if (foundOpt.isPresent()) {
                Complaint candidate = foundOpt.get();
                if (candidate.getUser() != null && candidate.getUser().getId().equals(currentUser.getId())) {
                    targetEntity = candidate;
                    matchedCaseId = candidate.getComplaintCustomId();
                } else {
                    matchedCaseId = "UNAUTHORIZED";
                }
            }
        } else if (activeComplaintEntities.size() == 1) {
            String msgLower = userMessage != null ? userMessage.toLowerCase() : "";
            boolean isExplicitStatus = msgLower.contains("status of") || msgLower.contains("complaint status") ||
                msgLower.contains("case status") || msgLower.contains("track my") || msgLower.contains("புகார் நிலை") ||
                msgLower.contains("வழக்கின் நிலை") || msgLower.contains("guide updates") || msgLower.contains("my uploaded documents");
            boolean hasGrievanceFacts = msgLower.contains("salary") || msgLower.contains("wages") || msgLower.contains("unpaid") ||
                msgLower.contains("patta") || msgLower.contains("land") || msgLower.contains("tenant") || msgLower.contains("rent") ||
                msgLower.contains("cheated") || msgLower.contains("scam") || msgLower.contains("fraud") || msgLower.contains("threat");
            if (isExplicitStatus && !hasGrievanceFacts) {
                targetEntity = activeComplaintEntities.get(0);
                matchedCaseId = targetEntity.getComplaintCustomId();
            }
        }

        CaseSummary targetedCaseSummary = null;
        if (targetEntity != null) {
            targetedCaseSummary = mapToDetailedSummary(targetEntity);
        }

        return new CitizenChatContextDTO(
                userSummary,
                activeCases,
                recentCases,
                targetedCaseSummary,
                matchedCaseId
        );
    }

    private CaseSummary mapToSummary(Complaint c) {
        String guideName = null;
        String guideSpec = null;
        if (c.getAssignedHelper() != null) {
            guideName = c.getAssignedHelper().getName();
            guideSpec = c.getAssignedHelper().getSpecialization();
        }

        String desc = c.getDescription();
        if (desc != null && desc.length() > 200) {
            desc = desc.substring(0, 200) + "...";
        }

        return new CaseSummary(
                c.getId(),
                c.getComplaintCustomId(),
                c.getTitle(),
                c.getCategory() != null ? c.getCategory().name() : "GENERAL_LEGAL_AID",
                c.getStatus() != null ? c.getStatus().name() : "PENDING",
                c.getPriority() != null ? c.getPriority().name() : "MEDIUM",
                c.getDistrict(),
                c.getAuthority(),
                c.getCreatedAt() != null ? c.getCreatedAt().format(DATE_FORMATTER) : null,
                guideName,
                guideSpec,
                desc,
                List.of(),
                List.of()
        );
    }

    private CaseSummary mapToDetailedSummary(Complaint c) {
        String guideName = null;
        String guideSpec = null;
        if (c.getAssignedHelper() != null) {
            guideName = c.getAssignedHelper().getName();
            guideSpec = c.getAssignedHelper().getSpecialization();
        }

        List<DocumentSummary> docs = List.of();
        try {
            List<UploadedDocument> docEntities = uploadedDocumentRepository.findByComplaint(c);
            if (docEntities != null) {
                docs = docEntities.stream().map(d -> new DocumentSummary(
                        d.getId(),
                        d.getPredictedDocumentType() != null ? d.getPredictedDocumentType() : (d.getFileType() != null ? d.getFileType() : "EVIDENCE"),
                        d.getFileName(),
                        d.getVerificationStatus() != null ? d.getVerificationStatus().name() : "PENDING",
                        d.getUploadedAt() != null ? d.getUploadedAt().format(DATE_FORMATTER) : ""
                )).collect(Collectors.toList());
            }
        } catch (Exception ignored) {}

        List<MessageSummary> messages = List.of();
        try {
            List<CaseMessage> msgEntities = caseMessageRepository.findByComplaintIdOrderByCreatedAtAsc(c.getId());
            if (msgEntities != null) {
                messages = msgEntities.stream()
                        .filter(m -> !"INTERNAL_ADMIN".equalsIgnoreCase(m.getSenderRole()))
                        .limit(10)
                        .map(m -> new MessageSummary(
                                m.getSenderRole(),
                                m.getMessageType(),
                                m.getMessageText(),
                                m.getCreatedAt() != null ? m.getCreatedAt().format(DATE_FORMATTER) : ""
                        )).collect(Collectors.toList());
            }
        } catch (Exception ignored) {}

        return new CaseSummary(
                c.getId(),
                c.getComplaintCustomId(),
                c.getTitle(),
                c.getCategory() != null ? c.getCategory().name() : "GENERAL_LEGAL_AID",
                c.getStatus() != null ? c.getStatus().name() : "PENDING",
                c.getPriority() != null ? c.getPriority().name() : "MEDIUM",
                c.getDistrict(),
                c.getAuthority(),
                c.getCreatedAt() != null ? c.getCreatedAt().format(DATE_FORMATTER) : null,
                guideName,
                guideSpec,
                c.getDescription(),
                docs,
                messages
        );
    }
}
