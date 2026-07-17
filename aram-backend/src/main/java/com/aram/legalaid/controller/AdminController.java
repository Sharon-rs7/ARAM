package com.aram.legalaid.controller;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.UserStatus;
import com.aram.legalaid.model.AuditLog;
import com.aram.legalaid.model.User;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.repository.AuditLogRepository;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.service.AdminService;
import com.aram.legalaid.service.AuditLogService;
import com.aram.legalaid.service.ComplaintService;
import com.aram.legalaid.service.MapperService;
import com.aram.legalaid.util.ExcelExportUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

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

    public AdminController(AdminService adminService, ComplaintService complaintService, UserRepository userRepository,
                           ComplaintRepository complaintRepository, MapperService mapperService,
                           AuditLogService auditLogService, AuditLogRepository auditLogRepository) {
        this.adminService = adminService;
        this.complaintService = complaintService;
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.mapperService = mapperService;
        this.auditLogService = auditLogService;
        this.auditLogRepository = auditLogRepository;
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
    public ResponseEntity<ComplaintResponse> assignHelper(@PathVariable Long id, @RequestBody java.util.Map<String, Long> body, Principal principal) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Complaint not found"));
        User helper = userRepository.findById(body.get("helperId")).orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Helper not found"));
        complaint.setAssignedHelper(helper);
        complaint.setStatus(ComplaintStatus.HELPER_ASSIGNED);
        Complaint saved = complaintRepository.save(complaint);
        String adminName = principal != null ? principal.getName() : "admin@aram.ai";
        auditLogService.log("COMPLAINT_ASSIGNED", adminName, "Assigned helper " + helper.getEmail() + " to complaint ID " + id);
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
    public ResponseEntity<List<AuditLog>> auditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
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
}
