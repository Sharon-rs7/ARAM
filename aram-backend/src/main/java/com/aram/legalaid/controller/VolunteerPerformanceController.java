package com.aram.legalaid.controller;

import com.aram.legalaid.model.*;
import com.aram.legalaid.repository.*;
import com.aram.legalaid.service.*;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class VolunteerPerformanceController {

    @Autowired
    private LegalGuideLevelService levelService;

    @Autowired
    private LegalGuidePerformanceProfileRepository performanceProfileRepository;

    @Autowired
    private LegalGuideCreditTransactionRepository creditTransactionRepository;

    @Autowired
    private LegalGuideLevelRuleRepository levelRuleRepository;

    @Autowired
    private LegalGuideProfileRepository guideProfileRepository;

    @Autowired
    private VolunteerMatchingTrainingSampleRepository matchingTrainingSampleRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private AiCorrectionLogRepository aiCorrectionLogRepository;

    @Autowired
    private UserService userService;

    // --- VOLUNTEER ENDPOINTS ---

    @GetMapping("/api/volunteer/performance")
    public ResponseEntity<LegalGuidePerformanceProfile> getMyPerformance() {
        User user = requireHelper();
        return ResponseEntity.ok(levelService.getOrCreatePerformanceProfile(user.getId()));
    }

    @GetMapping("/api/volunteer/credit-history")
    public ResponseEntity<List<LegalGuideCreditTransaction>> getMyCreditHistory() {
        User user = requireHelper();
        return ResponseEntity.ok(creditTransactionRepository.findAllByLegalGuideIdOrderByIdDesc(user.getId()));
    }

    @GetMapping("/api/volunteer/level-progress")
    public ResponseEntity<Map<String, Object>> getMyLevelProgress() {
        User user = requireHelper();
        LegalGuidePerformanceProfile perf = levelService.getOrCreatePerformanceProfile(user.getId());
        List<LegalGuideLevelRule> rules = levelRuleRepository.findAllByActiveTrueOrderByLevelNumberAsc();
        
        LegalGuideLevelRule currentRule = null;
        LegalGuideLevelRule nextRule = null;

        for (int i = 0; i < rules.size(); i++) {
            LegalGuideLevelRule rule = rules.get(i);
            if (perf.getCurrentLevelNumber() == rule.getLevelNumber()) {
                currentRule = rule;
                if (i + 1 < rules.size()) {
                    nextRule = rules.get(i + 1);
                }
                break;
            }
        }

        Map<String, Object> progress = new HashMap<>();
        progress.put("currentLevelNumber", perf.getCurrentLevelNumber());
        progress.put("currentLevelName", perf.getCurrentLevelName());
        progress.put("creditScore", perf.getCreditScore());
        progress.put("casesResolved", perf.getCasesResolved());
        progress.put("averageRating", perf.getAverageRating());
        
        double reopenRate = perf.getCasesAssigned() > 0 ? (double) perf.getCasesReopened() / perf.getCasesAssigned() : 0.0;
        progress.put("reopenRate", reopenRate);
        progress.put("adminQualityScore", perf.getAdminQualityScore());

        if (nextRule != null) {
            progress.put("nextLevelName", nextRule.getLevelName());
            progress.put("creditsNeeded", nextRule.getMinCreditScore() - perf.getCreditScore());
            progress.put("nextLevelThreshold", nextRule.getMinCreditScore());
        } else {
            progress.put("nextLevelName", "MAX LEVEL REACHED");
            progress.put("creditsNeeded", 0);
            progress.put("nextLevelThreshold", perf.getCreditScore());
        }

        return ResponseEntity.ok(progress);
    }

    // --- ADMIN ACTION ENDPOINTS ---

    @GetMapping("/api/admin/volunteers/{id}/performance")
    public ResponseEntity<LegalGuidePerformanceProfile> getVolunteerPerformance(@PathVariable Long id) {
        requireAdmin();
        return ResponseEntity.ok(levelService.getOrCreatePerformanceProfile(id));
    }

    @GetMapping("/api/admin/volunteers/{id}/credit-history")
    public ResponseEntity<List<LegalGuideCreditTransaction>> getVolunteerCreditHistory(@PathVariable Long id) {
        requireAdmin();
        return ResponseEntity.ok(creditTransactionRepository.findAllByLegalGuideIdOrderByIdDesc(id));
    }

    @PostMapping("/api/admin/volunteers/{id}/credits")
    public ResponseEntity<Map<String, String>> awardCredits(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User admin = requireAdmin();
        int points = ((Number) body.get("points")).intValue();
        String reason = (String) body.get("reason");
        String transactionType = (String) body.getOrDefault("transactionType", "ADMIN_MANUAL_AWARD");

        levelService.addCredit(id, null, transactionType, points, reason, admin.getId(), "ADMIN", "ADMIN");

        Map<String, String> resp = new HashMap<>();
        resp.put("status", "success");
        resp.put("message", "Successfully awarded " + points + " credits.");
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/api/admin/volunteers/{id}/deduct-credits")
    public ResponseEntity<Map<String, String>> deductCredits(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User admin = requireAdmin();
        int points = ((Number) body.get("points")).intValue();
        String reason = (String) body.get("reason");
        String transactionType = (String) body.getOrDefault("transactionType", "ADMIN_MANUAL_DEDUCT");

        // deduct points by negating points
        levelService.addCredit(id, null, transactionType, -Math.abs(points), reason, admin.getId(), "ADMIN", "ADMIN");

        Map<String, String> resp = new HashMap<>();
        resp.put("status", "success");
        resp.put("message", "Successfully deducted " + points + " credits.");
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/api/admin/volunteers/{id}/approve-downgrade")
    public ResponseEntity<Map<String, String>> approveDowngrade(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User admin = requireAdmin();
        String reason = (String) body.get("reason");
        int targetLevel = ((Number) body.get("targetLevelNumber")).intValue();

        levelService.approveDowngrade(id, admin.getId(), reason, targetLevel);

        Map<String, String> resp = new HashMap<>();
        resp.put("status", "success");
        resp.put("message", "Downgrade to Level " + targetLevel + " approved.");
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/api/admin/volunteers/{id}/manual-level-change")
    public ResponseEntity<Map<String, String>> manualLevelChange(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User admin = requireAdmin();
        int targetLevel = ((Number) body.get("targetLevelNumber")).intValue();
        String reason = (String) body.get("reason");

        levelService.manualLevelChange(id, admin.getId(), targetLevel, reason);

        Map<String, String> resp = new HashMap<>();
        resp.put("status", "success");
        resp.put("message", "Level manually updated to " + targetLevel + ".");
        return ResponseEntity.ok(resp);
    }

    // --- LEVEL RULES ENDPOINTS ---

    @GetMapping("/api/admin/level-rules")
    public ResponseEntity<List<LegalGuideLevelRule>> getLevelRules() {
        return ResponseEntity.ok(levelRuleRepository.findAllByActiveTrueOrderByLevelNumberAsc());
    }

    @PostMapping("/api/admin/level-rules")
    public ResponseEntity<LegalGuideLevelRule> createLevelRule(@RequestBody LegalGuideLevelRule rule) {
        requireAdmin();
        return ResponseEntity.ok(levelRuleRepository.save(rule));
    }

    @PutMapping("/api/admin/level-rules/{id}")
    public ResponseEntity<LegalGuideLevelRule> updateLevelRule(
            @PathVariable Long id,
            @RequestBody LegalGuideLevelRule ruleUpdates) {
        requireAdmin();
        LegalGuideLevelRule rule = levelRuleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Level rule not found"));
        rule.setLevelName(ruleUpdates.getLevelName());
        rule.setMinCreditScore(ruleUpdates.getMinCreditScore());
        rule.setMaxCreditScore(ruleUpdates.getMaxCreditScore());
        rule.setBadgeName(ruleUpdates.getBadgeName());
        rule.setAssignmentWeight(ruleUpdates.getAssignmentWeight());
        rule.setActive(ruleUpdates.isActive());
        return ResponseEntity.ok(levelRuleRepository.save(rule));
    }

    // --- PUBLIC USER TRUST SUMMARY ---

    @GetMapping("/api/citizen/complaints/{complaintId}/assigned-guide-trust-summary")
    public ResponseEntity<Map<String, Object>> getGuideTrustSummary(@PathVariable Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        
        User guide = complaint.getAssignedHelper();
        if (guide == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("assigned", false);
            return ResponseEntity.ok(response);
        }

        LegalGuidePerformanceProfile perf = levelService.getOrCreatePerformanceProfile(guide.getId());

        Map<String, Object> summary = new HashMap<>();
        summary.put("assigned", true);
        summary.put("name", guide.getName());
        summary.put("levelName", perf.getCurrentLevelName());
        summary.put("levelNumber", perf.getCurrentLevelNumber());
        summary.put("verified", guide.isHelperVerified());
        summary.put("languages", guide.getLanguagesKnown() != null ? List.of(guide.getLanguagesKnown().split(",")) : List.of("English", "Tamil"));
        summary.put("specialization", guide.getSpecialization());

        return ResponseEntity.ok(summary);
    }

    // --- ML DATA EXPORT ENDPOINTS ---

    @GetMapping("/api/admin/ml-training/export/volunteer-matching")
    public ResponseEntity<List<VolunteerMatchingTrainingSample>> exportVolunteerMatchingData() {
        requireAdmin();
        return ResponseEntity.ok(matchingTrainingSampleRepository.findAll());
    }

    @GetMapping("/api/admin/ml-training/export/complaints")
    public ResponseEntity<List<Map<String, Object>>> exportComplaintsData() {
        requireAdmin();
        List<Complaint> complaints = complaintRepository.findAll();
        List<Map<String, Object>> list = complaints.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("complaint_text", c.getDescription());
            map.put("category", c.getCategory() != null ? c.getCategory().name() : "OTHER");
            map.put("priority_label", c.getPriority() != null ? c.getPriority().name() : "MEDIUM");
            map.put("language_code", c.getLanguage() != null ? c.getLanguage() : "en");
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/api/admin/ml-training/export/authority")
    public ResponseEntity<List<Map<String, Object>>> exportAuthorityData() {
        requireAdmin();
        List<Complaint> complaints = complaintRepository.findAll();
        List<Map<String, Object>> list = complaints.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("complaint_text", c.getDescription());
            map.put("recommended_authority", c.getAuthority() != null ? c.getAuthority() : "Police");
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/api/admin/ml-training/export/documents")
    public ResponseEntity<List<Map<String, Object>>> exportDocumentsData() {
        requireAdmin();
        List<Complaint> complaints = complaintRepository.findAll();
        List<Map<String, Object>> list = complaints.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("complaint_text", c.getDescription());
            map.put("required_documents", "ID_Proof,Complaint_Copy");
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }



    // --- HELPERS ---

    private User requireHelper() {
        User user = userService.currentUser();
        if (user.getRole() != Role.HELPER) throw new ForbiddenException("Helper role required");
        return user;
    }

    private User requireAdmin() {
        User user = userService.currentUser();
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.SUPER_ADMIN) throw new ForbiddenException("Admin role required");
        return user;
    }
}
