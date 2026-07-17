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

    public HelperController(UserService userService, MapperService mapperService, ComplaintRepository complaintRepository, AIResultRepository aiResultRepository, ComplaintService complaintService) {
        this.userService = userService;
        this.mapperService = mapperService;
        this.complaintRepository = complaintRepository;
        this.aiResultRepository = aiResultRepository;
        this.complaintService = complaintService;
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

    @PutMapping("/cases/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        requireHelper();
        caseDetails(id);
        return ResponseEntity.ok(complaintService.updateStatus(id, request));
    }

    @PostMapping("/cases/{id}/notes")
    public ResponseEntity<ComplaintResponse> addNote(@PathVariable Long id) {
        return caseDetails(id);
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
