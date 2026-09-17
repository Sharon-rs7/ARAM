package com.aram.legalaid.controller;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.service.MapperService;
import com.aram.legalaid.service.RegionalAdminService;
import com.aram.legalaid.service.GuideAssignmentService;
import com.aram.legalaid.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/regional-admin")
public class RegionalAdminController {
    private final RegionalAdminService regionalAdminService;
    private final GuideAssignmentService guideAssignmentService;
    private final UserService userService;
    private final MapperService mapperService;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public RegionalAdminController(
            RegionalAdminService regionalAdminService,
            GuideAssignmentService guideAssignmentService,
            UserService userService,
            MapperService mapperService,
            ComplaintRepository complaintRepository,
            UserRepository userRepository
    ) {
        this.regionalAdminService = regionalAdminService;
        this.guideAssignmentService = guideAssignmentService;
        this.userService = userService;
        this.mapperService = mapperService;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    private User requireAdminOrSuperAdmin() {
        User user = userService.currentUser();
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.SUPER_ADMIN) {
            throw new ForbiddenException("Access Denied: Admin or Super Admin role required");
        }
        return user;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<RegionalDashboardDto> getDashboard(@RequestParam(required = false) String district) {
        User admin = requireAdminOrSuperAdmin();
        String targetDistrict = (district != null && !district.trim().isEmpty()) ? district.trim() : admin.getDistrict();
        return ResponseEntity.ok(regionalAdminService.getDashboardStats(admin, targetDistrict));
    }

    @GetMapping("/analytics")
    public ResponseEntity<RegionalAnalyticsDto> getAnalytics(
            @RequestParam(required = false) String district,
            @RequestParam(defaultValue = "30d") String range
    ) {
        User admin = requireAdminOrSuperAdmin();
        String targetDistrict = (district != null && !district.trim().isEmpty()) ? district.trim() : admin.getDistrict();
        return ResponseEntity.ok(regionalAdminService.getAnalytics(admin, targetDistrict, range));
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getComplaints(@RequestParam(required = false) String district) {
        User admin = requireAdminOrSuperAdmin();
        String targetDistrict = (district != null && !district.trim().isEmpty()) ? district.trim() : admin.getDistrict();
        if (admin.getRole() == Role.ADMIN) {
            if (admin.getDistrict() == null || !targetDistrict.equalsIgnoreCase(admin.getDistrict())) {
                throw new ForbiddenException("Access Denied: You cannot view complaints outside your region");
            }
        }
        
        List<Complaint> list = complaintRepository.findByDistrictOrderByCreatedAtDesc(targetDistrict);
        return ResponseEntity.ok(list.stream()
                .map(c -> mapperService.toComplaintResponse(c, null))
                .toList());
    }

    @GetMapping("/citizens")
    public ResponseEntity<List<UserResponse>> getCitizens(@RequestParam(required = false) String district) {
        User admin = requireAdminOrSuperAdmin();
        String targetDistrict = (district != null && !district.trim().isEmpty()) ? district.trim() : admin.getDistrict();
        if (admin.getRole() == Role.ADMIN) {
            if (admin.getDistrict() == null || !targetDistrict.equalsIgnoreCase(admin.getDistrict())) {
                throw new ForbiddenException("Access Denied: You cannot view citizens outside your region");
            }
        }
        List<User> list = userRepository.findByDistrict(targetDistrict).stream()
                .filter(u -> u.getRole() == Role.CITIZEN)
                .toList();
        return ResponseEntity.ok(list.stream().map(mapperService::toUserResponse).toList());
    }

    @GetMapping("/guides")
    public ResponseEntity<List<UserResponse>> getGuides(@RequestParam(required = false) String district) {
        User admin = requireAdminOrSuperAdmin();
        String targetDistrict = (district != null && !district.trim().isEmpty()) ? district.trim() : admin.getDistrict();
        if (admin.getRole() == Role.ADMIN) {
            if (admin.getDistrict() == null || !targetDistrict.equalsIgnoreCase(admin.getDistrict())) {
                throw new ForbiddenException("Access Denied: You cannot view guides outside your region");
            }
        }
        List<User> list = userRepository.findByRoleAndDistrict(Role.HELPER, targetDistrict);
        return ResponseEntity.ok(list.stream().map(mapperService::toUserResponse).toList());
    }

    @GetMapping({"/complaints/{complaintId}/recommend-guides", "/cases/{complaintId}/recommend-guide"})
    public ResponseEntity<List<Map<String, Object>>> getRecommendedGuides(
            @PathVariable Long complaintId
    ) {
        User admin = requireAdminOrSuperAdmin();
        return ResponseEntity.ok(guideAssignmentService.getRecommendedGuides(complaintId, admin));
    }

    @PostMapping({"/complaints/{complaintId}/assign-guide/{guideId}", "/cases/{complaintId}/assign-guide/{guideId}"})
    public ResponseEntity<Map<String, Object>> assignGuide(
            @PathVariable Long complaintId,
            @PathVariable Long guideId,
            @Valid @RequestBody GuideAssignmentDto dto
    ) {
        User admin = requireAdminOrSuperAdmin();
        return ResponseEntity.ok(guideAssignmentService.assignGuide(complaintId, guideId, dto, admin));
    }

    @PostMapping({"/complaints/{complaintId}/assign-guide", "/cases/{complaintId}/assign-guide"})
    public ResponseEntity<Map<String, Object>> assignGuideFromBody(
            @PathVariable Long complaintId,
            @RequestBody Map<String, Object> body
    ) {
        User admin = requireAdminOrSuperAdmin();
        Long guideId = ((Number) body.getOrDefault("guideId", body.get("legalGuideId"))).longValue();
        String overrideReason = (String) body.getOrDefault("overrideReason", "");
        String adminNote = (String) body.getOrDefault("adminNote", "");
        GuideAssignmentDto dto = new GuideAssignmentDto(guideId, overrideReason, adminNote);
        return ResponseEntity.ok(guideAssignmentService.assignGuide(complaintId, guideId, dto, admin));
    }

    @GetMapping("/admin-user")
    public ResponseEntity<UserResponse> getAdminUser(@RequestParam(required = false) String district) {
        User admin = requireAdminOrSuperAdmin();
        String targetDistrict = (district != null && !district.trim().isEmpty()) ? district.trim() : admin.getDistrict();
        if (admin.getRole() == Role.ADMIN) {
            if (admin.getDistrict() == null || !targetDistrict.equalsIgnoreCase(admin.getDistrict())) {
                throw new ForbiddenException("Access Denied: You cannot view admin of other regions");
            }
        }
        User targetAdmin = userRepository.findByRoleAndDistrict(Role.ADMIN, targetDistrict).stream()
                .filter(u -> u.getStatus() != com.aram.legalaid.enums.UserStatus.DELETED)
                .findFirst()
                .orElse(null);
        if (targetAdmin == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapperService.toUserResponse(targetAdmin));
    }
}
