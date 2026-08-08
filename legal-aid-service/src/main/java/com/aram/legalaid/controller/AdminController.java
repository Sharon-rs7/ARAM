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
import com.aram.legalaid.service.AdminService;
import com.aram.legalaid.service.AuditLogService;
import com.aram.legalaid.service.ComplaintService;
import com.aram.legalaid.service.MapperService;
import com.aram.legalaid.service.VolunteerActivityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;
    private final ComplaintService complaintService;
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

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String AUTH_SERVICE_URL = "http://localhost:8081/api/admin/users-internal";

    public AdminController(AdminService adminService, ComplaintService complaintService,
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

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request, Principal principal) {
        ComplaintResponse response = complaintService.updateStatus(id, request);
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("COMPLAINT_STATUS_UPDATED", adminName, "Updated status of complaint ID " + id + " to " + request.status());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<UserResponse[]> users() {
        return ResponseEntity.ok(restTemplate.getForObject(AUTH_SERVICE_URL, UserResponse[].class));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> user(@PathVariable Long id) {
        return ResponseEntity.ok(restTemplate.getForObject(AUTH_SERVICE_URL + "/" + id, UserResponse.class));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request, Principal principal) {
        restTemplate.put(AUTH_SERVICE_URL + "/" + id, request);
        UserResponse response = restTemplate.getForObject(AUTH_SERVICE_URL + "/" + id, UserResponse.class);
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("USER_UPDATED", adminName, "Updated details for user ID: " + id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Principal principal) {
        restTemplate.delete(AUTH_SERVICE_URL + "/" + id);
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("USER_DELETED", adminName, "Deleted user ID: " + id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/helpers")
    public ResponseEntity<UserResponse[]> helpers() {
        return ResponseEntity.ok(restTemplate.getForObject(AUTH_SERVICE_URL + "/helpers", UserResponse[].class));
    }

    @PutMapping("/helpers/{id}/verify")
    public ResponseEntity<UserResponse> verifyHelper(@PathVariable Long id, Principal principal) {
        restTemplate.put(AUTH_SERVICE_URL + "/helpers/" + id + "/verify", null);
        UserResponse response = restTemplate.getForObject(AUTH_SERVICE_URL + "/" + id, UserResponse.class);

        // Also update guide profile
        guideProfileRepository.findByUserId(id).ifPresent(profile -> {
            profile.setVerificationStatus("APPROVED");
            profile.setAvailable(true);
            guideProfileRepository.save(profile);
        });

        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("HELPER_VERIFIED", adminName, "Verified helper ID: " + id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/helpers/{id}/reject")
    public ResponseEntity<UserResponse> rejectHelper(@PathVariable Long id, Principal principal) {
        restTemplate.put(AUTH_SERVICE_URL + "/helpers/" + id + "/reject", null);
        UserResponse response = restTemplate.getForObject(AUTH_SERVICE_URL + "/" + id, UserResponse.class);

        // Also update guide profile
        guideProfileRepository.findByUserId(id).ifPresent(profile -> {
            profile.setVerificationStatus("REJECTED");
            profile.setAvailable(false);
            guideProfileRepository.save(profile);
        });

        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("HELPER_REJECTED", adminName, "Rejected helper ID: " + id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard() {
        return ResponseEntity.ok(adminService.dashboard());
    }

    @GetMapping("/trends")
    public ResponseEntity<List<Map<String, Object>>> trends() {
        return ResponseEntity.ok(adminService.getComplaintTrends());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> categories() {
        return ResponseEntity.ok(adminService.getCategoryDistribution());
    }

    @GetMapping("/volunteers-workload")
    public ResponseEntity<Map<String, Object>> volunteersWorkload() {
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
        UserResponse[] usersArray = restTemplate.getForObject(AUTH_SERVICE_URL, UserResponse[].class);
        List<User> list = new ArrayList<>();
        if (usersArray != null) {
            for (UserResponse ur : usersArray) {
                if (ur.role() == role) {
                    User u = new User();
                    u.setId(ur.id());
                    u.setName(ur.name());
                    u.setEmail(ur.email());
                    u.setMobile(ur.mobile());
                    u.setRole(ur.role());
                    u.setStatus(ur.status());
                    u.setGender(ur.gender());
                    u.setSpecialization(ur.specialization());
                    list.add(u);
                }
            }
        }
        byte[] excelData = com.aram.legalaid.util.ExcelExportUtil.exportUsersToExcel(list);
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
        Map<String, Object> body = new HashMap<>();
        body.put("name", request.name());
        body.put("email", request.email());
        body.put("mobile", request.mobile());
        body.put("gender", request.gender());
        body.put("district", request.district());
        body.put("languagesKnown", request.languagesKnown());
        body.put("specializationCategories", request.specializationCategories());
        body.put("womenSupportTrained", request.womenSupportTrained());
        body.put("canHandleSensitiveCases", request.canHandleSensitiveCases());
        body.put("serviceArea", request.serviceArea());
        body.put("subSpecializations", request.subSpecializations());
        body.put("experienceLevel", request.experienceLevel());

        UserResponse saved = restTemplate.postForObject(AUTH_SERVICE_URL + "/helpers", body, UserResponse.class);
        if (saved == null) {
            throw new com.aram.legalaid.exception.BadRequestException("Unable to register helper in auth service");
        }

        // Create LegalGuideProfile
        com.aram.legalaid.model.LegalGuideProfile guideProfile = new com.aram.legalaid.model.LegalGuideProfile();
        guideProfile.setUserId(saved.id());
        guideProfile.setFullName(saved.name());
        guideProfile.setEmail(saved.email());
        guideProfile.setPhone(saved.mobile());
        guideProfile.setGender(saved.gender());
        guideProfile.setDistrict(saved.district());
        guideProfile.setServiceAreas(saved.serviceArea());
        guideProfile.setLanguagesKnown(saved.languagesKnown());
        guideProfile.setExpertiseCategories(saved.specializationCategories());

        int expYears = 2;
        try {
            if (saved.experienceLevel() != null) {
                String expStr = saved.experienceLevel().replaceAll("[^0-9]", "");
                if (!expStr.isEmpty()) expYears = Integer.parseInt(expStr);
            }
        } catch (Exception e) {}
        guideProfile.setExperienceYears(expYears);
        guideProfile.setMaxCaseCapacity(saved.maxActiveCases());
        guideProfile.setCurrentWorkload(0);
        guideProfile.setAvailable(true);
        guideProfile.setWomenSupportTrained(saved.womenSupportTrained());
        guideProfile.setVerificationStatus("VERIFIED");
        guideProfileRepository.save(guideProfile);

        // Create performance profile (Level 1 Beginner, credits = 0)
        com.aram.legalaid.model.LegalGuidePerformanceProfile perf = levelService.getOrCreatePerformanceProfile(saved.id());
        perf.setCurrentLevelNumber(1);
        perf.setCurrentLevelName("Beginner Legal Guide");
        performanceProfileRepository.save(perf);

        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("HELPER_CREATED", adminName, "Registered new volunteer: " + saved.email());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/complaints/{id}/assign-helper")
    public ResponseEntity<ComplaintResponse> assignHelper(@PathVariable Long id, @RequestBody Map<String, Object> body, Principal principal) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Complaint not found"));
        Long helperId = ((Number) body.get("helperId")).longValue();

        UserResponse helper = restTemplate.getForObject(AUTH_SERVICE_URL + "/" + helperId, UserResponse.class);
        if (helper == null) {
            throw new com.aram.legalaid.exception.ResourceNotFoundException("Helper not found");
        }

        User helperPOJO = new User(helper.id(), helper.name(), helper.email(), Role.HELPER);
        complaint.setAssignedHelper(helperPOJO);
        complaint.setStatus(com.aram.legalaid.enums.ComplaintStatus.HELPER_ASSIGNED);
        Complaint saved = complaintRepository.save(complaint);

        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("COMPLAINT_ASSIGNED", adminName, "Assigned helper " + helper.email() + " to complaint ID " + id);

        try {
            com.aram.legalaid.model.GuideAssignmentDecisionLog decisionLog = new com.aram.legalaid.model.GuideAssignmentDecisionLog();
            decisionLog.setComplaintId(id);
            decisionLog.setAssignedGuideId(helperId);

            Object principalObj = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principalObj instanceof com.aram.legalaid.security.UserPrincipal) {
                decisionLog.setAdminId(((com.aram.legalaid.security.UserPrincipal) principalObj).getId());
            } else {
                decisionLog.setAdminId(1L);
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
        }

        return ResponseEntity.ok(mapperService.toComplaintResponse(saved, null));
    }
}
