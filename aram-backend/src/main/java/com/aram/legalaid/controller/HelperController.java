package com.aram.legalaid.controller;

import com.aram.legalaid.dto.ComplaintResponse;
import com.aram.legalaid.dto.StatusUpdateRequest;
import com.aram.legalaid.dto.UserResponse;
import com.aram.legalaid.dto.UserUpdateRequest;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.AIResultRepository;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.service.ComplaintService;
import com.aram.legalaid.service.MapperService;
import com.aram.legalaid.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/helper")
public class HelperController {
    private final UserService userService;
    private final MapperService mapperService;
    private final ComplaintRepository complaintRepository;
    private final AIResultRepository aiResultRepository;
    private final ComplaintService complaintService;
    private final UserRepository userRepository;

    private final com.aram.legalaid.service.LegalGuideLevelService legalGuideLevelService;
    private final com.aram.legalaid.service.CaseCommunicationService caseCommunicationService;

    public HelperController(UserService userService, MapperService mapperService, ComplaintRepository complaintRepository, AIResultRepository aiResultRepository, ComplaintService complaintService, UserRepository userRepository, com.aram.legalaid.service.LegalGuideLevelService legalGuideLevelService, com.aram.legalaid.service.CaseCommunicationService caseCommunicationService) {
        this.userService = userService;
        this.mapperService = mapperService;
        this.complaintRepository = complaintRepository;
        this.aiResultRepository = aiResultRepository;
        this.complaintService = complaintService;
        this.userRepository = userRepository;
        this.legalGuideLevelService = legalGuideLevelService;
        this.caseCommunicationService = caseCommunicationService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> profile() {
        User user = requireHelper();
        return ResponseEntity.ok(mapperService.toUserResponse(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UserUpdateRequest request) {
        requireHelper();
        return ResponseEntity.ok(mapperService.toUserResponse(userService.updateCurrentUser(request)));
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<UserResponse> avatar(@RequestParam("file") MultipartFile file) {
        requireHelper();
        return ResponseEntity.ok(mapperService.toUserResponse(userService.updateAvatar(file)));
    }

    @GetMapping("/cases")
    public ResponseEntity<List<ComplaintResponse>> cases() {
        User helper = requireHelper();
        return ResponseEntity.ok(complaintRepository.findByAssignedHelperOrderByCreatedAtDesc(helper).stream()
                .map(this::toResponse)
                .toList());
    }

    @GetMapping("/cases/{id}")
    public ResponseEntity<ComplaintResponse> caseDetails(@PathVariable Long id) {
        User helper = requireHelper();
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Complaint not found"));
        if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(helper.getId())) {
            throw new ForbiddenException("You can access assigned cases only");
        }
        return ResponseEntity.ok(toResponse(complaint));
    }

    @RequestMapping(value = "/cases/{id}/status", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<ComplaintResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        requireHelper();
        caseDetails(id);
        return ResponseEntity.ok(complaintService.updateStatus(id, request));
    }

    @PostMapping("/cases/{id}/acknowledge")
    public ResponseEntity<ComplaintResponse> acknowledgeCase(@PathVariable Long id) {
        User helper = requireHelper();
        caseCommunicationService.acknowledgeComplaint(id, helper);
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Complaint not found"));
        return ResponseEntity.ok(toResponse(complaint));
    }

    @PostMapping("/cases/{id}/notes")
    public ResponseEntity<ComplaintResponse> addNote(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        requireHelper();
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Complaint not found"));
        String note = body.get("note");
        if (note != null) {
            complaint.setLegalOpinion(note);
            complaintRepository.save(complaint);
        }
        return ResponseEntity.ok(toResponse(complaint));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<java.util.Map<String, Object>> getDashboard() {
        User helper = requireHelper();
        List<Complaint> cases = complaintRepository.findByAssignedHelperOrderByCreatedAtDesc(helper);

        java.util.Map<String, Object> volunteerInfo = new java.util.HashMap<>();
        volunteerInfo.put("id", helper.getId());
        volunteerInfo.put("name", helper.getName());
        volunteerInfo.put("email", helper.getEmail());
        volunteerInfo.put("role", helper.getRole().name());
        volunteerInfo.put("verified", helper.isHelperVerified());
        volunteerInfo.put("availabilityStatus", helper.getAvailabilityStatus());
        volunteerInfo.put("languages", helper.getLanguagesKnown() != null ? List.of(helper.getLanguagesKnown().split(",")) : List.of("English", "Tamil"));
        volunteerInfo.put("specializations", helper.getSpecialization() != null ? List.of(helper.getSpecialization().split(",")) : List.of("Labour Rights", "General Legal Aid"));
        volunteerInfo.put("currentActiveCases", helper.getCurrentActiveCases());
        volunteerInfo.put("maxActiveCases", helper.getMaxActiveCases());
        
        com.aram.legalaid.model.LegalGuidePerformanceProfile perf = legalGuideLevelService.getOrCreatePerformanceProfile(helper.getId());
        volunteerInfo.put("creditScore", perf.getCreditScore());
        volunteerInfo.put("levelName", perf.getCurrentLevelName());
        volunteerInfo.put("levelNumber", perf.getCurrentLevelNumber());
        
        volunteerInfo.put("successRate", 95);

        long assigned = cases.size();
        long pending = cases.stream().filter(c -> "UNDER_REVIEW".equalsIgnoreCase(c.getStatus().name()) || "SUBMITTED".equalsIgnoreCase(c.getStatus().name())).count();
        long inProgress = cases.stream().filter(c -> "IN_PROGRESS".equalsIgnoreCase(c.getStatus().name())).count();
        long resolved = cases.stream().filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus().name())).count();
        long highPriority = cases.stream().filter(c -> c.getPriority() != null && ("HIGH".equalsIgnoreCase(c.getPriority().name()) || "CRITICAL".equalsIgnoreCase(c.getPriority().name()))).count();
        long womenSensitive = cases.stream().filter(c -> c.isWomenSensitive() || c.isSensitive()).count();

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("assigned", assigned);
        stats.put("pending", pending);
        stats.put("inProgress", inProgress);
        stats.put("resolved", resolved);
        stats.put("highPriority", highPriority);
        stats.put("womenSensitive", womenSensitive);
        stats.put("averageResponseTimeMinutes", 42);

        java.util.Map<String, Object> activity = new java.util.HashMap<>();
        activity.put("lastLogin", "Today");
        activity.put("casesViewedToday", 3);
        activity.put("notesAddedToday", 1);
        activity.put("statusUpdatesToday", 1);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("volunteer", volunteerInfo);
        response.put("stats", stats);
        response.put("activity", activity);
        response.put("assignedCases", cases.stream().limit(5).map(this::toResponse).toList());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/availability")
    public ResponseEntity<UserResponse> updateAvailability(@RequestBody java.util.Map<String, String> body) {
        User helper = requireHelper();
        String status = body.get("availabilityStatus");
        if (status != null) {
            helper.setAvailabilityStatus(status);
            userRepository.save(helper);
        }
        return ResponseEntity.ok(mapperService.toUserResponse(helper));
    }

    private User requireHelper() {
        User user = userService.currentUser();
        if (user.getRole() != Role.HELPER) throw new ForbiddenException("Helper role required");
        return user;
    }

    private ComplaintResponse toResponse(Complaint complaint) {
        return mapperService.toComplaintResponse(complaint, aiResultRepository.findByComplaint(complaint).orElse(null));
    }
}
