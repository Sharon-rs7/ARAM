package com.aram.legalaid.controller;

import com.aram.legalaid.enums.Role;
import com.aram.legalaid.exception.BadRequestException;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.aram.legalaid.model.VolunteerSelfEvaluation;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.VolunteerSelfEvaluationRepository;
import com.aram.legalaid.service.AuditLogService;
import com.aram.legalaid.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class VolunteerSelfEvaluationController {

    private final VolunteerSelfEvaluationRepository evaluationRepository;
    private final ComplaintRepository complaintRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;

    public VolunteerSelfEvaluationController(
            VolunteerSelfEvaluationRepository evaluationRepository,
            ComplaintRepository complaintRepository,
            UserService userService,
            AuditLogService auditLogService
    ) {
        this.evaluationRepository = evaluationRepository;
        this.complaintRepository = complaintRepository;
        this.userService = userService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/volunteer/cases/{complaintId}/self-evaluation")
    public ResponseEntity<VolunteerSelfEvaluation> submitSelfEvaluation(
            @PathVariable Long complaintId,
            @RequestBody Map<String, Object> payload
    ) {
        User currentUser = userService.currentUser();
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        // Ensure current user is the assigned volunteer or an Admin
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.SUPER_ADMIN) {
            if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("Only the assigned Legal Guide can submit a self-evaluation for this case.");
            }
        }

        VolunteerSelfEvaluation eval = evaluationRepository.findByComplaintId(complaintId)
                .orElseGet(VolunteerSelfEvaluation::new);

        eval.setComplaintId(complaintId);
        eval.setVolunteerId(currentUser.getId());

        if (payload.containsKey("caseDifficulty")) {
            eval.setCaseDifficulty(String.valueOf(payload.get("caseDifficulty")));
        }
        if (payload.containsKey("confidenceLevel")) {
            eval.setConfidenceLevel(((Number) payload.get("confidenceLevel")).intValue());
        }
        if (payload.containsKey("timeSpentHours")) {
            eval.setTimeSpentHours(((Number) payload.get("timeSpentHours")).doubleValue());
        }
        if (payload.containsKey("challengesFaced")) {
            eval.setChallengesFaced(String.valueOf(payload.get("challengesFaced")));
        }
        if (payload.containsKey("aiUsefulnessRating")) {
            eval.setAiUsefulnessRating(((Number) payload.get("aiUsefulnessRating")).intValue());
        }
        if (payload.containsKey("communicationDifficulty")) {
            eval.setCommunicationDifficulty(String.valueOf(payload.get("communicationDifficulty")));
        }
        if (payload.containsKey("caseOutcome")) {
            eval.setCaseOutcome(String.valueOf(payload.get("caseOutcome")));
        }
        if (payload.containsKey("lessonsLearned")) {
            eval.setLessonsLearned(String.valueOf(payload.get("lessonsLearned")));
        }

        VolunteerSelfEvaluation saved = evaluationRepository.save(eval);

        auditLogService.log(
                "VOLUNTEER_SELF_EVALUATION",
                currentUser.getEmail(),
                "Volunteer " + currentUser.getEmail() + " submitted self-evaluation for case ARAM-" + complaintId
        );

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/volunteer/cases/{complaintId}/self-evaluation")
    public ResponseEntity<VolunteerSelfEvaluation> getSelfEvaluation(@PathVariable Long complaintId) {
        User currentUser = userService.currentUser();
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.SUPER_ADMIN) {
            if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("Unauthorized to view this self-evaluation.");
            }
        }

        VolunteerSelfEvaluation eval = evaluationRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("No self-evaluation found for complaint ID: " + complaintId));

        return ResponseEntity.ok(eval);
    }

    @GetMapping("/admin/volunteer-evaluations")
    public ResponseEntity<List<VolunteerSelfEvaluation>> getAllEvaluations() {
        User currentUser = userService.currentUser();
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.SUPER_ADMIN) {
            throw new ForbiddenException("Only administrators can view aggregated volunteer evaluations.");
        }
        return ResponseEntity.ok(evaluationRepository.findAll());
    }
}
