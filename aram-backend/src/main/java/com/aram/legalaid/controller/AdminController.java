package com.aram.legalaid.controller;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.UserStatus;
import com.aram.legalaid.model.AuditLog;
import com.aram.legalaid.model.User;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.AIResult;
import com.aram.legalaid.model.LegalGuidePerformanceProfile;
import com.aram.legalaid.repository.AuditLogRepository;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.service.AdminService;
import com.aram.legalaid.service.AuditLogService;
import com.aram.legalaid.service.ComplaintService;
import com.aram.legalaid.service.MapperService;
import com.aram.legalaid.service.VolunteerActivityService;
import com.aram.legalaid.service.UserService;
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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.aram.legalaid.repository.GuideInvitationRepository;
import com.aram.legalaid.model.GuideInvitation;
import java.time.LocalDateTime;
import java.util.UUID;

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
    private final GuideInvitationRepository guideInvitationRepository;
    private final UserService userService;
    private final com.aram.legalaid.service.AIClientService aiClientService;
    private final VolunteerActivityService volunteerActivityService;
    private final com.aram.legalaid.repository.AiCorrectionLogRepository aiCorrectionLogRepository;
    private final com.aram.legalaid.repository.AIResultRepository aiResultRepository;
    private final com.aram.legalaid.repository.LegalGuideProfileRepository guideProfileRepository;
    private final com.aram.legalaid.repository.LegalGuidePerformanceProfileRepository performanceProfileRepository;
    private final com.aram.legalaid.service.LegalGuideLevelService levelService;
    private final com.aram.legalaid.repository.GuideAssignmentDecisionLogRepository guideAssignmentDecisionLogRepository;
    private final com.aram.legalaid.service.EmailService emailService;

    @Autowired
    private com.aram.legalaid.service.BlockchainService blockchainService;

    @Autowired
    private com.aram.legalaid.repository.BlockchainBlockRepository blockchainBlockRepository;

    @Autowired
    private com.aram.legalaid.scheduler.AuditMonitoringScheduler auditMonitoringScheduler;

    @Autowired
    private com.aram.legalaid.service.StatewideAnalyticsService statewideAnalyticsService;

    @Autowired
    private com.aram.legalaid.service.CommunicationGateway communicationGateway;

    public AdminController(AdminService adminService, ComplaintService complaintService, UserRepository userRepository,
                           ComplaintRepository complaintRepository, MapperService mapperService,
                           AuditLogService auditLogService, AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder, GuideInvitationRepository guideInvitationRepository,
                           UserService userService,
                           com.aram.legalaid.service.AIClientService aiClientService,
                           VolunteerActivityService volunteerActivityService,
                           com.aram.legalaid.repository.AiCorrectionLogRepository aiCorrectionLogRepository,
                           com.aram.legalaid.repository.AIResultRepository aiResultRepository,
                           com.aram.legalaid.repository.LegalGuideProfileRepository guideProfileRepository,
                           com.aram.legalaid.repository.LegalGuidePerformanceProfileRepository performanceProfileRepository,
                           com.aram.legalaid.service.LegalGuideLevelService levelService,
                           com.aram.legalaid.repository.GuideAssignmentDecisionLogRepository guideAssignmentDecisionLogRepository,
                           com.aram.legalaid.service.EmailService emailService) {
        this.adminService = adminService;
        this.complaintService = complaintService;
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.mapperService = mapperService;
        this.auditLogService = auditLogService;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.guideInvitationRepository = guideInvitationRepository;
        this.userService = userService;
        this.aiClientService = aiClientService;
        this.volunteerActivityService = volunteerActivityService;
        this.aiCorrectionLogRepository = aiCorrectionLogRepository;
        this.aiResultRepository = aiResultRepository;
        this.guideProfileRepository = guideProfileRepository;
        this.performanceProfileRepository = performanceProfileRepository;
        this.levelService = levelService;
        this.guideAssignmentDecisionLogRepository = guideAssignmentDecisionLogRepository;
        this.emailService = emailService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard(Principal principal) {
        String email = principal != null ? principal.getName() : "admin@gmail.com";
        User admin = userRepository.findByEmail(email).orElse(null);
        String districtFilter = null;
        if (admin != null && admin.getDistrict() != null && !admin.getDistrict().isEmpty() && !"GLOBAL".equalsIgnoreCase(admin.getDistrict())) {
            districtFilter = admin.getDistrict();
        }
        return ResponseEntity.ok(adminService.dashboard(districtFilter));
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> allComplaints() {
        return ResponseEntity.ok(complaintService.allComplaints());
    }

    @RequestMapping(value = "/complaints/{id}/status", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<ComplaintResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request, Principal principal) {
        ComplaintResponse response = complaintService.updateStatus(id, request);
        String adminName = principal != null ? principal.getName() : "admin@gmail.com";
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
        if (request.mobile() != null) {
            String trimmedMobile = request.mobile().trim();
            if (!trimmedMobile.isEmpty() && !trimmedMobile.equals(user.getMobile())) {
                if (userRepository.existsByMobile(trimmedMobile)) {
                    throw new com.aram.legalaid.exception.BadRequestException("Mobile number already exists");
                }
                user.setMobile(trimmedMobile);
                details.append("mobile ");
            } else if (trimmedMobile.isEmpty() && user.getMobile() != null) {
                user.setMobile(null);
                details.append("cleared_mobile ");
            }
        }
        if (request.status() != null) { user.setStatus(request.status()); details.append("status=").append(request.status()).append(" "); }
        
        User saved = userRepository.save(user);
        String adminName = principal != null ? principal.getName() : "admin@gmail.com";
        auditLogService.log("USER_UPDATED", adminName, "Updated details for user: " + user.getEmail() + ". " + details.toString());
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<UserResponse> deleteUser(@PathVariable Long id, Principal principal) {
        User user = userRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.DELETED);
        User saved = userRepository.save(user);
        String adminName = principal != null ? principal.getName() : "admin@gmail.com";
        auditLogService.log("USER_DELETED", adminName, "Soft deleted user: " + user.getEmail());
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }

    @GetMapping("/helpers")
    public ResponseEntity<List<UserResponse>> helpers(Principal principal) {
        String email = principal != null ? principal.getName() : "admin@gmail.com";
        User admin = userRepository.findByEmail(email).orElse(null);
        String districtFilter = null;
        if (admin != null && admin.getDistrict() != null && !admin.getDistrict().isEmpty() && !"GLOBAL".equalsIgnoreCase(admin.getDistrict())) {
            districtFilter = admin.getDistrict();
        }
        
        List<User> helpers = (districtFilter != null)
                ? userRepository.findByRoleAndDistrict(Role.HELPER, districtFilter)
                : userRepository.findByRole(Role.HELPER);
                
        return ResponseEntity.ok(helpers.stream().map(mapperService::toUserResponse).toList());
    }

    @PutMapping("/helpers/{id}/verify")
    public ResponseEntity<UserResponse> verifyHelper(@PathVariable Long id, Principal principal) {
        User helper = userRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Helper not found"));
        helper.setHelperVerified(true);
        helper.setStatus(UserStatus.ACTIVE);
        User saved = userRepository.save(helper);
        String adminName = principal != null ? principal.getName() : "admin@gmail.com";
        auditLogService.log("HELPER_VERIFIED", adminName, "Verified helper: " + helper.getEmail());
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }

    @PutMapping("/helpers/{id}/reject")
    public ResponseEntity<UserResponse> rejectHelper(@PathVariable Long id, Principal principal) {
        User helper = userRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Helper not found"));
        helper.setHelperVerified(false);
        helper.setStatus(UserStatus.SUSPENDED);
        User saved = userRepository.save(helper);
        String adminName = principal != null ? principal.getName() : "admin@gmail.com";
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
        String adminName = principal != null ? principal.getName() : "admin@gmail.com";
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

        try {
            aiClientService.syncComplaint(
                saved.getComplaintCustomId(),
                saved.getStatus().name(),
                helper.getId().toString(),
                helper.getName(),
                "Guide assigned by administrator."
            );
        } catch (Exception e) {
            System.err.println("FastAPI sync failed: " + e.getMessage());
        }

        // Email notifications
        if (saved.getUser() != null && saved.getUser().getEmail() != null) {
            try {
                emailService.sendGuideAssignedEmail(
                    saved.getUser().getEmail(),
                    saved.getUser().getName(),
                    saved.getComplaintCustomId(),
                    helper.getName()
                );
            } catch (Exception e) {
                System.err.println("Failed to send guide assignment email to citizen: " + e.getMessage());
            }
        }

        try {
            communicationGateway.notifyGuideAssigned(saved, saved.getUser(), helper);
        } catch (Exception e) {
            System.err.println("Communication gateway guide assignment dispatch error: " + e.getMessage());
        }
        if (helper.getEmail() != null) {
            try {
                emailService.sendGuideNewCaseEmail(
                    helper.getEmail(),
                    helper.getName(),
                    saved.getComplaintCustomId(),
                    saved.getCategory() != null ? saved.getCategory().name() : "GENERAL",
                    saved.getDistrict(),
                    saved.getLanguage() != null ? saved.getLanguage() : "ENGLISH"
                );
            } catch (Exception e) {
                System.err.println("Failed to send new case email to guide: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(mapperService.toComplaintResponse(saved, null));
    }

    @DeleteMapping("/complaints/{id}")
    public ResponseEntity<ComplaintResponse> deleteComplaint(@PathVariable Long id, Principal principal) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Complaint not found"));
        complaint.setStatus(ComplaintStatus.DELETED);
        Complaint saved = complaintRepository.save(complaint);
        String adminName = principal != null ? principal.getName() : "admin@gmail.com";
        auditLogService.log("COMPLAINT_DELETED", adminName, "Soft deleted complaint ID " + id);
        return ResponseEntity.ok(mapperService.toComplaintResponse(saved, null));
    }

    @GetMapping("/audit-logs/verify")
    public ResponseEntity<Map<String, Object>> verifyAuditLogsChain(Principal principal) {
        String email = principal != null ? principal.getName() : null;
        if (email == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User current = userRepository.findByEmail(email).orElse(null);
        if (current == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        if (current.getRole() != Role.SUPER_ADMIN) {
            throw new com.aram.legalaid.exception.ForbiddenException("Only Super Admins are authorized to verify the global audit chain integrity");
        }
        return ResponseEntity.ok(auditLogService.verifyAuditChain());
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Map<String, Object>> auditLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "action", required = false) String action,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to,
            Principal principal
    ) {
        String email = principal != null ? principal.getName() : "admin@gmail.com";
        User admin = userRepository.findByEmail(email).orElse(null);
        String districtFilter = null;
        if (admin != null && admin.getDistrict() != null && !admin.getDistrict().isEmpty() && !"GLOBAL".equalsIgnoreCase(admin.getDistrict())) {
            districtFilter = admin.getDistrict();
        }

        List<AuditLog> allLogs = auditLogRepository.findAllByOrderByTimestampDesc();
        java.util.stream.Stream<AuditLog> logStream = allLogs.stream();

        if (districtFilter != null) {
            final String dist = districtFilter;
            logStream = logStream.filter(log -> {
                String performedBy = log.getPerformedBy();
                if (performedBy != null) {
                    Optional<User> u = userRepository.findByEmail(performedBy);
                    if (u.isPresent()) {
                        return dist.equalsIgnoreCase(u.get().getDistrict());
                    }
                }
                String details = log.getDetails();
                return details != null && details.toLowerCase().contains(dist.toLowerCase());
            });
        }
        
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
        String adminName = principal != null ? principal.getName() : "admin@gmail.com";
        auditLogService.log("EXCEL_EXPORT", adminName, "Exported " + role + " users list to Excel.");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", role.name().toLowerCase() + "_users.xlsx");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok().headers(headers).body(excelData);
    }

    @PostMapping({"/helpers", "/volunteers"})
    public ResponseEntity<UserResponse> createHelper(@Valid @RequestBody CreateVolunteerRequest request, Principal principal) {
        if (userRepository.existsByEmail(request.email())) {
            throw new com.aram.legalaid.exception.BadRequestException("Email already exists");
        }
        if (userRepository.existsByMobile(request.mobile())) {
            throw new com.aram.legalaid.exception.BadRequestException("Mobile number already in use");
        }

        String adminName = principal != null ? principal.getName() : "admin@gmail.com";
        User currentUser = userRepository.findByEmail(adminName).orElse(null);

        // If regional admin, strictly lock to their region; otherwise use requested district
        String district = request.district();
        if (currentUser != null && currentUser.getRole() == Role.ADMIN && currentUser.getDistrict() != null && !currentUser.getDistrict().equalsIgnoreCase("GLOBAL")) {
            district = currentUser.getDistrict();
        } else if (district == null || district.trim().isEmpty()) {
            district = "Salem";
        }
        
        User helper = new User();
        helper.setName(request.name().trim());
        helper.setEmail(request.email().trim().toLowerCase());
        helper.setMobile(request.mobile().trim());
        helper.setRole(Role.HELPER);
        helper.setStatus(UserStatus.ACTIVE);
        helper.setHelperVerified(true);
        helper.setDistrict(district);
        
        String tempPassword = "Helper@123";
        helper.setPasswordHash(passwordEncoder.encode(tempPassword));
        helper.setForcePasswordChange(false);
        helper.setProfileCompleted(true);
        
        helper.setGender(request.gender() != null ? request.gender() : "OTHER");
        helper.setLanguagesKnown(request.languagesKnown() != null ? request.languagesKnown() : "Tamil,English");
        helper.setSpecializationCategories(request.specializationCategories() != null ? request.specializationCategories() : "GENERAL_LEGAL_AID");
        helper.setMaxActiveCases(request.maxActiveCases() > 0 ? request.maxActiveCases() : 5);
        helper.setWomenSupportTrained(request.womenSupportTrained());
        helper.setCanHandleSensitiveCases(request.canHandleSensitiveCases());
        helper.setServiceArea(request.serviceArea() != null ? request.serviceArea() : "Legal Triage");
        helper.setSubSpecializations(request.subSpecializations() != null ? request.subSpecializations() : "General Practice");
        helper.setExperienceLevel(request.experienceLevel() != null ? request.experienceLevel() : "Intermediate");
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

        auditLogService.log("LEGAL_GUIDE_CREATED", adminName, "Admin created volunteer account and Legal Guide profile: " + request.email() + " with temp password " + tempPassword);
        
        return ResponseEntity.ok(mapperService.toUserResponse(saved));
    }

    @PostMapping("/helpers/invite")
    public ResponseEntity<Map<String, Object>> inviteHelper(@Valid @RequestBody CreateVolunteerRequest request, Principal principal) {
        if (userRepository.existsByEmail(request.email())) {
            throw new com.aram.legalaid.exception.BadRequestException("Email already exists");
        }
        if (userRepository.existsByMobile(request.mobile())) {
            throw new com.aram.legalaid.exception.BadRequestException("Mobile number already exists");
        }

        String token = UUID.randomUUID().toString();
        GuideInvitation invitation = new GuideInvitation();
        invitation.setEmail(request.email().trim().toLowerCase());
        invitation.setToken(token);
        invitation.setName(request.name().trim());
        invitation.setDistrict(request.district());
        invitation.setLanguages(request.languagesKnown());
        invitation.setSpecializations(request.specializationCategories());
        invitation.setWomenSensitive(request.canHandleSensitiveCases());
        invitation.setExpiryTime(LocalDateTime.now().plusDays(7));
        guideInvitationRepository.save(invitation);

        User helper = new User();
        helper.setName(request.name());
        helper.setEmail(request.email().trim().toLowerCase());
        helper.setMobile(request.mobile());
        helper.setRole(Role.HELPER);
        helper.setStatus(UserStatus.INACTIVE); // Pending activation
        helper.setHelperVerified(false);
        
        // Random secure password to prevent direct logins before acceptance
        helper.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
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
        helper.setAvailabilityStatus("UNAVAILABLE");
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
        guideProfile.setAvailable(false);
        guideProfile.setWomenSupportTrained(saved.isWomenSupportTrained());
        guideProfile.setVerificationStatus("INVITED");
        guideProfileRepository.save(guideProfile);

        // Create performance profile (Level 1 Beginner, credits = 0)
        com.aram.legalaid.model.LegalGuidePerformanceProfile perf = levelService.getOrCreatePerformanceProfile(saved.getId());
        perf.setCurrentLevelNumber(1);
        perf.setCurrentLevelName("Beginner Legal Guide");
        perf.setCreditScore(0);
        performanceProfileRepository.save(perf);

        String inviteLink = "http://localhost:5173/accept-invitation?token=" + token;
        
        // Send invitation link via email
        try {
            emailService.sendGuideInvitationEmail(request.email().trim().toLowerCase(), request.name().trim(), request.district(), inviteLink);
        } catch (Exception e) {
            System.err.println("Failed to send guide invitation email: " + e.getMessage());
        }
        
        // Log to console for development audit
        System.out.println("====================================================================");
        System.out.println("GUIDE INVITATION LINK GENERATED AND SENT: " + inviteLink);
        System.out.println("====================================================================");

        String adminName = principal != null ? principal.getName() : "admin@gmail.com";
        auditLogService.log("LEGAL_GUIDE_INVITED", adminName, "Admin invited Legal Guide: " + request.email() + " with token: " + token);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Legal Guide invitation created successfully",
            "token", token,
            "inviteLink", inviteLink
        ));
    }

    @GetMapping("/complaints/{id}/recommend-volunteers")
    public ResponseEntity<List<Map<String, Object>>> recommendVolunteersForComplaint(@PathVariable Long id) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Complaint not found"));
        
        String district = complaint.getDistrict();
        List<User> activeVolunteers = userRepository.findByRole(Role.HELPER).stream()
                .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                .filter(u -> district == null || district.equalsIgnoreCase(u.getDistrict()))
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
            map.put("supportsTanglish", v.isSupportsTanglish());
            map.put("supportsHinglish", v.isSupportsHinglish());

            int eloRating = performanceProfileRepository.findByLegalGuideId(v.getId())
                    .map(LegalGuidePerformanceProfile::getEloRating)
                    .orElse(1000);
            double averageRating = performanceProfileRepository.findByLegalGuideId(v.getId())
                    .map(LegalGuidePerformanceProfile::getAverageRating)
                    .orElse(0.0);
            int feedbackCount = performanceProfileRepository.findByLegalGuideId(v.getId())
                    .map(LegalGuidePerformanceProfile::getCasesConfirmedResolved)
                    .orElse(0);

            map.put("eloRating", eloRating);
            map.put("averageRating", averageRating);
            map.put("feedbackCount", feedbackCount);
            return map;
        }).toList();
        
        String catCode = complaint.getCategory() != null ? complaint.getCategory().name() : "GENERAL_LEGAL_AID";
        boolean preferWoman = complaint.isSensitive() || complaint.isWomenSensitive() || com.aram.legalaid.enums.HelperGender.FEMALE == complaint.getPreferredHelperGender();
        
        List<Map<String, Object>> recommendations = aiClientService.recommendVolunteers(
            complaint.getComplaintCustomId(),
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
            String adminName = principal != null ? principal.getName() : "admin@gmail.com";
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
        
        String adminName = principal != null ? principal.getName() : "admin@gmail.com";
        auditLogService.log("COMPLAINT_ASSIGNED", adminName, "Assigned volunteer " + volunteer.getEmail() + " to complaint ID " + id);
        
        try {
            aiClientService.syncComplaint(
                saved.getComplaintCustomId(),
                saved.getStatus().name(),
                volunteer.getId().toString(),
                volunteer.getName(),
                "Guide assigned by administrator."
            );
        } catch (Exception e) {
            System.err.println("FastAPI sync failed: " + e.getMessage());
        }

        // Email notifications
        if (saved.getUser() != null && saved.getUser().getEmail() != null) {
            try {
                emailService.sendGuideAssignedEmail(
                    saved.getUser().getEmail(),
                    saved.getUser().getName(),
                    saved.getComplaintCustomId(),
                    volunteer.getName()
                );
            } catch (Exception e) {
                System.err.println("Failed to send guide assignment email to citizen: " + e.getMessage());
            }
        }
        if (volunteer.getEmail() != null) {
            try {
                emailService.sendGuideNewCaseEmail(
                    volunteer.getEmail(),
                    volunteer.getName(),
                    saved.getComplaintCustomId(),
                    saved.getCategory() != null ? saved.getCategory().name() : "GENERAL",
                    saved.getDistrict(),
                    saved.getLanguage() != null ? saved.getLanguage() : "ENGLISH"
                );
            } catch (Exception e) {
                System.err.println("Failed to send new case email to volunteer: " + e.getMessage());
            }
        }

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
        
        String adminName = principal != null ? principal.getName() : "admin@gmail.com";
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
        String adminName = principal != null ? principal.getName() : "admin@gmail.com";
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

    public static final List<String> TN_DISTRICTS = List.of(
        "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
        "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
        "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
        "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
        "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
        "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirupathur",
        "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Tirunelveli",
        "Vellore", "Viluppuram", "Virudhunagar"
    );

    @GetMapping("/districts/metrics")
    public ResponseEntity<List<Map<String, Object>>> getDistrictMetrics() {
        List<Complaint> allComplaints = complaintRepository.findAll();
        List<User> allUsers = userRepository.findAll();

        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (String dist : TN_DISTRICTS) {
            String distLower = dist.trim().toLowerCase();

            List<Complaint> distComplaints = allComplaints.stream()
                .filter(c -> c.getDistrict() != null && c.getDistrict().trim().equalsIgnoreCase(distLower))
                .toList();

            long totalCases = distComplaints.size();
            long pendingCases = distComplaints.stream()
                .filter(c -> c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.REJECTED && c.getStatus() != ComplaintStatus.DELETED)
                .count();
            long resolvedCases = distComplaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED)
                .count();

            List<User> distUsers = allUsers.stream()
                .filter(u -> u.getDistrict() != null && u.getDistrict().trim().equalsIgnoreCase(distLower))
                .toList();

            long guidesCount = distUsers.stream()
                .filter(u -> (u.getRole() == Role.HELPER) && u.getStatus() != UserStatus.DELETED)
                .count();

            long citizensCount = distUsers.stream()
                .filter(u -> u.getRole() == Role.CITIZEN && u.getStatus() != UserStatus.DELETED)
                .count();

            User admin = distUsers.stream()
                .filter(u -> u.getRole() == Role.ADMIN && u.getStatus() != UserStatus.DELETED)
                .findFirst()
                .orElse(null);

            Map<String, Object> distMap = new java.util.HashMap<>();
            distMap.put("name", dist);
            distMap.put("district", dist);
            distMap.put("caseCount", totalCases);
            distMap.put("totalComplaints", totalCases);
            distMap.put("pendingCount", pendingCases);
            distMap.put("pendingComplaints", pendingCases);
            distMap.put("resolvedCount", resolvedCases);
            distMap.put("resolvedComplaints", resolvedCases);
            distMap.put("guidesCount", guidesCount);
            distMap.put("totalGuides", guidesCount);
            distMap.put("citizensCount", citizensCount);
            distMap.put("hasActiveAdmin", admin != null && admin.getStatus() == UserStatus.ACTIVE);
            distMap.put("adminName", admin != null ? admin.getName() : "Unassigned");
            distMap.put("adminEmail", admin != null ? admin.getEmail() : null);
            distMap.put("adminMobile", admin != null ? admin.getMobile() : null);
            distMap.put("adminStatus", admin != null ? admin.getStatus().name() : "UNASSIGNED");

            result.add(distMap);
        }

        return ResponseEntity.ok(result);
    }

    public record CreateAdminDirectRequest(
        @jakarta.validation.constraints.NotBlank String name,
        @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Email String email,
        @jakarta.validation.constraints.NotBlank String mobile,
        @jakarta.validation.constraints.NotBlank String district,
        String designation,
        String password
    ) {}

    @PostMapping("/superadmin/admins/create")
    public ResponseEntity<?> createAdminDirectly(@Valid @RequestBody CreateAdminDirectRequest request, Principal principal) {
        String currentEmail = principal != null ? principal.getName() : "superadmin@gmail.com";
        User currentUser = userRepository.findByEmail(currentEmail).orElse(null);
        if (currentUser == null || (currentUser.getRole() != Role.SUPER_ADMIN && currentUser.getRole() != Role.ADMIN)) {
            throw new com.aram.legalaid.exception.ForbiddenException("Admin or Super Admin access required");
        }

        if (request.district() == null || request.district().trim().isEmpty()) {
            throw new com.aram.legalaid.exception.BadRequestException("District is required");
        }

        String email = request.email().trim().toLowerCase();
        User existingUser = userRepository.findByEmail(email).orElse(null);
        if (existingUser != null) {
            existingUser.setName(request.name().trim());
            existingUser.setMobile(request.mobile().trim());
            existingUser.setRole(Role.ADMIN);
            existingUser.setStatus(UserStatus.ACTIVE);
            existingUser.setDistrict(request.district().trim());
            existingUser.setSpecialization(request.designation() != null ? request.designation() : "Regional Administrator");
            if (request.password() != null && !request.password().trim().isEmpty()) {
                existingUser.setPasswordHash(passwordEncoder.encode(request.password().trim()));
            }
            User saved = userRepository.save(existingUser);
            auditLogService.log("ADMIN_UPDATED", currentEmail, "Updated Admin: " + saved.getEmail() + " for region: " + saved.getDistrict());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Regional Admin updated successfully",
                "user", mapperService.toUserResponse(saved)
            ));
        }

        String pass = (request.password() != null && !request.password().trim().isEmpty())
                ? request.password().trim()
                : "Admin@123";

        User admin = new User();
        admin.setName(request.name().trim());
        admin.setEmail(email);
        admin.setMobile(request.mobile().trim());
        admin.setRole(Role.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        admin.setDistrict(request.district().trim());
        admin.setSpecialization(request.designation() != null ? request.designation() : "Regional Administrator");
        admin.setPasswordHash(passwordEncoder.encode(pass));
        User saved = userRepository.save(admin);

        auditLogService.log("ADMIN_CREATED", currentEmail, "Created Regional Admin: " + admin.getEmail() + " for region: " + admin.getDistrict());

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Regional Admin created successfully",
            "user", mapperService.toUserResponse(saved)
        ));
    }

    public record RegionalAdminInviteRequest(
        @jakarta.validation.constraints.NotBlank String name,
        @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Email String email,
        @jakarta.validation.constraints.NotBlank String mobile,
        @jakarta.validation.constraints.NotBlank String district,
        String designation
    ) {}

    @PostMapping("/superadmin/admins/invite")
    public ResponseEntity<?> inviteAdmin(@Valid @RequestBody RegionalAdminInviteRequest request, Principal principal) {
        // Enforce SUPER_ADMIN role validation server-side
        String currentEmail = principal != null ? principal.getName() : "superadmin@gmail.com";
        User currentUser = userRepository.findByEmail(currentEmail).orElse(null);
        if (currentUser == null || currentUser.getRole() != Role.SUPER_ADMIN) {
            throw new com.aram.legalaid.exception.ForbiddenException("Super Admin access required");
        }

        // Validate district parameters
        if (request.district() == null || request.district().trim().isEmpty()) {
            throw new com.aram.legalaid.exception.BadRequestException("District is required");
        }

        // Check if there is already an active regional admin for this district
        List<User> activeAdmins = userRepository.findByRoleAndDistrict(Role.ADMIN, request.district());
        boolean hasActiveAdmin = activeAdmins.stream().anyMatch(u -> u.getStatus() == UserStatus.ACTIVE);
        if (hasActiveAdmin) {
            throw new com.aram.legalaid.exception.BadRequestException("This district already has an active Regional Admin.");
        }

        // Enforce user email unique check
        if (userRepository.existsByEmail(request.email().trim().toLowerCase())) {
            throw new com.aram.legalaid.exception.BadRequestException("Email address already registered.");
        }

        String token = UUID.randomUUID().toString();
        GuideInvitation invitation = new GuideInvitation();
        invitation.setEmail(request.email().trim().toLowerCase());
        invitation.setToken(token);
        invitation.setName(request.name().trim());
        invitation.setDistrict(request.district());
        invitation.setRole("ADMIN");
        invitation.setExpiryTime(LocalDateTime.now().plusHours(24));
        guideInvitationRepository.save(invitation);

        User admin = new User();
        admin.setName(request.name().trim());
        admin.setEmail(request.email().trim().toLowerCase());
        admin.setMobile(request.mobile().trim());
        admin.setRole(Role.ADMIN);
        admin.setStatus(UserStatus.INVITED);
        admin.setDistrict(request.district());
        admin.setSpecialization(request.designation());
        admin.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString())); // Scrambled initial hash
        userRepository.save(admin);

        String inviteLink = "http://localhost:5173/activate-account?token=" + token;
        try {
            emailService.sendAdminInvitationEmail(admin.getEmail(), admin.getName(), admin.getDistrict(), inviteLink);
        } catch (Exception e) {
            System.err.println("Failed to send admin invitation email: " + e.getMessage());
        }

        auditLogService.log("ADMIN_INVITED", currentEmail, "Super Admin invited Regional Admin: " + admin.getEmail() + " for region: " + admin.getDistrict());

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Regional Admin invitation created successfully",
            "token", token,
            "inviteLink", inviteLink
        ));
    }

    @PostMapping("/superadmin/invitations/resend")
    public ResponseEntity<?> resendInvitation(@RequestBody Map<String, String> body, Principal principal) {
        String currentEmail = principal != null ? principal.getName() : "superadmin@gmail.com";
        User currentUser = userRepository.findByEmail(currentEmail).orElse(null);
        if (currentUser == null || currentUser.getRole() != Role.SUPER_ADMIN) {
            throw new com.aram.legalaid.exception.ForbiddenException("Super Admin access required");
        }
        
        String targetEmail = body.get("email");
        if (targetEmail == null || targetEmail.trim().isEmpty()) {
            throw new com.aram.legalaid.exception.BadRequestException("Email address is required");
        }

        User targetUser = userRepository.findByEmail(targetEmail.trim().toLowerCase())
                .orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("User not found"));

        if (targetUser.getStatus() == UserStatus.ACTIVE) {
            throw new com.aram.legalaid.exception.BadRequestException("This account is already active.");
        }

        // Check if there is an existing invitation
        List<GuideInvitation> invitations = guideInvitationRepository.findAll().stream()
                .filter(i -> i.getEmail().equalsIgnoreCase(targetEmail.trim()))
                .toList();

        if (invitations.isEmpty()) {
            throw new com.aram.legalaid.exception.ResourceNotFoundException("No invitation history found for this email");
        }

        // Invalidate old invitations
        for (GuideInvitation invite : invitations) {
            invite.setUsed(true);
            guideInvitationRepository.save(invite);
        }

        // Generate new token
        String token = UUID.randomUUID().toString();
        GuideInvitation newInvite = new GuideInvitation();
        newInvite.setEmail(targetEmail.trim().toLowerCase());
        newInvite.setToken(token);
        newInvite.setName(targetUser.getName());
        newInvite.setDistrict(targetUser.getDistrict());
        
        // Match the role
        String roleStr = targetUser.getRole() == Role.ADMIN ? "ADMIN" : "HELPER";
        newInvite.setRole(roleStr);

        int expiryHours = targetUser.getRole() == Role.ADMIN ? 24 : 168; // 24 hours for Admin, 7 days for Guides
        newInvite.setExpiryTime(LocalDateTime.now().plusHours(expiryHours));
        guideInvitationRepository.save(newInvite);

        String inviteLink = targetUser.getRole() == Role.ADMIN
                ? "http://localhost:5173/activate-account?token=" + token
                : "http://localhost:5173/accept-invitation?token=" + token;

        try {
            if (targetUser.getRole() == Role.ADMIN) {
                emailService.sendAdminInvitationEmail(targetUser.getEmail(), targetUser.getName(), targetUser.getDistrict(), inviteLink);
            } else {
                emailService.sendGuideInvitationEmail(targetUser.getEmail(), targetUser.getName(), targetUser.getDistrict(), inviteLink);
            }
        } catch (Exception e) {
            System.err.println("Failed to resend invitation email: " + e.getMessage());
        }

        auditLogService.log("INVITATION_RESENT", currentEmail, "Resent invitation token to: " + targetUser.getEmail());

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Invitation link resent successfully",
            "token", token,
            "inviteLink", inviteLink
        ));
    }

    @PutMapping({"/superadmin/users/{id}/status", "/users/{id}/status"})
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Principal principal) {
        String currentEmail = principal != null ? principal.getName() : "superadmin@gmail.com";
        User currentUser = userRepository.findByEmail(currentEmail).orElse(null);

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("User not found"));

        boolean isSuperAdmin = currentUser != null && (
                currentUser.getRole() == Role.SUPER_ADMIN ||
                "GLOBAL".equalsIgnoreCase(currentUser.getDistrict()) ||
                "admin@gmail.com".equalsIgnoreCase(currentUser.getEmail())
        );

        boolean isRegionalAdminForHelper = currentUser != null &&
                currentUser.getRole() == Role.ADMIN &&
                targetUser.getRole() == Role.HELPER &&
                targetUser.getDistrict() != null &&
                targetUser.getDistrict().equalsIgnoreCase(currentUser.getDistrict());

        if (!isSuperAdmin && !isRegionalAdminForHelper) {
            throw new com.aram.legalaid.exception.ForbiddenException("Administrative authority required to update user status");
        }

        String statusStr = body.get("status");
        if (statusStr == null || statusStr.trim().isEmpty()) {
            throw new com.aram.legalaid.exception.BadRequestException("Status value is required");
        }

        UserStatus newStatus = UserStatus.valueOf(statusStr.trim().toUpperCase());

        if (newStatus == UserStatus.ACTIVE && targetUser.getRole() == Role.ADMIN) {
            // Enforce single active regional admin per district check
            List<User> activeAdmins = userRepository.findByRoleAndDistrict(Role.ADMIN, targetUser.getDistrict());
            boolean hasActiveAdmin = activeAdmins.stream()
                    .anyMatch(u -> u.getStatus() == UserStatus.ACTIVE && !u.getId().equals(targetUser.getId()));
            if (hasActiveAdmin) {
                throw new com.aram.legalaid.exception.BadRequestException("This district already has an active Regional Admin.");
            }
        }

        targetUser.setStatus(newStatus);
        userRepository.save(targetUser);

        // Synchronize guide profile availability when a helper is suspended or activated
        if (targetUser.getRole() == Role.HELPER) {
            guideProfileRepository.findByUserId(targetUser.getId()).ifPresent(gp -> {
                gp.setAvailable(newStatus == UserStatus.ACTIVE);
                guideProfileRepository.save(gp);
            });
        }

        String actionName = (newStatus == UserStatus.SUSPENDED) ? "USER_SUSPENDED" : "USER_ACTIVATED";
        auditLogService.log(actionName, currentEmail, "Updated status of user " + targetUser.getEmail() + " (" + targetUser.getRole() + ") to " + newStatus);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User status updated successfully",
            "status", newStatus.name(),
            "userId", targetUser.getId()
        ));
    }

    @PostMapping("/superadmin/audit/tamper")
    public ResponseEntity<?> tamperBlockchain(Principal principal) {
        String currentEmail = principal != null ? principal.getName() : "superadmin@gmail.com";
        User currentUser = userRepository.findByEmail(currentEmail).orElse(null);
        if (currentUser == null || currentUser.getRole() != Role.SUPER_ADMIN) {
            throw new com.aram.legalaid.exception.ForbiddenException("Super Admin access required");
        }

        List<com.aram.legalaid.model.BlockchainBlock> blocks = blockchainBlockRepository.findAllByOrderByBlockIndexAsc();
        if (blocks.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No blocks to tamper with"));
        }

        // Tamper the latest block
        com.aram.legalaid.model.BlockchainBlock latest = blocks.get(blocks.size() - 1);
        latest.setBlockHash("00_tampered_corrupted_hash_value");
        blockchainBlockRepository.save(latest);

        return ResponseEntity.ok(Map.of("success", true, "message", "Latest block hash tampered successfully. Chain is now corrupted."));
    }

    @PostMapping("/superadmin/audit/trigger")
    public ResponseEntity<?> triggerAuditCheck(Principal principal) {
        String currentEmail = principal != null ? principal.getName() : "superadmin@gmail.com";
        User currentUser = userRepository.findByEmail(currentEmail).orElse(null);
        if (currentUser == null || currentUser.getRole() != Role.SUPER_ADMIN) {
            throw new com.aram.legalaid.exception.ForbiddenException("Super Admin access required");
        }

        auditMonitoringScheduler.runDailyAuditCheck();
        boolean valid = blockchainService.verifyFullChain();
        return ResponseEntity.ok(Map.of("success", true, "status", valid ? "SECURE" : "CORRUPTED"));
    }

    @GetMapping("/superadmin/audit/status")
    public ResponseEntity<?> getAuditStatus(Principal principal) {
        String currentEmail = principal != null ? principal.getName() : "superadmin@gmail.com";
        User currentUser = userRepository.findByEmail(currentEmail).orElse(null);
        if (currentUser == null || currentUser.getRole() != Role.SUPER_ADMIN) {
            throw new com.aram.legalaid.exception.ForbiddenException("Super Admin access required");
        }

        boolean valid = blockchainService.verifyFullChain();
        return ResponseEntity.ok(Map.of("valid", valid));
    }

    @GetMapping({"/superadmin/statewide-analytics", "/statewide-analytics"})
    public ResponseEntity<Map<String, Object>> getStatewideAnalytics(
            @RequestParam(required = false, defaultValue = "all") String timeRange,
            @RequestParam(required = false, defaultValue = "ALL") String district,
            Principal principal
    ) {
        String currentEmail = principal != null ? principal.getName() : "superadmin@gmail.com";
        User currentUser = userRepository.findByEmail(currentEmail).orElse(null);
        if (currentUser == null || (currentUser.getRole() != Role.SUPER_ADMIN && currentUser.getRole() != Role.ADMIN)) {
            throw new com.aram.legalaid.exception.ForbiddenException("Super Admin or Admin access required");
        }

        String effectiveDistrict = district;
        if (currentUser.getRole() == Role.ADMIN && currentUser.getDistrict() != null && !"GLOBAL".equalsIgnoreCase(currentUser.getDistrict())) {
            effectiveDistrict = currentUser.getDistrict();
        }

        return ResponseEntity.ok(statewideAnalyticsService.getStatewideAnalytics(timeRange, effectiveDistrict));
    }
}
