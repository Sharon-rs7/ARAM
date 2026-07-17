package com.aram.legalaid.controller;

import com.aram.legalaid.dto.ComplaintResponse;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.Authority;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.AIResultRepository;
import com.aram.legalaid.service.AuthorityService;
import com.aram.legalaid.service.MapperService;
import com.aram.legalaid.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/authorities")
public class AuthorityController {
    private final AuthorityService authorityService;
    private final UserService userService;
    private final ComplaintRepository complaintRepository;
    private final AIResultRepository aiResultRepository;
    private final MapperService mapperService;

    public AuthorityController(AuthorityService authorityService, UserService userService, 
                               ComplaintRepository complaintRepository, AIResultRepository aiResultRepository, 
                               MapperService mapperService) {
        this.authorityService = authorityService;
        this.userService = userService;
        this.complaintRepository = complaintRepository;
        this.aiResultRepository = aiResultRepository;
        this.mapperService = mapperService;
    }

    @GetMapping
    public ResponseEntity<List<Authority>> all() {
        return ResponseEntity.ok(authorityService.all());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Authority>> byCategory(@PathVariable ComplaintCategory category) {
        return ResponseEntity.ok(authorityService.byCategory(category));
    }

    @GetMapping("/cases")
    public ResponseEntity<List<ComplaintResponse>> cases() {
        User officer = requireAuthorityOfficer();
        if (officer.getAssociatedAuthority() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        String authorityName = officer.getAssociatedAuthority().getName();
        return ResponseEntity.ok(complaintRepository.findByAuthorityOrderByCreatedAtDesc(authorityName).stream()
                .map(this::toResponse)
                .toList());
    }

    @GetMapping("/cases/{id}")
    public ResponseEntity<ComplaintResponse> caseDetails(@PathVariable Long id) {
        User officer = requireAuthorityOfficer();
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        
        if (officer.getAssociatedAuthority() == null || 
            complaint.getAuthority() == null || 
            !complaint.getAuthority().equalsIgnoreCase(officer.getAssociatedAuthority().getName())) {
            throw new ForbiddenException("You can access routed cases only");
        }
        return ResponseEntity.ok(toResponse(complaint));
    }

    @PutMapping("/cases/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User officer = requireAuthorityOfficer();
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        
        if (officer.getAssociatedAuthority() == null || 
            complaint.getAuthority() == null || 
            !complaint.getAuthority().equalsIgnoreCase(officer.getAssociatedAuthority().getName())) {
            throw new ForbiddenException("You can access routed cases only");
        }
        
        String newStatusStr = body.get("status");
        try {
            ComplaintStatus status = ComplaintStatus.valueOf(newStatusStr.toUpperCase());
            complaint.setStatus(status);
            Complaint saved = complaintRepository.save(complaint);
            return ResponseEntity.ok(toResponse(saved));
        } catch (IllegalArgumentException e) {
            throw new com.aram.legalaid.exception.BadRequestException("Invalid complaint status");
        }
    }

    @PostMapping("/cases/{id}/remarks")
    public ResponseEntity<ComplaintResponse> addRemarks(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User officer = requireAuthorityOfficer();
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        
        if (officer.getAssociatedAuthority() == null || 
            complaint.getAuthority() == null || 
            !complaint.getAuthority().equalsIgnoreCase(officer.getAssociatedAuthority().getName())) {
            throw new ForbiddenException("You can access routed cases only");
        }
        
        String remarks = body.get("remarks");
        complaint.setAuthorityRemarks(remarks);
        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity.ok(toResponse(saved));
    }

    private User requireAuthorityOfficer() {
        User user = userService.currentUser();
        if (user.getRole() != Role.AUTHORITY) throw new ForbiddenException("Authority Officer role required");
        return user;
    }

    private ComplaintResponse toResponse(Complaint complaint) {
        return mapperService.toComplaintResponse(complaint, aiResultRepository.findByComplaint(complaint).orElse(null));
    }
}
