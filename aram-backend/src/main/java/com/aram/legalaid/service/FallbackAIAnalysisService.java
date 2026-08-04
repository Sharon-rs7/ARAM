package com.aram.legalaid.service;

import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.PriorityLevel;
import com.aram.legalaid.model.AIResult;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.repository.AIResultRepository;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.util.DelimitedStringUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class FallbackAIAnalysisService {
    private final AIResultRepository aiResultRepository;
    private final ComplaintRepository complaintRepository;
    private final AuditLogService auditLogService;

    public FallbackAIAnalysisService(
            AIResultRepository aiResultRepository, 
            ComplaintRepository complaintRepository, 
            AuditLogService auditLogService
    ) {
        this.aiResultRepository = aiResultRepository;
        this.complaintRepository = complaintRepository;
        this.auditLogService = auditLogService;
    }

    private static final Map<ComplaintCategory, List<String>> CATEGORY_KEYWORDS = Map.of(
            ComplaintCategory.LABOUR_DISPUTE, List.of("salary", "wage", "employer", "employee", "job", "termination", "company", "sambalam", "velai", "kudukala", "tankha", "kaam", "mazdoori"),
            ComplaintCategory.CONSUMER_COMPLAINT, List.of("refund", "product", "damaged", "seller", "order", "invoice", "delivery", "warranty", "mobile", "phone", "bill", "kharid", "vastu"),
            ComplaintCategory.CYBER_CRIME, List.of("upi", "fraud", "scam", "otp", "bank", "account", "transaction", "hacked", "online fraud", "cyber", "password"),
            ComplaintCategory.PROPERTY_CIVIL_DISPUTE, List.of("land", "property", "house", "neighbour", "neighbor", "encroach", "patta", "deed", "boundary", "nilam", "zameen", "bhoomi"),
            ComplaintCategory.WOMEN_SAFETY_DOMESTIC_VIOLENCE, List.of("husband", "wife", "domestic", "violence", "beating", "harassment", "abuse", "dowry", "threaten", "adikraru", "mahila", "woman", "women"),
            ComplaintCategory.CRIMINAL_COMPLAINT, List.of("theft", "stole", "stolen", "attack", "assault", "murder", "kidnap", "police", "bike stolen", "robbery"),
            ComplaintCategory.GENERAL_LEGAL_AID, List.of("legal help", "legal aid", "advice", "guidance", "case", "notice")
    );

    private static final List<String> CRITICAL_KEYWORDS = List.of("kill", "murder", "rape", "kidnap", "danger", "life threat", "suicide", "blood", "weapon", "emergency");
    private static final List<String> HIGH_KEYWORDS = List.of("threat", "threatening", "violence", "assault", "abuse", "harassment", "fraud", "hacked", "bank fraud", "beating");
    private static final List<String> URGENCY_KEYWORDS = List.of("urgent", "immediate", "help", "now", "danger", "emergency", "today", "quick");

    @Transactional
    public AIResult analyzeAndSave(Complaint complaint) {
        Optional<AIResult> existing = aiResultRepository.findByComplaint(complaint);
        if (existing.isPresent()) return existing.get();

        String rawText = complaint.getDescription() + " " + Optional.ofNullable(complaint.getTranscribedText()).orElse("");
        String text = normalize(rawText);

        CategoryPrediction pred = classify(text);
        ComplaintCategory category = pred.category();
        
        int score = calculatePriorityScore(text, category, complaint.isSensitive());
        PriorityLevel priorityLevel = priorityLevel(score);

        String authority = "District Legal Services Authority";
        if (category == ComplaintCategory.LABOUR_DISPUTE) authority = "Labour Office";
        else if (category == ComplaintCategory.CONSUMER_COMPLAINT) authority = "Consumer Forum";
        else if (category == ComplaintCategory.CYBER_CRIME) authority = "Cyber Crime Portal";
        else if (category == ComplaintCategory.CRIMINAL_COMPLAINT || category == ComplaintCategory.PROPERTY_CIVIL_DISPUTE) authority = "Police Station";
        else if (category == ComplaintCategory.WOMEN_SAFETY_DOMESTIC_VIOLENCE) authority = "Women Helpline";

        List<String> docs = List.of("Aadhaar Card", "Proof of incident");
        List<String> nextSteps = List.of("Submit complaint details", "Await coordinator review");
        
        String reason = "Emergency Fallback rule-based analysis: " + buildReason(text, category, pred.matchedKeywords(), priorityLevel, complaint.isSensitive());

        AIResult result = new AIResult();
        result.setComplaint(complaint);
        result.setCategory(category);
        result.setPriority(priorityLevel);
        result.setPriorityScore(score);
        result.setConfidence(0.40); // Low confidence for fallback
        result.setRecommendedAuthority(authority);
        result.setReason(reason);
        result.setRequiredDocuments(DelimitedStringUtil.join(docs));
        result.setNextSteps(DelimitedStringUtil.join(nextSteps));
        result.setManualReviewRequired(true); // Always true on fallback
        result.setFallbackUsed(true);
        result.setModelVersion("fallback_rules_v1.0.0");
        
        AIResult saved = aiResultRepository.save(result);

        complaint.setCategory(category);
        complaint.setPriority(priorityLevel);
        complaint.setPriorityScore(score);
        complaint.setAuthority(authority);
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaint.setHighRisk(category == ComplaintCategory.WOMEN_SAFETY_DOMESTIC_VIOLENCE || priorityLevel == PriorityLevel.CRITICAL);
        
        complaintRepository.save(complaint);

        auditLogService.log("FALLBACK_AI_ANALYSIS_TRIGGERED", "SYSTEM", "Fallback rule-based triage triggered for complaint ID " + complaint.getId());
        return saved;
    }

    private CategoryPrediction classify(String text) {
        ComplaintCategory bestCategory = ComplaintCategory.GENERAL_LEGAL_AID;
        int bestScore = 0;
        List<String> matched = new ArrayList<>();

        for (Map.Entry<ComplaintCategory, List<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
            int score = 0;
            List<String> localMatched = new ArrayList<>();
            for (String keyword : entry.getValue()) {
                if (text.contains(keyword.toLowerCase())) {
                    score++;
                    localMatched.add(keyword);
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestCategory = entry.getKey();
                matched = localMatched;
            }
        }

        return new CategoryPrediction(bestCategory, 0.40, matched);
    }

    private int calculatePriorityScore(String text, ComplaintCategory category, boolean sensitive) {
        int score = switch (category) {
            case WOMEN_SAFETY_DOMESTIC_VIOLENCE -> 70;
            case CRIMINAL_COMPLAINT -> 60;
            case CYBER_CRIME -> 55;
            case PROPERTY_CIVIL_DISPUTE -> 40;
            case LABOUR_DISPUTE -> 35;
            case CONSUMER_COMPLAINT -> 30;
            case GENERAL_LEGAL_AID -> 20;
        };
        score += countAny(text, CRITICAL_KEYWORDS) * 15;
        score += countAny(text, HIGH_KEYWORDS) * 8;
        score += countAny(text, URGENCY_KEYWORDS) * 5;
        if (sensitive) score += 12;
        return Math.max(0, Math.min(100, score));
    }

    private PriorityLevel priorityLevel(int score) {
        if (score >= 90) return PriorityLevel.CRITICAL;
        if (score >= 70) return PriorityLevel.HIGH;
        if (score >= 40) return PriorityLevel.MEDIUM;
        return PriorityLevel.LOW;
    }

    private int countAny(String text, List<String> keywords) {
        int count = 0;
        for (String keyword : keywords) {
            if (text.contains(keyword.toLowerCase())) count++;
        }
        return count;
    }

    private String normalize(String text) {
        return text == null ? "" : text.toLowerCase(Locale.ROOT).replaceAll("\\s+", " ").trim();
    }

    private String buildReason(String text, ComplaintCategory category, List<String> matchedKeywords, PriorityLevel priority, boolean sensitive) {
        String keywordText = matchedKeywords.isEmpty() ? "general terms" : String.join(", ", matchedKeywords);
        return "Detected " + category.name() + " via keywords: " + keywordText + ". Priority: " + priority;
    }

    private record CategoryPrediction(ComplaintCategory category, double confidence, List<String> matchedKeywords) {}
}
