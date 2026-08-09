package com.aram.legalaid.service;

import com.aram.legalaid.model.*;
import com.aram.legalaid.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LegalGuideLevelService {

    @Autowired
    private LegalGuideLevelRuleRepository levelRuleRepository;

    @Autowired
    private LegalGuidePerformanceProfileRepository performanceProfileRepository;

    @Autowired
    private LegalGuideCreditTransactionRepository creditTransactionRepository;

    @Autowired
    private LegalGuideProfileRepository guideProfileRepository;



    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationService notificationService;

    @PostConstruct
    public void init() {
        seedLevelRules();
    }

    private void seedLevelRules() {
        if (levelRuleRepository.count() == 0 || levelRuleRepository.count() != 4) {
            System.out.println("Synchronizing 4-Tier Legal Guide Level Rules...");
            levelRuleRepository.deleteAll();
            levelRuleRepository.save(new LegalGuideLevelRule(1, "JUNIOR", 0, 199, "Junior Guide", 1.0));
            levelRuleRepository.save(new LegalGuideLevelRule(2, "GUIDE", 200, 499, "Legal Guide", 1.2));
            levelRuleRepository.save(new LegalGuideLevelRule(3, "SENIOR", 500, 999, "Senior Guide", 1.4));
            levelRuleRepository.save(new LegalGuideLevelRule(4, "EXPERT", 1000, Integer.MAX_VALUE, "Expert Advocate", 1.6));
            System.out.println("Successfully seeded 4 Level Rules (JUNIOR, GUIDE, SENIOR, EXPERT).");
        }
    }

    public int calculateCompletionCredit(Complaint complaint) {
        if (complaint == null || complaint.getPriority() == null) {
            return 20; // Default LOW priority
        }
        return switch (complaint.getPriority()) {
            case LOW -> 20;
            case MEDIUM -> 35;
            case HIGH -> 50;
            case CRITICAL -> 80;
        };
    }

    @Transactional
    public void addCredit(Long legalGuideId, Long complaintId, String transactionType, int points, String reason, Long awardedByUserId, String awardedByRole, String source) {
        // Idempotency: Duplicate credit transaction prevention for same case & transaction type
        if (complaintId != null && creditTransactionRepository.existsByLegalGuideIdAndComplaintIdAndTransactionType(legalGuideId, complaintId, transactionType)) {
            System.out.println("Duplicate credit transaction skipped for Guide: " + legalGuideId + ", Complaint: " + complaintId + ", Type: " + transactionType);
            return;
        }

        // Save credit transaction
        LegalGuideCreditTransaction tx = new LegalGuideCreditTransaction(
            legalGuideId, complaintId, transactionType, points, reason, awardedByUserId, awardedByRole, source
        );
        try {
            creditTransactionRepository.saveAndFlush(tx);
        } catch (Exception e) {
            System.out.println("Duplicate credit transaction intercepted by database unique constraint for Guide: " + legalGuideId + ", Complaint: " + complaintId);
            return;
        }

        // Fetch performance profile
        LegalGuidePerformanceProfile perf = getOrCreatePerformanceProfile(legalGuideId);
        int oldScore = perf.getCreditScore();
        int newScore = Math.max(0, oldScore + points);
        perf.setCreditScore(newScore);

        // Track metrics based on transaction type
        if ("CASE_RESOLVED_BY_GUIDE".equals(transactionType) || "CASE_COMPLETED".equals(transactionType)) {
            perf.setCasesResolved(perf.getCasesResolved() + 1);
        } else if ("USER_CONFIRMED_RESOLVED".equals(transactionType)) {
            perf.setCasesConfirmedResolved(perf.getCasesConfirmedResolved() + 1);
        } else if ("CASE_REOPENED_POOR_GUIDANCE".equals(transactionType)) {
            perf.setCasesReopened(perf.getCasesReopened() + 1);
            perf.setDowngradeReviewRequired(true);
            auditLogService.log("DOWNGRADE_REVIEW_FLAGGED", "SYSTEM", "Guide ID " + legalGuideId + " flagged due to case reopen");
        } else if ("PRIVACY_VIOLATION".equals(transactionType)) {
            perf.setPrivacyViolationCount(perf.getPrivacyViolationCount() + 1);
            perf.setDowngradeReviewRequired(true);
            auditLogService.log("DOWNGRADE_REVIEW_FLAGGED", "SYSTEM", "Guide ID " + legalGuideId + " flagged due to privacy violation");
        } else if ("ACTION_PLAN_SHARED".equals(transactionType)) {
            perf.setActionPlanSharedCount(perf.getActionPlanSharedCount() + 1);
        } else if ("DOCUMENT_REQUEST_CREATED".equals(transactionType)) {
            perf.setDocumentRequestCount(perf.getDocumentRequestCount() + 1);
        }

        performanceProfileRepository.save(perf);
        
        // Log audit trail
        String actionType = points >= 0 ? "CREDIT_AWARDED" : "CREDIT_DEDUCTED";
        auditLogService.log(actionType, awardedByRole != null ? awardedByRole : "SYSTEM", 
            "Points: " + points + " | Old XP: " + oldScore + " | New XP: " + newScore + " for Guide: " + legalGuideId + " reason: " + reason);

        // Evaluate level upgrade/downgrade rules
        evaluateLevel(legalGuideId, oldScore, newScore);
    }

    private void evaluateLevel(Long legalGuideId, int oldScore, int newScore) {
        LegalGuidePerformanceProfile perf = getOrCreatePerformanceProfile(legalGuideId);
        List<LegalGuideLevelRule> rules = levelRuleRepository.findAllByActiveTrueOrderByLevelNumberAsc();
        
        LegalGuideLevelRule targetRule = null;
        for (LegalGuideLevelRule rule : rules) {
            if (newScore >= rule.getMinCreditScore() && newScore <= rule.getMaxCreditScore()) {
                targetRule = rule;
                break;
            }
        }

        if (targetRule != null && targetRule.getLevelNumber() != perf.getCurrentLevelNumber()) {
            final LegalGuideLevelRule finalTargetRule = targetRule;
            int oldLevel = perf.getCurrentLevelNumber();
            int newLevel = targetRule.getLevelNumber();
            
            if (newLevel > oldLevel) {
                // Automatic Upgrade
                perf.setCurrentLevelNumber(newLevel);
                perf.setCurrentLevelName(targetRule.getLevelName());
                perf.setLastLevelUpdatedAt(LocalDateTime.now());
                performanceProfileRepository.save(perf);

                guideProfileRepository.findByUserId(legalGuideId).ifPresent(profile -> {
                    User user = new User(profile.getUserId(), profile.getFullName(), profile.getEmail(), com.aram.legalaid.enums.Role.HELPER);
                    notificationService.create(user, "Level Upgraded: Congratulations! You are now a " + finalTargetRule.getLevelName() + ".", com.aram.legalaid.enums.NotificationType.IN_APP);
                });
                
                auditLogService.log("LEVEL_UPGRADED", "SYSTEM", 
                    "Guide ID " + legalGuideId + " upgraded from Level " + oldLevel + " (" + perf.getCurrentLevelName() + ") to Level " + newLevel + " (" + targetRule.getLevelName() + ")");
            } else {
                // Automatic Downgrade based on verified negative transaction
                perf.setCurrentLevelNumber(newLevel);
                perf.setCurrentLevelName(targetRule.getLevelName());
                perf.setLastLevelUpdatedAt(LocalDateTime.now());
                performanceProfileRepository.save(perf);

                guideProfileRepository.findByUserId(legalGuideId).ifPresent(profile -> {
                    User user = new User(profile.getUserId(), profile.getFullName(), profile.getEmail(), com.aram.legalaid.enums.Role.HELPER);
                    notificationService.create(user, "Level Adjusted: Your level is now " + finalTargetRule.getLevelName() + ".", com.aram.legalaid.enums.NotificationType.IN_APP);
                });

                auditLogService.log("LEVEL_DOWNGRADED", "SYSTEM", 
                    "Guide ID " + legalGuideId + " downgraded from Level " + oldLevel + " to Level " + newLevel + " (" + targetRule.getLevelName() + ")");
            }
        }
    }

    @Transactional
    public void reconcileCreditScore(Long legalGuideId) {
        int ledgerSum = creditTransactionRepository.findAllByLegalGuideId(legalGuideId).stream()
            .mapToInt(LegalGuideCreditTransaction::getPoints)
            .sum();
        LegalGuidePerformanceProfile perf = getOrCreatePerformanceProfile(legalGuideId);
        int oldScore = perf.getCreditScore();
        int newScore = Math.max(0, ledgerSum);
        perf.setCreditScore(newScore);
        performanceProfileRepository.save(perf);
        evaluateLevel(legalGuideId, oldScore, newScore);
    }

    @Transactional
    public void approveDowngrade(Long legalGuideId, Long adminId, String reason, int targetLevelNumber) {
        LegalGuidePerformanceProfile perf = getOrCreatePerformanceProfile(legalGuideId);
        Optional<LegalGuideLevelRule> ruleOpt = levelRuleRepository.findAll().stream()
            .filter(r -> r.getLevelNumber() == targetLevelNumber)
            .findFirst();

        if (ruleOpt.isPresent()) {
            LegalGuideLevelRule rule = ruleOpt.get();
            int oldLevel = perf.getCurrentLevelNumber();
            
            perf.setCurrentLevelNumber(targetLevelNumber);
            perf.setCurrentLevelName(rule.getLevelName());
            perf.setDowngradeReviewRequired(false);
            perf.setLastLevelUpdatedAt(LocalDateTime.now());
            performanceProfileRepository.save(perf);

            // Log negative transaction
            LegalGuideCreditTransaction tx = new LegalGuideCreditTransaction(
                legalGuideId, null, "LEVEL_DOWNGRADED_ADMIN", -25, "Level downgraded by Admin: " + reason, adminId, "ADMIN", "ADMIN"
            );
            creditTransactionRepository.save(tx);

            guideProfileRepository.findByUserId(legalGuideId).ifPresent(profile -> {
                User user = new User(profile.getUserId(), profile.getFullName(), profile.getEmail(), com.aram.legalaid.enums.Role.HELPER);
                notificationService.create(user, "Level Update: Your performance level has been adjusted to " + rule.getLevelName() + ".", com.aram.legalaid.enums.NotificationType.IN_APP);
            });

            auditLogService.log("LEVEL_DOWNGRADED", "ADMIN_" + adminId, 
                "Guide ID " + legalGuideId + " downgraded from " + oldLevel + " to " + targetLevelNumber + ". Reason: " + reason);
        }
    }

    @Transactional
    public void manualLevelChange(Long legalGuideId, Long adminId, int targetLevelNumber, String reason) {
        LegalGuidePerformanceProfile perf = getOrCreatePerformanceProfile(legalGuideId);
        Optional<LegalGuideLevelRule> ruleOpt = levelRuleRepository.findAll().stream()
            .filter(r -> r.getLevelNumber() == targetLevelNumber)
            .findFirst();

        if (ruleOpt.isPresent()) {
            LegalGuideLevelRule rule = ruleOpt.get();
            int oldLevel = perf.getCurrentLevelNumber();
            
            perf.setCurrentLevelNumber(targetLevelNumber);
            perf.setCurrentLevelName(rule.getLevelName());
            perf.setLastLevelUpdatedAt(LocalDateTime.now());
            performanceProfileRepository.save(perf);

            auditLogService.log("MANUAL_LEVEL_CHANGE", "ADMIN_" + adminId, 
                "Guide ID " + legalGuideId + " manually changed from level " + oldLevel + " to " + targetLevelNumber + ". Reason: " + reason);
        }
    }

    public LegalGuidePerformanceProfile getOrCreatePerformanceProfile(Long legalGuideId) {
        return performanceProfileRepository.findByLegalGuideId(legalGuideId)
            .orElseGet(() -> {
                LegalGuidePerformanceProfile profile = new LegalGuidePerformanceProfile();
                profile.setLegalGuideId(legalGuideId);
                return performanceProfileRepository.save(profile);
            });
    }
}
