package com.aram.legalaid.controller;

import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.*;
import com.aram.legalaid.repository.*;
import com.aram.legalaid.service.*;
import com.aram.legalaid.enums.Role;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LocationCostController {
    private final AuthorityOfficeService authorityOfficeService;
    private final CostEstimateService costEstimateService;
    private final CaseCostEstimateRepository caseCostEstimateRepository;
    private final CostEstimateRuleRepository costEstimateRuleRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public LocationCostController(
            AuthorityOfficeService authorityOfficeService,
            CostEstimateService costEstimateService,
            CaseCostEstimateRepository caseCostEstimateRepository,
            CostEstimateRuleRepository costEstimateRuleRepository,
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            AuditLogService auditLogService
    ) {
        this.authorityOfficeService = authorityOfficeService;
        this.costEstimateService = costEstimateService;
        this.caseCostEstimateRepository = caseCostEstimateRepository;
        this.costEstimateRuleRepository = costEstimateRuleRepository;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    private User getCurrentUser(Principal principal) {
        String email = principal != null ? principal.getName() : "citizen@aram.ai";
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    // --- Public Citizen Endpoints ---
    @GetMapping("/citizen/complaints/{complaintId}/cost-estimate")
    public ResponseEntity<CaseCostEstimate> citizenGetCostEstimate(
            @PathVariable Long complaintId,
            Principal principal
    ) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        User user = getCurrentUser(principal);

        if (!complaint.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You do not own this complaint");
        }

        CaseCostEstimate estimate = caseCostEstimateRepository.findByComplaintId(complaintId)
                .orElse(null);
        
        // If estimate doesn't exist, generate it dynamically on the fly
        if (estimate == null) {
            try {
                String category = complaint.getCategory() != null ? complaint.getCategory().name() : "GENERAL_LEGAL_AID";
                String priority = complaint.getPriority() != null ? complaint.getPriority().name() : "MEDIUM";
                Map<String, Object> costCalc = costEstimateService.calculateEstimate(
                    category, priority, complaint.getAuthority(), complaint.getDistrict(), 2, true
                );
                
                estimate = new CaseCostEstimate();
                estimate.setComplaintId(complaint.getId());
                estimate.setCategory(category);
                estimate.setAuthorityType(complaint.getAuthority());
                estimate.setEstimatedMinAmount((Integer) costCalc.get("estimatedMinAmount"));
                estimate.setEstimatedMaxAmount((Integer) costCalc.get("estimatedMaxAmount"));
                estimate.setCurrency((String) costCalc.get("currency"));
                estimate.setFreeLegalAidAvailable((Boolean) costCalc.get("freeLegalAidAvailable"));
                estimate.setIncludes((String) costCalc.get("includes"));
                estimate.setExcludes((String) costCalc.get("excludes"));
                estimate.setNotes((String) costCalc.get("notes"));
                estimate.setEstimateSource("SYSTEM");
                
                estimate = caseCostEstimateRepository.save(estimate);
            } catch (Exception e) {
                // Return dummy fallback if calculation fails
                estimate = new CaseCostEstimate();
                estimate.setComplaintId(complaint.getId());
                estimate.setEstimatedMinAmount(0);
                estimate.setEstimatedMaxAmount(500);
            }
        }

        return ResponseEntity.ok(estimate);
    }

    // --- Legal Guide / Volunteer Endpoints ---
    @GetMapping("/volunteer/cases/{complaintId}/authority-locations")
    public ResponseEntity<List<AuthorityOffice>> volunteerGetLocations(
            @PathVariable Long complaintId,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            Principal principal
    ) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        User user = getCurrentUser(principal);

        if (user.getRole() != Role.HELPER && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Unauthorized access");
        }

        List<AuthorityOffice> matched = authorityOfficeService.findMatchingOffices(
                complaint.getCategory() != null ? complaint.getCategory().name() : "GENERAL_LEGAL_AID",
                complaint.getPriority() != null ? complaint.getPriority().name() : "MEDIUM",
                complaint.getDistrict(),
                "",
                complaint.getDetectedLanguage(),
                lat,
                lng
        );
        return ResponseEntity.ok(matched);
    }

    @PutMapping("/volunteer/cases/{complaintId}/authority-location")
    public ResponseEntity<Complaint> volunteerUpdateLocation(
            @PathVariable Long complaintId,
            @RequestBody Map<String, String> body,
            Principal principal
    ) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        User user = getCurrentUser(principal);

        if (user.getRole() != Role.HELPER && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Unauthorized access");
        }

        String authorityName = body.get("authorityName");
        complaint.setAuthority(authorityName);
        Complaint saved = complaintRepository.save(complaint);
        
        auditLogService.log("AUTHORITY_LOCATION_UPDATED", user.getEmail(), "Updated authority office to: " + authorityName + " for complaint: " + complaintId);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/volunteer/cases/{complaintId}/cost-estimate")
    public ResponseEntity<CaseCostEstimate> volunteerGetCost(
            @PathVariable Long complaintId,
            Principal principal
    ) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        User user = getCurrentUser(principal);

        if (user.getRole() != Role.HELPER && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Unauthorized access");
        }

        CaseCostEstimate estimate = caseCostEstimateRepository.findByComplaintId(complaintId)
                .orElse(null);

        if (estimate == null) {
            // Generate dynamic fallback
            String category = complaint.getCategory() != null ? complaint.getCategory().name() : "GENERAL_LEGAL_AID";
            String priority = complaint.getPriority() != null ? complaint.getPriority().name() : "MEDIUM";
            Map<String, Object> costCalc = costEstimateService.calculateEstimate(
                category, priority, complaint.getAuthority(), complaint.getDistrict(), 2, true
            );
            
            estimate = new CaseCostEstimate();
            estimate.setComplaintId(complaint.getId());
            estimate.setCategory(category);
            estimate.setAuthorityType(complaint.getAuthority());
            estimate.setEstimatedMinAmount((Integer) costCalc.get("estimatedMinAmount"));
            estimate.setEstimatedMaxAmount((Integer) costCalc.get("estimatedMaxAmount"));
            estimate.setCurrency((String) costCalc.get("currency"));
            estimate.setFreeLegalAidAvailable((Boolean) costCalc.get("freeLegalAidAvailable"));
            estimate.setIncludes((String) costCalc.get("includes"));
            estimate.setExcludes((String) costCalc.get("excludes"));
            estimate.setNotes((String) costCalc.get("notes"));
            estimate.setEstimateSource("SYSTEM");
            
            estimate = caseCostEstimateRepository.save(estimate);
        }

        return ResponseEntity.ok(estimate);
    }

    @PutMapping("/volunteer/cases/{complaintId}/cost-estimate")
    public ResponseEntity<CaseCostEstimate> volunteerUpdateCost(
            @PathVariable Long complaintId,
            @RequestBody Map<String, Object> body,
            Principal principal
    ) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        User user = getCurrentUser(principal);

        if (user.getRole() != Role.HELPER && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Unauthorized access");
        }

        CaseCostEstimate estimate = caseCostEstimateRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Cost estimate not found"));

        estimate.setEstimatedMinAmount(Integer.parseInt(body.get("estimatedMinAmount").toString()));
        estimate.setEstimatedMaxAmount(Integer.parseInt(body.get("estimatedMaxAmount").toString()));
        estimate.setFreeLegalAidAvailable(Boolean.parseBoolean(body.get("freeLegalAidAvailable").toString()));
        estimate.setCostType(body.getOrDefault("costType", "Custom Fee").toString());
        if (body.containsKey("notes")) {
            estimate.setNotes(body.get("notes").toString());
        }
        estimate.setVerifiedByLegalGuide(true);
        estimate.setEstimateSource("VOLUNTEER");

        CaseCostEstimate saved = caseCostEstimateRepository.save(estimate);
        
        auditLogService.log("COST_ESTIMATE_UPDATED_VOLUNTEER", user.getEmail(), "Volunteer updated cost estimate for complaint: " + complaintId);
        return ResponseEntity.ok(saved);
    }

    // --- Admin Cost Master Rules Endpoints ---
    @GetMapping("/admin/cost-estimates")
    public ResponseEntity<List<CostEstimateRule>> adminGetRules(Principal principal) {
        User user = getCurrentUser(principal);
        if (user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Admin access required");
        }
        return ResponseEntity.ok(costEstimateRuleRepository.findAll());
    }

    @PostMapping("/admin/cost-estimates")
    public ResponseEntity<CostEstimateRule> adminCreateRule(
            @RequestBody CostEstimateRule rule,
            Principal principal
    ) {
        User user = getCurrentUser(principal);
        if (user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Admin access required");
        }
        return ResponseEntity.ok(costEstimateRuleRepository.save(rule));
    }

    @PutMapping("/admin/cost-estimates/{id}")
    public ResponseEntity<CostEstimateRule> adminUpdateRule(
            @PathVariable Long id,
            @RequestBody CostEstimateRule details,
            Principal principal
    ) {
        User user = getCurrentUser(principal);
        if (user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Admin access required");
        }
        
        CostEstimateRule rule = costEstimateRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
        rule.setCategory(details.getCategory());
        rule.setAuthorityType(details.getAuthorityType());
        rule.setMinAmount(details.getMinAmount());
        rule.setMaxAmount(details.getMaxAmount());
        rule.setCurrency(details.getCurrency());
        rule.setFreeLegalAidAvailable(details.isFreeLegalAidAvailable());
        rule.setIncludes(details.getIncludes());
        rule.setExcludes(details.getExcludes());
        rule.setNotes(details.getNotes());
        rule.setActive(details.isActive());
        return ResponseEntity.ok(costEstimateRuleRepository.save(rule));
    }

    @DeleteMapping("/admin/cost-estimates/{id}")
    public ResponseEntity<Map<String, Boolean>> adminDeleteRule(
            @PathVariable Long id,
            Principal principal
    ) {
        User user = getCurrentUser(principal);
        if (user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Admin access required");
        }
        
        CostEstimateRule rule = costEstimateRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
        rule.setActive(false);
        costEstimateRuleRepository.save(rule);
        return ResponseEntity.ok(Map.of("deleted", true));
    }
}
