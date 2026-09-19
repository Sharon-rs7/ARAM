package com.aram.legalaid.service;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.enums.*;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.*;
import com.aram.legalaid.repository.AIResultRepository;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class ComplaintService {
    private static final Set<String> SUPPORTED_LANGUAGES = Set.of("TAMIL", "ENGLISH", "HINDI", "TANGLISH");

    private final ComplaintRepository complaintRepository;
    private final AIResultRepository aiResultRepository;
    private final UserService userService;
    private final AIAnalysisService aiAnalysisService;
    private final NotificationService notificationService;
    private final MapperService mapperService;
    private final BlockchainService blockchainService;
    private final AIClientService aiClientService;
    private final ProfileCompletionService profileCompletionService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final JobService jobService;
    private final RedisNotificationPublisher redisNotificationPublisher;

    public ComplaintService(ComplaintRepository complaintRepository, AIResultRepository aiResultRepository, UserService userService,
                            AIAnalysisService aiAnalysisService, NotificationService notificationService, MapperService mapperService,
                            BlockchainService blockchainService, AIClientService aiClientService, ProfileCompletionService profileCompletionService,
                            EmailService emailService, UserRepository userRepository, JobService jobService, RedisNotificationPublisher redisNotificationPublisher) {
        this.complaintRepository = complaintRepository;
        this.aiResultRepository = aiResultRepository;
        this.userService = userService;
        this.aiAnalysisService = aiAnalysisService;
        this.notificationService = notificationService;
        this.mapperService = mapperService;
        this.blockchainService = blockchainService;
        this.aiClientService = aiClientService;
        this.profileCompletionService = profileCompletionService;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.jobService = jobService;
        this.redisNotificationPublisher = redisNotificationPublisher;
    }

    @Transactional
    public ComplaintResponse submit(ComplaintRequest request) {
        User user = userService.currentUser();
        
        // Enforce profile completion gate
        ProfileCompletionService.CompletionState state = profileCompletionService.recalculateAndSave(user);
        if (user.getRole() != Role.CITIZEN) {
            throw new com.aram.legalaid.exception.ForbiddenException("Only Citizens can submit complaints.");
        }
        if (!state.isProfileCompleted()) {
            throw new com.aram.legalaid.exception.ProfileIncompleteException(
                "Please complete and verify your profile before submitting a complaint.",
                state.getCompletionPercentage()
            );
        }

        validateLanguage(request.language());

        Complaint complaint = new Complaint();
        complaint.setUser(user);
        
        // Generate unique complaint ID: ARAM-{YY}-{STATE}-{DISTRICT}-{SEQUENCE}
        int year = java.time.LocalDateTime.now().getYear();
        String stateCode = getStateCode(user.getState());
        String districtCode = getDistrictCode(request.district());
        Long seqVal = complaintRepository.getNextComplaintSequenceValue();
        long val = seqVal != null ? seqVal : 1L;
        String sequenceStr = String.format("%06d", val);
        String customId = String.format("ARAM-%02d-%s-%s-%s", year % 100, stateCode, districtCode, sequenceStr);
        complaint.setComplaintCustomId(customId);

        complaint.setTitle(request.title().trim());
        complaint.setDescription(request.description().trim());
        complaint.setLanguage(request.language().trim().toUpperCase());
        complaint.setDistrict(request.district());
        complaint.setInputMode(request.inputMode());
        complaint.setTranscribedText(request.transcribedText());
        complaint.setTranscriptionConfidence(request.transcriptionConfidence());
        complaint.setSensitive(Boolean.TRUE.equals(request.sensitive()));
        complaint.setPreferredHelperGender(request.preferredHelperGender() == null ? HelperGender.ANY : request.preferredHelperGender());
        complaint.setIdentityVisibility(request.identityVisibility() == null ? IdentityVisibility.VISIBLE : request.identityVisibility());
        complaint.setDisclaimerAccepted(Boolean.TRUE.equals(request.disclaimerAccepted()));
        if (complaint.isDisclaimerAccepted()) {
            complaint.setDisclaimerAcceptedAt(java.time.LocalDateTime.now());
        }
        if (request.safeContactMethod() != null) {
            complaint.setSafeContactMethod(request.safeContactMethod());
        }
        if (request.safeContactTime() != null) {
            complaint.setSafeContactTime(request.safeContactTime());
        }
        if (request.category() != null) {
            try {
                complaint.setCategory(com.aram.legalaid.enums.ComplaintCategory.valueOf(request.category().toUpperCase()));
            } catch (Exception e) {}
        }
        if (request.priority() != null) {
            try {
                complaint.setPriority(com.aram.legalaid.enums.PriorityLevel.valueOf(request.priority().toUpperCase()));
            } catch (Exception e) {}
        }
        complaint.setStatus(ComplaintStatus.SUBMITTED);

        Complaint savedComplaint = complaintRepository.save(complaint);
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                blockchainService.mineBlock(savedComplaint);
            } catch (Exception bex) {
                System.err.println("Async blockchain mine failed: " + bex.getMessage());
            }
        });
        
        notificationService.create(user, "Your complaint has been submitted successfully. Complaint Custom ID: " + savedComplaint.getComplaintCustomId(), NotificationType.IN_APP);

        // Notify district and global admins
        try {
            List<User> admins = userService.getAdmins();
            for (User admin : admins) {
                if (admin.getDistrict() == null || admin.getDistrict().equalsIgnoreCase("GLOBAL") || (savedComplaint.getDistrict() != null && admin.getDistrict().equalsIgnoreCase(savedComplaint.getDistrict()))) {
                    notificationService.create(admin, "New complaint registered in " + savedComplaint.getDistrict() + ": " + savedComplaint.getComplaintCustomId() + " (" + savedComplaint.getTitle() + ")", NotificationType.IN_APP);
                }
            }
            userRepository.findByRole(Role.SUPER_ADMIN).forEach(superAdmin -> {
                notificationService.create(superAdmin, "New grievance filed: " + savedComplaint.getComplaintCustomId() + " (" + savedComplaint.getDistrict() + ")", NotificationType.IN_APP);
            });
        } catch (Exception nEx) {
            System.err.println("Admin notification error: " + nEx.getMessage());
        }

        // Redis WebSocket publish for new complaint submission
        redisNotificationPublisher.publishNotification(
                "NEW_COMPLAINT",
                savedComplaint.getId(),
                user.getId(),
                "New complaint submitted: ARAM-" + savedComplaint.getId()
        );

        try {
            String citizenState = (user.getState() != null && !user.getState().trim().isEmpty()) ? user.getState() : "Tamil Nadu";
            emailService.sendComplaintSubmittedEmail(user.getEmail(), user.getName(), savedComplaint.getComplaintCustomId(), savedComplaint.getDistrict(), citizenState);
        } catch (Exception e) {
            System.err.println("Failed to send complaint submission email: " + e.getMessage());
        }

        // Asynchronously queue AI Analysis using the existing Redis queue
        java.util.Map<String, Object> metadata = new java.util.HashMap<>();
        metadata.put("complaintId", savedComplaint.getComplaintCustomId());
        metadata.put("title", savedComplaint.getTitle());
        metadata.put("description", savedComplaint.getDescription());
        metadata.put("languageHint", savedComplaint.getLanguage());
        metadata.put("district", savedComplaint.getDistrict());
        metadata.put("isSensitive", savedComplaint.isSensitive());
        metadata.put("preferredHelperGender", savedComplaint.getPreferredHelperGender() != null ? savedComplaint.getPreferredHelperGender().name() : "ANY");
        metadata.put("userId", user.getId());

        List<Complaint> previous = complaintRepository.findByUserOrderByCreatedAtDesc(user);
        List<java.util.Map<String, Object>> existingPayloads = new java.util.ArrayList<>();
        for (Complaint p : previous) {
            if (!p.getId().equals(savedComplaint.getId())) {
                existingPayloads.add(java.util.Map.of(
                    "id", p.getId(),
                    "title", p.getTitle() != null ? p.getTitle() : "",
                    "description", p.getDescription() != null ? p.getDescription() : ""
                ));
            }
        }
        metadata.put("existingComplaints", existingPayloads);

        String metadataJson = "";
        try {
            metadataJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(metadata);
        } catch (Exception ignored) {}

        jobService.createJob(savedComplaint.getId(), user.getId(), "COMPLAINT_ANALYSIS", "complaint_" + savedComplaint.getId(), metadataJson);

        return mapperService.toComplaintResponse(savedComplaint, null);
    }

    public List<ComplaintResponse> myComplaints() {
        User user = userService.currentUser();
        return complaintRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(c -> mapperService.toComplaintResponse(c, aiResultRepository.findByComplaint(c).orElse(null)))
                .toList();
    }

    public ComplaintResponse getById(Long id) {
        Complaint complaint = findComplaint(id);
        User user = userService.currentUser();
        
        // Scope permissions
        if (user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.ADMIN) {
            if (!complaint.getUser().getId().equals(user.getId())
                    && (user.getRole() != Role.HELPER || complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(user.getId()))) {
                throw new ForbiddenException("You cannot view this complaint");
            }
        } else if (user.getRole() == Role.ADMIN && user.getDistrict() != null && !user.getDistrict().equalsIgnoreCase("GLOBAL")) {
            // Scope Admin queries by district
            if (complaint.getDistrict() == null || !complaint.getDistrict().equalsIgnoreCase(user.getDistrict())) {
                throw new ForbiddenException("Access denied: Case does not belong to your district (" + user.getDistrict() + ")");
            }
        }
        return mapperService.toComplaintResponse(complaint, aiResultRepository.findByComplaint(complaint).orElse(null));
    }

    public ComplaintResponse getByCustomId(String customId) {
        Complaint complaint = complaintRepository.findByComplaintCustomId(customId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + customId));
        
        User user = userService.currentUser();
        
        // Scope permissions
        if (user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.ADMIN) {
            if (!complaint.getUser().getId().equals(user.getId())
                    && (user.getRole() != Role.HELPER || complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(user.getId()))) {
                throw new ForbiddenException("You cannot view this complaint");
            }
        } else if (user.getRole() == Role.ADMIN && user.getDistrict() != null && !user.getDistrict().equalsIgnoreCase("GLOBAL")) {
            // Scope Admin queries by district
            if (complaint.getDistrict() == null || !complaint.getDistrict().equalsIgnoreCase(user.getDistrict())) {
                throw new ForbiddenException("Access denied: Case does not belong to your district (" + user.getDistrict() + ")");
            }
        }
        return mapperService.toComplaintResponse(complaint, aiResultRepository.findByComplaint(complaint).orElse(null));
    }

    @Transactional
    public AIResultResponse reAnalyze(Long id) {
        Complaint complaint = findComplaint(id);
        User user = userService.currentUser();
        
        if (user.getRole() == Role.ADMIN && user.getDistrict() != null && !user.getDistrict().equalsIgnoreCase("GLOBAL")) {
            if (complaint.getDistrict() == null || !complaint.getDistrict().equalsIgnoreCase(user.getDistrict())) {
                throw new ForbiddenException("Access denied: Case does not belong to your district (" + user.getDistrict() + ")");
            }
        } else if (user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.ADMIN && !complaint.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You cannot analyze this complaint");
        }
        
        // Clean up old AIResult
        aiResultRepository.findByComplaint(complaint).ifPresent(aiResultRepository::delete);
        
        // Re-queue analysis job
        java.util.Map<String, Object> metadata = new java.util.HashMap<>();
        metadata.put("complaintId", complaint.getComplaintCustomId());
        metadata.put("title", complaint.getTitle());
        metadata.put("description", complaint.getDescription());
        metadata.put("languageHint", complaint.getLanguage());
        metadata.put("district", complaint.getDistrict());
        metadata.put("isSensitive", complaint.isSensitive());
        metadata.put("preferredHelperGender", complaint.getPreferredHelperGender() != null ? complaint.getPreferredHelperGender().name() : "ANY");
        metadata.put("userId", complaint.getUser().getId());

        List<Complaint> previous = complaintRepository.findByUserOrderByCreatedAtDesc(complaint.getUser());
        List<java.util.Map<String, Object>> existingPayloads = new java.util.ArrayList<>();
        for (Complaint p : previous) {
            if (!p.getId().equals(complaint.getId())) {
                existingPayloads.add(java.util.Map.of(
                    "id", p.getId(),
                    "title", p.getTitle() != null ? p.getTitle() : "",
                    "description", p.getDescription() != null ? p.getDescription() : ""
                ));
            }
        }
        metadata.put("existingComplaints", existingPayloads);

        String metadataJson = "";
        try {
            metadataJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(metadata);
        } catch (Exception ignored) {}

        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaintRepository.save(complaint);

        jobService.createJob(complaint.getId(), complaint.getUser().getId(), "COMPLAINT_ANALYSIS", "complaint_" + complaint.getId(), metadataJson);
        
        return null;
    }

    @Transactional
    public ComplaintResponse updateStatus(Long id, StatusUpdateRequest request) {
        Complaint complaint = findComplaint(id);
        User user = userService.currentUser();
        
        // Admin scoping
        if (user.getRole() == Role.ADMIN && user.getDistrict() != null && !user.getDistrict().equalsIgnoreCase("GLOBAL")) {
            if (complaint.getDistrict() == null || !complaint.getDistrict().equalsIgnoreCase(user.getDistrict())) {
                throw new ForbiddenException("Access denied: Case does not belong to your district (" + user.getDistrict() + ")");
            }
        }
        
        // Guide scoping
        if (user.getRole() == Role.HELPER) {
            if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(user.getId())) {
                throw new ForbiddenException("Only the assigned Guide can update this complaint status");
            }
        }
        
        // Enforce state transitions
        validateTransition(complaint.getStatus(), request.status());
        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(request.status());
        if (request.note() != null) {
            complaint.setLegalOpinion(request.note());
        }
        Complaint saved = complaintRepository.save(complaint);
        
        try {
            aiClientService.syncComplaint(
                saved.getComplaintCustomId(),
                saved.getStatus().name(),
                saved.getAssignedHelper() != null ? saved.getAssignedHelper().getId().toString() : null,
                saved.getAssignedHelper() != null ? saved.getAssignedHelper().getName() : null,
                request.note()
            );
        } catch (Exception e) {
            System.err.println("FastAPI sync failed: " + e.getMessage());
        }

        notificationService.create(saved.getUser(), "Your complaint status changed to " + saved.getStatus(), NotificationType.IN_APP);

        if (saved.getUser() != null && saved.getUser().getEmail() != null && oldStatus != request.status()) {
            try {
                emailService.sendComplaintStatusUpdateEmail(
                    saved.getUser().getEmail(),
                    saved.getUser().getName(),
                    saved.getComplaintCustomId(),
                    oldStatus.name(),
                    request.status().name()
                );
                if (request.status() == ComplaintStatus.RESOLVED || request.status() == ComplaintStatus.RESOLVED_BY_GUIDE) {
                    emailService.sendCaseResolvedEmail(
                        saved.getUser().getEmail(),
                        saved.getUser().getName(),
                        saved.getComplaintCustomId(),
                        request.note()
                    );
                }
            } catch (Exception mEx) {
                System.err.println("Status update email error: " + mEx.getMessage());
            }
        }

        return mapperService.toComplaintResponse(saved, aiResultRepository.findByComplaint(saved).orElse(null));
    }

    private void validateTransition(ComplaintStatus current, ComplaintStatus next) {
        if (current == next) return;
        
        if (current == ComplaintStatus.CLOSED && next != ComplaintStatus.REOPEN_REQUESTED) {
            throw new com.aram.legalaid.exception.BadRequestException("A closed case cannot be directly updated. Please request to reopen first.");
        }
        
        if (current == ComplaintStatus.DELETED || current == ComplaintStatus.REJECTED) {
            throw new com.aram.legalaid.exception.BadRequestException("Terminated cases (deleted/rejected) cannot be updated.");
        }
    }

    public Complaint findComplaint(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
    }

    public List<ComplaintResponse> allComplaints() {
        User currentUser = userService.currentUser();
        List<Complaint> list;
        if (currentUser.getRole() == Role.SUPER_ADMIN || currentUser.getDistrict() == null || currentUser.getDistrict().equalsIgnoreCase("GLOBAL")) {
            list = complaintRepository.findAll();
        } else {
            list = complaintRepository.findByDistrictOrderByCreatedAtDesc(currentUser.getDistrict());
        }
        return list.stream()
                .map(c -> mapperService.toComplaintResponse(c, aiResultRepository.findByComplaint(c).orElse(null)))
                .toList();
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> emailCopy(Long id) {
        Complaint complaint = findComplaint(id);
        User currentUser = userService.currentUser();
        
        if (!currentUser.getId().equals(complaint.getUser().getId()) && currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.SUPER_ADMIN) {
            throw new ForbiddenException("You can only email copies of your own complaints.");
        }
        
        String recipientEmail = currentUser.getEmail();
        String customId = complaint.getComplaintCustomId() != null ? complaint.getComplaintCustomId() : ("CMP-" + complaint.getId());
        emailService.sendComplaintSubmittedEmail(
            recipientEmail,
            currentUser.getName(),
            customId,
            complaint.getDistrict() != null ? complaint.getDistrict() : "Tamil Nadu",
            (complaint.getUser() != null && complaint.getUser().getState() != null) ? complaint.getUser().getState() : "Tamil Nadu"
        );
        
        return java.util.Map.of(
            "success", true,
            "message", "Complaint copy sent to " + recipientEmail,
            "email", recipientEmail
        );
    }

    private void validateLanguage(String language) {
        if (language == null || !SUPPORTED_LANGUAGES.contains(language.trim().toUpperCase())) {
            throw new com.aram.legalaid.exception.BadRequestException("Supported languages: TAMIL, ENGLISH, HINDI, TANGLISH");
        }
    }

    public java.util.Map<String, Object> checkSimilarity(String title, String description) {
        User user = userService.currentUser();
        List<Complaint> previous = complaintRepository.findByUserOrderByCreatedAtDesc(user);
        
        if (previous.isEmpty()) {
            return java.util.Map.of("similarComplaintFound", false, "similarityScore", 0.0);
        }
        
        List<java.util.Map<String, Object>> existingPayloads = new java.util.ArrayList<>();
        for (Complaint p : previous) {
            existingPayloads.add(java.util.Map.of(
                "id", p.getId(),
                "title", p.getTitle() != null ? p.getTitle() : "",
                "description", p.getDescription() != null ? p.getDescription() : ""
            ));
        }
        
        AiTriageResponse triageRes = aiClientService.analyzeComplaint(
            "", null, "Coimbatore", title, description, "en", "Coimbatore", false, "ANY", existingPayloads
        );
        
        Long similarId = null;
        if (triageRes.similarComplaintFound()) {
            for (Complaint p : previous) {
                if (p.getStatus() != ComplaintStatus.RESOLVED) {
                    similarId = p.getId();
                    break;
                }
            }
            if (similarId == null && !previous.isEmpty()) {
                similarId = previous.get(0).getId();
            }
        }
        
        return java.util.Map.of(
            "similarComplaintFound", triageRes.similarComplaintFound(),
            "similarComplaintId", similarId != null ? similarId : 0L,
            "similarityScore", triageRes.similarComplaintFound() ? 0.85 : 0.0
        );
    }

    private static String getStateCode(String stateName) {
        if (stateName == null || stateName.trim().isEmpty()) {
            return "TN";
        }
        String normalized = stateName.trim().toUpperCase();
        if (normalized.equals("TAMIL NADU") || normalized.equals("TAMILNADU")) {
            return "TN";
        }
        if (normalized.equals("PUDUCHERRY") || normalized.equals("PONDICHERRY")) {
            return "PY";
        }
        if (normalized.equals("KERALA")) {
            return "KL";
        }
        if (normalized.equals("KARNATAKA")) {
            return "KA";
        }
        if (normalized.equals("ANDHRA PRADESH")) {
            return "AP";
        }
        if (normalized.length() >= 2) {
            return normalized.substring(0, 2);
        }
        return "TN";
    }

    private static String getDistrictCode(String districtName) {
        if (districtName == null || districtName.trim().isEmpty()) {
            return "CBE";
        }
        String normalized = districtName.trim().toLowerCase();
        switch (normalized) {
            case "chennai": return "CHE";
            case "coimbatore": return "CBE";
            case "madurai": return "MDU";
            case "tiruchirappalli":
            case "trichy": return "TRZ";
            case "salem": return "SLM";
            case "tirunelveli": return "TNV";
            case "erode": return "ERD";
            case "vellore": return "VLR";
            case "thoothukudi":
            case "tuticorin": return "TUT";
            case "nagercoil": return "NGL";
            default:
                if (normalized.length() >= 3) {
                    return normalized.substring(0, 3).toUpperCase();
                }
                return "CBE";
        }
    }
}
