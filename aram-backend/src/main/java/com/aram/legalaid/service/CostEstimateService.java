package com.aram.legalaid.service;

import com.aram.legalaid.model.CostEstimateRule;
import com.aram.legalaid.repository.CostEstimateRuleRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CostEstimateService {
    private final CostEstimateRuleRepository costEstimateRuleRepository;

    public CostEstimateService(CostEstimateRuleRepository costEstimateRuleRepository) {
        this.costEstimateRuleRepository = costEstimateRuleRepository;
    }

    public Map<String, Object> calculateEstimate(
            String category,
            String priority,
            String authorityType,
            String district,
            int documentCount,
            boolean onlineSubmissionAvailable
    ) {
        CostEstimateRule rule = costEstimateRuleRepository
                .findByCategoryAndAuthorityTypeAndActiveTrue(category, authorityType)
                .orElse(null);

        int minVal = 0;
        int maxVal = 500;
        boolean freeLegalAid = true;
        String includes = "Print/photocopy/travel estimate";
        String excludes = "Professional legal fees";
        String notes = "Filing is free under legal aid rules.";

        if (rule != null) {
            minVal = rule.getMinAmount();
            maxVal = rule.getMaxAmount();
            freeLegalAid = rule.isFreeLegalAidAvailable();
            includes = rule.getIncludes() != null ? rule.getIncludes() : includes;
            excludes = rule.getExcludes() != null ? rule.getExcludes() : excludes;
            notes = rule.getNotes() != null ? rule.getNotes() : notes;
        } else {
            // Apply category fallbacks if rule is empty
            if ("LABOUR_DISPUTE".equalsIgnoreCase(category)) {
                minVal = 0; maxVal = 300;
            } else if ("CONSUMER_COMPLAINT".equalsIgnoreCase(category)) {
                minVal = 0; maxVal = 500;
            } else if ("CYBER_CRIME".equalsIgnoreCase(category)) {
                minVal = 0; maxVal = 500;
            } else if ("PROPERTY_CIVIL_DISPUTE".equalsIgnoreCase(category)) {
                minVal = 50; maxVal = 2000; freeLegalAid = false;
                includes = "Stamp duty/Certified deed copy";
                notes = "Civil suits require stamp paper.";
            } else if ("WOMEN_SAFETY_DOMESTIC_VIOLENCE".equalsIgnoreCase(category)) {
                minVal = 0; maxVal = 200;
            } else if ("CRIMINAL_COMPLAINT".equalsIgnoreCase(category)) {
                minVal = 0; maxVal = 200;
            }
        }

        // Adjust based on variables
        // Document costs (e.g. ₹10 per document print)
        int docCost = documentCount * 10;
        minVal += docCost;
        maxVal += docCost;

        // Online submission discount
        if (onlineSubmissionAvailable) {
            maxVal = Math.max(minVal, maxVal - 50); // Save ₹50 on travel
        }

        List<Map<String, Object>> breakdown = new ArrayList<>();
        breakdown.add(Map.of("name", "Document Printing & Photocopies", "amount", docCost));
        if (!onlineSubmissionAvailable) {
            breakdown.add(Map.of("name", "Local Travel to Authority Office", "amount", 100));
        }
        if (minVal > docCost) {
            breakdown.add(Map.of("name", "Official Filing/Court Fee", "amount", minVal - docCost));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("estimatedMinAmount", minVal);
        result.put("estimatedMaxAmount", maxVal);
        result.put("currency", "INR");
        result.put("freeLegalAidAvailable", freeLegalAid);
        result.put("costBreakdown", breakdown);
        result.put("includes", includes);
        result.put("excludes", excludes);
        result.put("notes", notes);
        result.put("disclaimer", "This is only an estimate. Final cost may change based on authority rules and documents.");

        return result;
    }
}
