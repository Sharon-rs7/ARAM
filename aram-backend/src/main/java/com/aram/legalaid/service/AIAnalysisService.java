package com.aram.legalaid.service;

import com.aram.legalaid.dto.AIResultResponse;
import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.PriorityLevel;
import com.aram.legalaid.model.AIResult;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.repository.AIResultRepository;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.util.AuthorityMapper;
import com.aram.legalaid.util.DelimitedStringUtil;
import com.aram.legalaid.util.DocumentChecklistMapper;
import com.aram.legalaid.util.NextStepMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.aram.legalaid.dto.AiTriageResponse;

@Service
public class AIAnalysisService {
    private final AIResultRepository aiResultRepository;
    private final ComplaintRepository complaintRepository;
    private final MapperService mapperService;
    private final MongoLogService mongoLogService;
    private final AIClientService aiClientService;
    private final AuditLogService auditLogService;

    public AIAnalysisService(
            AIResultRepository aiResultRepository, 
            ComplaintRepository complaintRepository, 
            MapperService mapperService, 
            MongoLogService mongoLogService,
            AIClientService aiClientService,
            AuditLogService auditLogService
    ) {
        this.aiResultRepository = aiResultRepository;
        this.complaintRepository = complaintRepository;
        this.mapperService = mapperService;
        this.mongoLogService = mongoLogService;
        this.aiClientService = aiClientService;
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

        // 1. Invoke external FastAPI via AIClientService
        AiTriageResponse triageRes = aiClientService.analyzeComplaint(
            complaint.getDescription(),
            complaint.getLanguage(),
            complaint.getDistrict(),
            complaint.isSensitive()
        );

        // 2. Map fields from external model outputs
        ComplaintCategory category = mapCategory(triageRes.category());
        PriorityLevel priorityLevel = mapPriority(triageRes.priority());
        int score = triageRes.priorityScore();
        double confidence = triageRes.confidence();
        String authority = triageRes.recommendedAuthority();
        List<String> docs = triageRes.requiredDocuments();
        List<String> nextSteps = triageRes.nextSteps();
        boolean manualReview = triageRes.manualReviewRequired();

        // 3. Fallback logic: check reason or safety overrides
        String reason = "External AI Model prediction: " + triageRes.category() + " category, with confidence " + triageRes.confidence() + ".";

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
            auditLogService.log("HIGH_RISK_FLAGGED", "SYSTEM", "High risk flagged automatically for complaint ID " + complaint.getId());
        }

        complaintRepository.save(complaint);

        Map<String, Object> log = new LinkedHashMap<>();
        log.put("complaintId", complaint.getId());
        log.put("category", category.name());
        log.put("confidence", confidence);
        log.put("priorityScore", score);
        log.put("priority", priorityLevel.name());
        log.put("manualReviewRequired", manualReview);
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

        if (bestScore == 0) {
            return new CategoryPrediction(ComplaintCategory.GENERAL_LEGAL_AID, 0.45, List.of());
        }
        double confidence = Math.min(0.95, 0.55 + (bestScore * 0.10));
        return new CategoryPrediction(bestCategory, confidence, matched);
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
        if (text.contains("money") || text.contains("amount") || text.contains("rs") || text.contains("₹")) score += 5;
        score += durationScore(text);
        return Math.max(0, Math.min(100, score));
    }

    private int durationScore(String text) {
        Pattern pattern = Pattern.compile("(\\d+)\\s*(month|months|maasam|mahine|year|years)");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            int value = Integer.parseInt(matcher.group(1));
            String unit = matcher.group(2);
            if (unit.startsWith("year")) return 20;
            if (value >= 3) return 15;
            if (value >= 1) return 8;
        }
        return 0;
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
        String keywordText = matchedKeywords.isEmpty() ? "general legal issue terms" : String.join(", ", matchedKeywords);
        StringBuilder builder = new StringBuilder();
        builder.append("Detected ").append(category.getDisplayName()).append(" based on keywords: ").append(keywordText).append(". ");
        builder.append("Priority is ").append(priority).append(" based on severity, urgency and case type.");
        if (sensitive) builder.append(" Privacy mode is enabled because the complaint was marked sensitive.");
        return builder.toString();
    }

    private record CategoryPrediction(ComplaintCategory category, double confidence, List<String> matchedKeywords) {}
}
