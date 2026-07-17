package com.aram.legalaid.controller;

import com.aram.legalaid.dto.ComplaintResponse;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.AIResultRepository;
import com.aram.legalaid.service.MapperService;
import com.aram.legalaid.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advocate")
public class AdvocateController {
    private final UserService userService;
    private final MapperService mapperService;
    private final ComplaintRepository complaintRepository;
    private final AIResultRepository aiResultRepository;

    public AdvocateController(UserService userService, MapperService mapperService, 
                              ComplaintRepository complaintRepository, AIResultRepository aiResultRepository) {
        this.userService = userService;
        this.mapperService = mapperService;
        this.complaintRepository = complaintRepository;
        this.aiResultRepository = aiResultRepository;
    }

    @GetMapping("/cases")
    public ResponseEntity<List<ComplaintResponse>> cases() {
        User advocate = requireAdvocate();
        return ResponseEntity.ok(complaintRepository.findByReferredAdvocateOrderByCreatedAtDesc(advocate).stream()
                .map(this::toResponse)
                .toList());
    }

    @GetMapping("/cases/{id}")
    public ResponseEntity<ComplaintResponse> caseDetails(@PathVariable Long id) {
        User advocate = requireAdvocate();
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        if (complaint.getReferredAdvocate() == null || !complaint.getReferredAdvocate().getId().equals(advocate.getId())) {
            throw new ForbiddenException("You can access referred cases only");
        }
        return ResponseEntity.ok(toResponse(complaint));
    }

    @PostMapping("/cases/{id}/opinion")
    public ResponseEntity<ComplaintResponse> addOpinion(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User advocate = requireAdvocate();
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        if (complaint.getReferredAdvocate() == null || !complaint.getReferredAdvocate().getId().equals(advocate.getId())) {
            throw new ForbiddenException("You can access referred cases only");
        }
        String opinion = body.get("opinion");
        complaint.setLegalOpinion(opinion);
        // Optionally progress the status if legal opinion is given
        if (complaint.getStatus() == ComplaintStatus.HELPER_ASSIGNED || complaint.getStatus() == ComplaintStatus.SUBMITTED) {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        }
        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity.ok(toResponse(saved));
    }

    private User requireAdvocate() {
        User user = userService.currentUser();
        if (user.getRole() != Role.ADVOCATE) throw new ForbiddenException("Advocate role required");
        return user;
    }

    private ComplaintResponse toResponse(Complaint complaint) {
        return mapperService.toComplaintResponse(complaint, aiResultRepository.findByComplaint(complaint).orElse(null));
    }
}
