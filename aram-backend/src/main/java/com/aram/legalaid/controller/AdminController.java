package com.aram.legalaid.controller;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.UserStatus;
import com.aram.legalaid.model.AuditLog;
import com.aram.legalaid.model.User;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.AIResult;
import com.aram.legalaid.repository.AuditLogRepository;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.service.AdminService;
import com.aram.legalaid.service.AuditLogService;
import com.aram.legalaid.service.ComplaintService;
import com.aram.legalaid.service.MapperService;
import com.aram.legalaid.service.VolunteerActivityService;
import java.util.Optional;
import com.aram.legalaid.util.ExcelExportUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;
    private final ComplaintService complaintService;
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final MapperService mapperService;
    private final AuditLogService auditLogService;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.aram.legalaid.service.AIClientService aiClientService;
    private final VolunteerActivityService volunteerActivityService;
    private final com.aram.legalaid.repository.AiCorrectionLogRepository aiCorrectionLogRepository;
    private final com.aram.legalaid.repository.AIResultRepository aiResultRepository;
    private final com.aram.legalaid.repository.LegalGuideProfileRepository guideProfileRepository;
    private final com.aram.legalaid.repository.LegalGuidePerformanceProfileRepository performanceProfileRepository;
    private final com.aram.legalaid.service.LegalGuideLevelService levelService;
    private final com.aram.legalaid.repository.GuideAssignmentDecisionLogRepository guideAssignmentDecisionLogRepository;

    public AdminController(AdminService adminService, ComplaintService complaintService, UserRepository userRepository,
                           ComplaintRepository complaintRepository, MapperService mapperService,
                           AuditLogService auditLogService, AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder, com.aram.legalaid.service.AIClientService aiClientService,
                           VolunteerActivityService volunteerActivityService,
                           com.aram.legalaid.repository.AiCorrectionLogRepository aiCorrectionLogRepository,
                           com.aram.legalaid.repository.AIResultRepository aiResultRepository,
                           com.aram.legalaid.repository.LegalGuideProfileRepository guideProfileRepository,
                           com.aram.legalaid.repository.LegalGuidePerformanceProfileRepository performanceProfileRepository,
                           com.aram.legalaid.service.LegalGuideLevelService levelService,
                           com.aram.legalaid.repository.GuideAssignmentDecisionLogRepository guideAssignmentDecisionLogRepository) {
        this.adminService = adminService;
        this.complaintService = complaintService;
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.mapperService = mapperService;
        this.auditLogService = auditLogService;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.aiClientService = aiClientService;
        this.volunteerActivityService = volunteerActivityService;
        this.aiCorrectionLogRepository = aiCorrectionLogRepository;
        this.aiResultRepository = aiResultRepository;
        this.guideProfileRepository = guideProfileRepository;
        this.performanceProfileRepository = performanceProfileRepository;
        this.levelService = levelService;
        this.guideAssignmentDecisionLogRepository = guideAssignmentDecisionLogRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard() {
        return ResponseEntity.ok(adminService.dashboard());
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> allComplaints() {
        return ResponseEntity.ok(complaintService.allComplaints());
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request, Principal principal) {
        ComplaintResponse response = complaintService.updateStatus(id, request);
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("COMPLAINT_STATUS_UPDATED", adminName, "Updated status of complaint ID " + id + " to " + request.status());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> users() {
        return ResponseEntity.ok(userRepository.findAll().stream().map(mapperService::toUserResponse).toList());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> user(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(mapperService.toUserResponse(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request, Principal principal) {
        User user = userRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("User not found"));
        StringBuilder details = new StringBuilder("Updated fields: ");
        if (request.name() != null) { user.setName(request.name()); details.append("name "); }
        if (request.bio() != null) { user.setBio(request.bio()); details.append("bio "); }
        if (request.district() != null) { user.setDistrict(request.district()); details.append("district "); }
        if (request.address() != null) { user.setAddress(request.address()); details.append("address "); }
        if (request.preferredLanguage() != null) { user.setPreferredLanguage(request.preferredLanguage()); details.append("preferredLanguage "); }
        if (request.gender() != null) { user.setGender(request.gender()); details.append("gender "); }
        if (request.specialization() != null) { user.setSpecialization(request.specialization()); details.append("specialization "); }
        if (request.status() != null) { user.setStatus(request.status()); details.append("status=").append(request.status()).append(" "); }
        
        User saved = userRepository.save(user);
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("USER_UPDATED", adminName, "Updated details for user: " + user.getEmail() + ". " + details.toString());
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<UserResponse> deleteUser(@PathVariable Long id, Principal principal) {
        User user = userRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.DELETED);
        User saved = userRepository.save(user);
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("USER_DELETED", adminName, "Soft deleted user: " + user.getEmail());
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }

    @GetMapping("/helpers")
    public ResponseEntity<List<UserResponse>> helpers() {
        return ResponseEntity.ok(userRepository.findByRole(Role.HELPER).stream().map(mapperService::toUserResponse).toList());
    }

    @PutMapping("/helpers/{id}/verify")
    public ResponseEntity<UserResponse> verifyHelper(@PathVariable Long id, Principal principal) {
        User helper = userRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Helper not found"));
        helper.setHelperVerified(true);
        helper.setStatus(UserStatus.ACTIVE);
        User saved = userRepository.save(helper);
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("HELPER_VERIFIED", adminName, "Verified helper: " + helper.getEmail());
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }

    @PutMapping("/helpers/{id}/reject")
    public ResponseEntity<UserResponse> rejectHelper(@PathVariable Long id, Principal principal) {
        User helper = userRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Helper not found"));
        helper.setHelperVerified(false);
        helper.setStatus(UserStatus.SUSPENDED);
        User saved = userRepository.save(helper);
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("HELPER_REJECTED", adminName, "Rejected helper: " + helper.getEmail());
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }

    @PutMapping("/complaints/{id}/assign-helper")
    public ResponseEntity<ComplaintResponse> assignHelper(@PathVariable Long id, @RequestBody java.util.Map<String, Object> body, Principal principal) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Complaint not found"));
        Long helperId = ((Number) body.get("helperId")).longValue();
        User helper = userRepository.findById(helperId).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Helper not found"));
        complaint.setAssignedHelper(helper);
        complaint.setStatus(ComplaintStatus.HELPER_ASSIGNED);
        Complaint saved = complaintRepository.save(complaint);
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("COMPLAINT_ASSIGNED", adminName, "Assigned helper " + helper.getEmail() + " to complaint ID " + id);

        // Record GuideAssignmentDecisionLog
        try {
            com.aram.legalaid.model.GuideAssignmentDecisionLog decisionLog = new com.aram.legalaid.model.GuideAssignmentDecisionLog();
            decisionLog.setComplaintId(id);
            decisionLog.setAssignedGuideId(helper.getId());
            if (principal != null) {
                userRepository.findByEmail(principal.getName()).ifPresent(admin -> decisionLog.setAdminId(admin.getId()));
            }
            if (body.containsKey("recommendedGuideId") && body.get("recommendedGuideId") != null) {
                decisionLog.setRecommendedGuideId(((Number) body.get("recommendedGuideId")).longValue());
            }
            if (body.containsKey("recommendationScore") && body.get("recommendationScore") != null) {
                decisionLog.setRecommendationScore(((Number) body.get("recommendationScore")).doubleValue());
            }
            if (body.containsKey("modelVersion") && body.get("modelVersion") != null) {
                decisionLog.setModelVersion(String.valueOf(body.get("modelVersion")));
            }
            if (body.containsKey("overrideReason") && body.get("overrideReason") != null) {
                decisionLog.setOverrideReason(String.valueOf(body.get("overrideReason")));
            }
            guideAssignmentDecisionLogRepository.save(decisionLog);
        } catch (Exception e) {
            // log fallback warning but do not break transaction
        }

        return ResponseEntity.ok(mapperService.toComplaintResponse(saved, null));
    }

    @DeleteMapping("/complaints/{id}")
    public ResponseEntity<ComplaintResponse> deleteComplaint(@PathVariable Long id, Principal principal) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Complaint not found"));
        complaint.setStatus(ComplaintStatus.DELETED);
        Complaint saved = complaintRepository.save(complaint);
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("COMPLAINT_DELETED", adminName, "Soft deleted complaint ID " + id);
        return ResponseEntity.ok(mapperService.toComplaintResponse(saved, null));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Map<String, Object>> auditLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "action", required = false) String action,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to
    ) {
        List<AuditLog> allLogs = auditLogRepository.findAllByOrderByTimestampDesc();
        java.util.stream.Stream<AuditLog> logStream = allLogs.stream();
        
        if (action != null && !action.trim().isEmpty()) {
            String lowerAction = action.toLowerCase().trim();
            logStream = logStream.filter(log -> log.getAction().toLowerCase().contains(lowerAction));
        }
        
        if (role != null && !role.trim().isEmpty()) {
            String lowerRole = role.toLowerCase().trim();
            logStream = logStream.filter(log -> {
                String performedBy = log.getPerformedBy();
                if ("system".equals(performedBy.toLowerCase()) || "system ai".equals(performedBy.toLowerCase())) {
                    return "system".contains(lowerRole) || "ai".contains(lowerRole);
                }
                
                Optional<User> u = userRepository.findByEmail(performedBy);
                if (u.isPresent()) {
                    return u.get().getRole().name().toLowerCase().contains(lowerRole);
                }
                return false;
            });
        }
        
        if (from != null && !from.trim().isEmpty()) {
            try {
                java.time.LocalDateTime fromDate = java.time.LocalDate.parse(from.trim()).atStartOfDay();
                logStream = logStream.filter(log -> !log.getTimestamp().isBefore(fromDate));
            } catch (Exception e) {
                // ignore
            }
        }
        
        if (to != null && !to.trim().isEmpty()) {
            try {
                java.time.LocalDateTime toDate = java.time.LocalDate.parse(to.trim()).plusDays(1).atStartOfDay();
                logStream = logStream.filter(log -> log.getTimestamp().isBefore(toDate));
            } catch (Exception e) {
                // ignore
            }
        }
        
        List<AuditLog> filteredLogs = logStream.toList();
        
        int totalElements = filteredLogs.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        int start = page * size;
        int end = Math.min(start + size, totalElements);
        
        List<AuditLog> paginated = (start < totalElements) ? filteredLogs.subList(start, end) : List.of();
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("content", paginated);
        response.put("currentPage", page);
        response.put("totalElements", totalElements);
        response.put("totalPages", totalPages);
        response.put("size", size);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics/complaint-trends")
    public ResponseEntity<List<Map<String, Object>>> getComplaintTrends() {
        return ResponseEntity.ok(adminService.getComplaintTrends());
    }

    @GetMapping("/analytics/category-distribution")
    public ResponseEntity<List<Map<String, Object>>> getCategoryDistribution() {
        return ResponseEntity.ok(adminService.getCategoryDistribution());
    }

    @GetMapping("/analytics/volunteer-workload")
    public ResponseEntity<Map<String, Object>> getVolunteerWorkload() {
        return ResponseEntity.ok(adminService.getVolunteerWorkload());
    }

    @GetMapping("/analytics/volunteer-activity")
    public ResponseEntity<Map<String, Object>> getVolunteerActivity() {
        return ResponseEntity.ok(volunteerActivityService.getOverallOverview());
    }

    @GetMapping("/reports")
    public ResponseEntity<AdminDashboardResponse> reports() {
        return ResponseEntity.ok(adminService.dashboard());
    }

    @GetMapping("/users/export")
    public ResponseEntity<byte[]> exportUsers(@RequestParam(value = "role", defaultValue = "CITIZEN") Role role, Principal principal) throws IOException {
        List<User> users = userRepository.findByRole(role);
        byte[] excelData = ExcelExportUtil.exportUsersToExcel(users);
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("EXCEL_EXPORT", adminName, "Exported " + role + " users list to Excel.");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", role.name().toLowerCase() + "_users.xlsx");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok().headers(headers).body(excelData);
    }

    @PostMapping("/helpers")
    public ResponseEntity<UserResponse> createHelper(@Valid @RequestBody CreateVolunteerRequest request, Principal principal) {
        if (userRepository.existsByEmail(request.email())) {
            throw new com.aram.legalaid.exception.BadRequestException("Email already exists");
        }
        
        User helper = new User();
        helper.setName(request.name());
        helper.setEmail(request.email());
        helper.setMobile(request.mobile());
        helper.setRole(Role.HELPER);
        helper.setStatus(UserStatus.ACTIVE);
        helper.setHelperVerified(true);
        
        String tempPassword = "AramVol@" + request.mobile().substring(6);
        helper.setPasswordHash(passwordEncoder.encode(tempPassword));
        helper.setForcePasswordChange(true);
        
        helper.setGender(request.gender());
        helper.setDistrict(request.district());
        helper.setLanguagesKnown(request.languagesKnown());
        helper.setSpecializationCategories(request.specializationCategories());
        helper.setMaxActiveCases(request.maxActiveCases() > 0 ? request.maxActiveCases() : 5);
        helper.setWomenSupportTrained(request.womenSupportTrained());
        helper.setCanHandleSensitiveCases(request.canHandleSensitiveCases());
        helper.setServiceArea(request.serviceArea());
        helper.setSubSpecializations(request.subSpecializations());
        helper.setExperienceLevel(request.experienceLevel());
        helper.setAvailabilityStatus("AVAILABLE");
        helper.setCurrentActiveCases(0);
        
        User saved = userRepository.save(helper);

        // Create LegalGuideProfile
        com.aram.legalaid.model.LegalGuideProfile guideProfile = new com.aram.legalaid.model.LegalGuideProfile();
        guideProfile.setUserId(saved.getId());
        guideProfile.setFullName(saved.getName());
        guideProfile.setEmail(saved.getEmail());
        guideProfile.setPhone(saved.getMobile());
        guideProfile.setGender(saved.getGender());
        guideProfile.setDistrict(saved.getDistrict());
        guideProfile.setServiceAreas(saved.getServiceArea());
        guideProfile.setLanguagesKnown(saved.getLanguagesKnown());
        guideProfile.setSupportsTanglish(saved.isSupportsTanglish());
        guideProfile.setSupportsHinglish(saved.isSupportsHinglish());
        guideProfile.setCanReadTamil(saved.isCanReadTamil());
        guideProfile.setCanReadHindi(saved.isCanReadHindi());
        guideProfile.setExpertiseCategories(saved.getSpecializationCategories());
        
        int expYears = 2;
        try {
            if (saved.getExperienceLevel() != null) {
                String expStr = saved.getExperienceLevel().replaceAll("[^0-9]", "");
                if (!expStr.isEmpty()) expYears = Integer.parseInt(expStr);
            }
        } catch (Exception e) {}
        guideProfile.setExperienceYears(expYears);
        guideProfile.setMaxCaseCapacity(saved.getMaxActiveCases());
        guideProfile.setCurrentWorkload(0);
        guideProfile.setAvailable(true);
        guideProfile.setWomenSupportTrained(saved.isWomenSupportTrained());
        guideProfile.setVerificationStatus("VERIFIED");
        guideProfileRepository.save(guideProfile);

        // Create performance profile (Level 1 Beginner, credits = 0)
        com.aram.legalaid.model.LegalGuidePerformanceProfile perf = levelService.getOrCreatePerformanceProfile(saved.getId());
        perf.setCurrentLevelNumber(1);
        perf.setCurrentLevelName("Beginner Legal Guide");
        perf.setCreditScore(0);
        performanceProfileRepository.save(perf);

        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("LEGAL_GUIDE_CREATED", adminName, "Admin created volunteer account and Legal Guide profile: " + request.email() + " with temp password " + tempPassword);
        
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }

    @GetMapping("/complaints/{id}/recommend-volunteers")
    public ResponseEntity<List<Map<String, Object>>> recommendVolunteersForComplaint(@PathVariable Long id) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Complaint not found"));
        
        List<User> activeVolunteers = userRepository.findByRole(Role.HELPER).stream()
                .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                .toList();
        
        List<Map<String, Object>> volunteerPayloads = activeVolunteers.stream().map(v -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", v.getId());
            map.put("name", v.getName());
            map.put("gender", v.getGender() != null ? v.getGender().toUpperCase() : "ANY");
            
            String langs = v.getLanguagesKnown();
            map.put("languagesKnown", langs != null ? List.of(langs.split(",")) : List.of("English"));
            
            map.put("district", v.getDistrict() != null ? v.getDistrict() : "Coimbatore");
            
            String specs = v.getSpecializationCategories();
            map.put("specializationCategories", specs != null ? List.of(specs.split(",")) : List.of());
            
            map.put("maxActiveCases", v.getMaxActiveCases());
            map.put("currentActiveCases", v.getCurrentActiveCases());
            map.put("availabilityStatus", v.getAvailabilityStatus());
            map.put("womenSupportTrained", v.isWomenSupportTrained());
            return map;
        }).toList();
        
        String catCode = complaint.getCategory() != null ? complaint.getCategory().name() : "GENERAL_LEGAL_AID";
        boolean preferWoman = complaint.isSensitive() || complaint.isWomenSensitive() || com.aram.legalaid.enums.HelperGender.FEMALE == complaint.getPreferredHelperGender();
        
        List<Map<String, Object>> recommendations = aiClientService.recommendVolunteers(
            catCode,
            complaint.getLanguage(),
            preferWoman,
            complaint.getDistrict(),
            volunteerPayloads
        );
        
        return ResponseEntity.ok(recommendations);
    }

    @PatchMapping("/complaints/{id}/assign-volunteer")
    public ResponseEntity<ComplaintResponse> assignVolunteer(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> body, 
            Principal principal) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Complaint not found"));
        
        Long volunteerId = ((Number) body.get("volunteerId")).longValue();
        User volunteer = userRepository.findById(volunteerId).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Volunteer not found"));
        
        boolean isSensitiveCase = complaint.isSensitive() || complaint.isWomenSensitive() || com.aram.legalaid.enums.HelperGender.FEMALE == complaint.getPreferredHelperGender();
        if (isSensitiveCase && !"FEMALE".equalsIgnoreCase(volunteer.getGender())) {
            String overrideReason = (String) body.get("overrideReason");
            if (overrideReason == null || overrideReason.trim().isEmpty()) {
                throw new com.aram.legalaid.exception.BadRequestException("Gender preference override requires a specified reason.");
            }
            complaint.setAssignmentOverrideReason(overrideReason);
            String adminName = principal != null ? principal.getName() : "admin@aram.ai";
            auditLogService.log("VOLUNTEER_GENDER_OVERRIDE", adminName, 
                "Admin assigned male volunteer " + volunteer.getEmail() + " to sensitive complaint ID " + id + ". Reason: " + overrideReason);
        }
        
        if (complaint.getAssignedHelper() != null) {
            User oldHelper = complaint.getAssignedHelper();
            oldHelper.setCurrentActiveCases(Math.max(0, oldHelper.getCurrentActiveCases() - 1));
            userRepository.save(oldHelper);
        }
        
        complaint.setAssignedHelper(volunteer);
        complaint.setStatus(ComplaintStatus.HELPER_ASSIGNED);
        Complaint saved = complaintRepository.save(complaint);
        
        volunteer.setCurrentActiveCases(volunteer.getCurrentActiveCases() + 1);
        userRepository.save(volunteer);
        
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("COMPLAINT_ASSIGNED", adminName, "Assigned volunteer " + volunteer.getEmail() + " to complaint ID " + id);
        
        return ResponseEntity.ok(mapperService.toComplaintResponse(saved, null));
    }

    @PutMapping("/complaints/{id}/correct-ai")
    public ResponseEntity<ComplaintResponse> correctAi(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Principal principal
    ) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Complaint not found"));

        AIResult aiResult = aiResultRepository.findByComplaint(complaint)
                .orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("AI Result not found"));

        String correctedCatStr = (String) body.get("correctedCategory");
        String correctedPrioStr = (String) body.get("correctedPriority");
        String correctedAuthStr = (String) body.get("correctedAuthority");
        String reason = (String) body.get("correctionReason");

        // Save log
        com.aram.legalaid.model.AiCorrectionLog log = new com.aram.legalaid.model.AiCorrectionLog();
        log.setComplaintId(complaint.getId());
        log.setModelVersion(aiResult.getModelVersion());
        log.setOriginalCategory(complaint.getCategory() != null ? complaint.getCategory().name() : "GENERAL_LEGAL_AID");
        log.setOriginalPriority(complaint.getPriority() != null ? complaint.getPriority().name() : "LOW");
        log.setOriginalAuthority(complaint.getAuthority() != null ? complaint.getAuthority() : "");

        if (correctedCatStr != null) {
            com.aram.legalaid.enums.ComplaintCategory correctedCat = com.aram.legalaid.enums.ComplaintCategory.valueOf(correctedCatStr);
            complaint.setCategory(correctedCat);
            aiResult.setCategory(correctedCat);
            log.setCorrectedCategory(correctedCatStr);
        }
        if (correctedPrioStr != null) {
            com.aram.legalaid.enums.PriorityLevel correctedPrio = com.aram.legalaid.enums.PriorityLevel.valueOf(correctedPrioStr);
            complaint.setPriority(correctedPrio);
            aiResult.setPriority(correctedPrio);
            log.setCorrectedPriority(correctedPrioStr);
        }
        if (correctedAuthStr != null) {
            complaint.setAuthority(correctedAuthStr);
            aiResult.setRecommendedAuthority(correctedAuthStr);
            log.setCorrectedAuthority(correctedAuthStr);
        }
        
        log.setCorrectionReason(reason);
        
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        User admin = userRepository.findByEmail(adminName).orElse(null);
        if (admin != null) {
            log.setCorrectedByAdminId(admin.getId());
        }
        
        aiResultRepository.save(aiResult);
        complaintRepository.save(complaint);
        aiCorrectionLogRepository.save(log);

        auditLogService.log("AI_TRIAGE_CORRECTED", adminName, "Admin corrected AI result for complaint ID " + id + ". Reason: " + reason);

        return ResponseEntity.ok(mapperService.toComplaintResponse(complaint, aiResult));
    }

    @GetMapping("/ai/correction-logs/export-csv")
    public ResponseEntity<byte[]> exportCorrectionLogsCSV(Principal principal) {
        List<com.aram.legalaid.model.AiCorrectionLog> logs = aiCorrectionLogRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("id,complaintId,modelVersion,originalCategory,correctedCategory,originalPriority,correctedPriority,originalAuthority,correctedAuthority,correctionReason,correctedByAdminId,createdAt\n");
        for (com.aram.legalaid.model.AiCorrectionLog log : logs) {
            csv.append(log.getId()).append(",")
               .append(log.getComplaintId()).append(",")
               .append(escapeCsv(log.getModelVersion())).append(",")
               .append(escapeCsv(log.getOriginalCategory())).append(",")
               .append(escapeCsv(log.getCorrectedCategory())).append(",")
               .append(escapeCsv(log.getOriginalPriority())).append(",")
               .append(escapeCsv(log.getCorrectedPriority())).append(",")
               .append(escapeCsv(log.getOriginalAuthority())).append(",")
               .append(escapeCsv(log.getCorrectedAuthority())).append(",")
               .append(escapeCsv(log.getCorrectionReason())).append(",")
               .append(log.getCorrectedByAdminId()).append(",")
               .append(log.getCreatedAt()).append("\n");
        }
        
        byte[] csvData = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("CSV_EXPORT", adminName, "Exported AI correction logs to CSV.");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "ai_correction_logs.csv");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok().headers(headers).body(csvData);
    }
    
    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
