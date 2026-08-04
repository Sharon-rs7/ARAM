package com.aram.legalaid.service;

import com.aram.legalaid.dto.AIResultResponse;
import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.PriorityLevel;
import com.aram.legalaid.model.AIResult;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.repository.AIResultRepository;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.util.DelimitedStringUtil;
import com.aram.legalaid.dto.AiTriageResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AIAnalysisService {
    private final AIResultRepository aiResultRepository;
    private final ComplaintRepository complaintRepository;
    private final MapperService mapperService;
    private final MongoLogService mongoLogService;
    private final AIClientService aiClientService;
    private final AuditLogService auditLogService;
    private final FallbackAIAnalysisService fallbackAIAnalysisService;
    private final com.aram.legalaid.repository.CaseCostEstimateRepository caseCostEstimateRepository;
    private final CostEstimateService costEstimateService;

    public AIAnalysisService(
            AIResultRepository aiResultRepository, 
            ComplaintRepository complaintRepository, 
            MapperService mapperService, 
            MongoLogService mongoLogService,
            AIClientService aiClientService,
            AuditLogService auditLogService,
            FallbackAIAnalysisService fallbackAIAnalysisService,
            com.aram.legalaid.repository.CaseCostEstimateRepository caseCostEstimateRepository,
            CostEstimateService costEstimateService
    ) {
        this.aiResultRepository = aiResultRepository;
        this.complaintRepository = complaintRepository;
        this.mapperService = mapperService;
        this.mongoLogService = mongoLogService;
        this.aiClientService = aiClientService;
        this.auditLogService = auditLogService;
        this.fallbackAIAnalysisService = fallbackAIAnalysisService;
        this.caseCostEstimateRepository = caseCostEstimateRepository;
        this.costEstimateService = costEstimateService;
    }

    @Transactional
    public AIResult analyzeAndSave(Complaint complaint) {
        Optional<AIResult> existing = aiResultRepository.findByComplaint(complaint);
        if (existing.isPresent()) return existing.get();

        // 1. Fetch previous complaints for this user to calculate similarity
        List<Complaint> previous = complaintRepository.findByUserOrderByCreatedAtDesc(complaint.getUser());
        List<Map<String, Object>> existingPayloads = new ArrayList<>();
        for (Complaint p : previous) {
            if (!p.getId().equals(complaint.getId())) {
                existingPayloads.add(Map.of(
                    "id", p.getId(),
                    "title", p.getTitle() != null ? p.getTitle() : "",
                    "description", p.getDescription() != null ? p.getDescription() : ""
                ));
            }
        }

        // 2. Invoke external FastAPI via AIClientService
        AiTriageResponse triageRes = aiClientService.analyzeComplaint(
            complaint.getTitle(),
            complaint.getDescription(),
            complaint.getLanguage(),
            complaint.getDistrict(),
            complaint.isSensitive(),
            complaint.getPreferredHelperGender() != null ? complaint.getPreferredHelperGender().name() : "ANY",
            existingPayloads
        );

        // Check if FastAPI failed and returned a fallback response
        if (triageRes.fallbackUsed()) {
            System.out.println("FastAPI service returned fallback. Running FallbackAIAnalysisService.");
            return fallbackAIAnalysisService.analyzeAndSave(complaint);
        }

        // 3. Map fields from external model outputs
        ComplaintCategory category = mapCategory(triageRes.category());
        PriorityLevel priorityLevel = mapPriority(triageRes.priority());
        
        int score = switch (priorityLevel) {
            case LOW -> 30;
            case MEDIUM -> 55;
            case HIGH -> 78;
            case CRITICAL -> 92;
        };
        
        double confidence = triageRes.categoryConfidence();
        String authority = triageRes.recommendedAuthority();
        List<String> docs = triageRes.requiredDocuments();
        List<String> nextSteps = triageRes.nextSteps();
        boolean manualReview = triageRes.manualReviewRequired();

        String reason = triageRes.explanation() != null ? triageRes.explanation() : 
                "ML model prediction: " + triageRes.category() + " category, confidence " + confidence;

        AIResult result = new AIResult();
        result.setComplaint(complaint);
        result.setCategory(category);
        result.setPriority(priorityLevel);
        result.setPriorityScore(score);
        result.setConfidence(confidence);
        result.setRecommendedAuthority(authority);
        result.setReason(reason);
        result.setRequiredDocuments(DelimitedStringUtil.join(docs));
        result.setNextSteps(DelimitedStringUtil.join(nextSteps));
        result.setManualReviewRequired(manualReview);
        result.setFallbackUsed(false);
        result.setModelVersion(triageRes.modelVersion() != null ? triageRes.modelVersion() : "aram_ml_v1.0.0");
        
        AIResult saved = aiResultRepository.save(result);

        complaint.setCategory(category);
        complaint.setPriority(priorityLevel);
        complaint.setPriorityScore(score);
        complaint.setAuthority(authority);
        complaint.setStatus(ComplaintStatus.AUTHORITY_RECOMMENDED);
        
        boolean highRisk = category == ComplaintCategory.WOMEN_SAFETY_DOMESTIC_VIOLENCE
                || priorityLevel == PriorityLevel.CRITICAL
                || priorityLevel == PriorityLevel.HIGH
                || complaint.isSensitive();
        complaint.setHighRisk(highRisk);
        
        if (highRisk) {
            auditLogService.log("HIGH_RISK_FLAGGED", "SYSTEM", "High risk flagged automatically by ML triage for complaint ID " + complaint.getId());
        }

        complaintRepository.save(complaint);

        // Generate and save CaseCostEstimate
        try {
            Map<String, Object> costCalc = costEstimateService.calculateEstimate(
                category.name(), priorityLevel.name(), authority, complaint.getDistrict(), docs.size(), true
            );
            
            com.aram.legalaid.model.CaseCostEstimate costEstimate = new com.aram.legalaid.model.CaseCostEstimate();
            costEstimate.setComplaintId(complaint.getId());
            costEstimate.setCategory(category.name());
            costEstimate.setAuthorityType(authority);
            costEstimate.setEstimatedMinAmount((Integer) costCalc.get("estimatedMinAmount"));
            costEstimate.setEstimatedMaxAmount((Integer) costCalc.get("estimatedMaxAmount"));
            costEstimate.setCurrency((String) costCalc.get("currency"));
            costEstimate.setFreeLegalAidAvailable((Boolean) costCalc.get("freeLegalAidAvailable"));
            costEstimate.setIncludes((String) costCalc.get("includes"));
            costEstimate.setExcludes((String) costCalc.get("excludes"));
            costEstimate.setNotes((String) costCalc.get("notes"));
            costEstimate.setEstimateSource("SYSTEM");
            costEstimate.setVerifiedByAdmin(false);
            costEstimate.setVerifiedByLegalGuide(false);
            
            caseCostEstimateRepository.save(costEstimate);
            auditLogService.log("COST_ESTIMATE_GENERATED", "SYSTEM", "Generated cost estimate for complaint ID " + complaint.getId());
        } catch (Exception e) {
            System.err.println("Failed to calculate/save cost estimate: " + e.getMessage());
        }

        Map<String, Object> log = new LinkedHashMap<>();
        log.put("complaintId", complaint.getId());
        log.put("category", category.name());
        log.put("confidence", confidence);
        log.put("priorityScore", score);
        log.put("priority", priorityLevel.name());
        log.put("manualReviewRequired", manualReview);
        log.put("modelVersion", result.getModelVersion());
        mongoLogService.log("ai_classification_logs", log);

        return saved;
    }

    private ComplaintCategory mapCategory(String apiCat) {
        if (apiCat == null) return ComplaintCategory.GENERAL_LEGAL_AID;
        switch (apiCat.toUpperCase()) {
            case "LABOUR_DISPUTE": return ComplaintCategory.LABOUR_DISPUTE;
            case "CONSUMER_COMPLAINT": return ComplaintCategory.CONSUMER_COMPLAINT;
            case "CYBER_CRIME": return ComplaintCategory.CYBER_CRIME;
            case "PROPERTY_DISPUTE":
            case "PROPERTY_CIVIL_DISPUTE": return ComplaintCategory.PROPERTY_CIVIL_DISPUTE;
            case "WOMEN_SAFETY":
            case "DOMESTIC_VIOLENCE":
            case "WOMEN_SAFETY_DOMESTIC_VIOLENCE": return ComplaintCategory.WOMEN_SAFETY_DOMESTIC_VIOLENCE;
            case "CRIMINAL_COMPLAINT": return ComplaintCategory.CRIMINAL_COMPLAINT;
            default: return ComplaintCategory.GENERAL_LEGAL_AID;
        }
    }

    private PriorityLevel mapPriority(String apiPrio) {
        if (apiPrio == null) return PriorityLevel.LOW;
        switch (apiPrio.toUpperCase()) {
            case "CRITICAL": return PriorityLevel.CRITICAL;
            case "HIGH": return PriorityLevel.HIGH;
            case "MEDIUM": return PriorityLevel.MEDIUM;
            default: return PriorityLevel.LOW;
        }
    }

    public AIResultResponse response(AIResult result) {
        return mapperService.toAIResultResponse(result);
    }
}
