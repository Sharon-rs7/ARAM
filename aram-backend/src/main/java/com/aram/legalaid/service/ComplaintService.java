package com.aram.legalaid.service;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.enums.*;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.*;
import com.aram.legalaid.repository.AIResultRepository;
import com.aram.legalaid.repository.ComplaintRepository;
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

    public ComplaintService(ComplaintRepository complaintRepository, AIResultRepository aiResultRepository, UserService userService,
                            AIAnalysisService aiAnalysisService, NotificationService notificationService, MapperService mapperService,
                            BlockchainService blockchainService) {
        this.complaintRepository = complaintRepository;
        this.aiResultRepository = aiResultRepository;
        this.userService = userService;
        this.aiAnalysisService = aiAnalysisService;
        this.notificationService = notificationService;
        this.mapperService = mapperService;
        this.blockchainService = blockchainService;
    }

    @Transactional
    public ComplaintResponse submit(ComplaintRequest request) {
        User user = userService.currentUser();
        validateLanguage(request.language());

        Complaint complaint = new Complaint();
        complaint.setUser(user);
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
        complaint.setStatus(ComplaintStatus.SUBMITTED);

        Complaint savedComplaint = complaintRepository.save(complaint);
        blockchainService.mineBlock(savedComplaint);
        
        notificationService.create(user, "Your complaint has been submitted successfully. Complaint ID: " + savedComplaint.getId(), NotificationType.IN_APP);


        AIResult aiResult = aiAnalysisService.analyzeAndSave(savedComplaint);
        notificationService.create(user, "AI analysis completed. Category: " + aiResult.getCategory().getDisplayName() + ", Priority: " + aiResult.getPriority(), NotificationType.IN_APP);

        if (aiResult.getPriority() == PriorityLevel.HIGH || aiResult.getPriority() == PriorityLevel.CRITICAL || savedComplaint.isSensitive()) {
            notificationService.notifyAdmins("Attention required: Complaint ID " + savedComplaint.getId() + " is " + aiResult.getPriority() + " priority" + (savedComplaint.isSensitive() ? " and marked sensitive." : "."));
        }

        return mapperService.toComplaintResponse(savedComplaint, aiResult);
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
        if (user.getRole() != Role.ADMIN 
                && !complaint.getUser().getId().equals(user.getId())
                && (user.getRole() != Role.HELPER || complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(user.getId()))) {
            throw new ForbiddenException("You cannot view this complaint");
        }
        return mapperService.toComplaintResponse(complaint, aiResultRepository.findByComplaint(complaint).orElse(null));
    }

    @Transactional
    public AIResultResponse reAnalyze(Long id) {
        Complaint complaint = findComplaint(id);
        User user = userService.currentUser();
        if (user.getRole() != Role.ADMIN && !complaint.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You cannot analyze this complaint");
        }
        AIResult result = aiAnalysisService.analyzeAndSave(complaint);
        return aiAnalysisService.response(result);
    }

    @Transactional
    public ComplaintResponse updateStatus(Long id, StatusUpdateRequest request) {
        Complaint complaint = findComplaint(id);
        User user = userService.currentUser();
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.HELPER) {
            throw new ForbiddenException("Only admin/helper can update complaint status");
        }
        complaint.setStatus(request.status());
        if (request.note() != null) {
            complaint.setLegalOpinion(request.note());
        }
        Complaint saved = complaintRepository.save(complaint);
        notificationService.create(saved.getUser(), "Your complaint ID " + saved.getId() + " status changed to " + saved.getStatus(), NotificationType.IN_APP);
        return mapperService.toComplaintResponse(saved, aiResultRepository.findByComplaint(saved).orElse(null));
    }

    public Complaint findComplaint(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
    }

    public List<ComplaintResponse> allComplaints() {
        return complaintRepository.findAll().stream()
                .map(c -> mapperService.toComplaintResponse(c, aiResultRepository.findByComplaint(c).orElse(null)))
                .toList();
    }

    private void validateLanguage(String language) {
        if (language == null || !SUPPORTED_LANGUAGES.contains(language.trim().toUpperCase())) {
            throw new com.aram.legalaid.exception.BadRequestException("Supported languages: TAMIL, ENGLISH, HINDI, TANGLISH");
        }
    }
}
