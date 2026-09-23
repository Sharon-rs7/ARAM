package com.aram.legalaid.unit.service;

import com.aram.legalaid.enums.*;
import com.aram.legalaid.model.*;
import com.aram.legalaid.repository.*;
import com.aram.legalaid.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("test")
@Transactional
public class LegalGuidePerformanceServiceTest {

    @Autowired
    private AdditionalFlowsService additionalFlowsService;

    @Autowired
    private LegalGuideLevelService levelService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private LegalGuidePerformanceProfileRepository performanceProfileRepository;

    @Autowired
    private LegalGuideEloHistoryRepository eloHistoryRepository;

    @Autowired
    private AIResultRepository aiResultRepository;

    @MockBean
    private AIClientService aiClientService;

    private User helperUser;
    private User citizenUser;
    private Complaint sampleComplaint;

    @BeforeEach
    void setUp() {
        // Find or create test users
        helperUser = userRepository.findByEmail("volunteer@aram.ai")
                .orElseGet(() -> {
                    User u = new User();
                    u.setName("Helper User");
                    u.setEmail("volunteer@aram.ai");
                    u.setMobile("9999999997");
                    u.setPasswordHash("$2a$10$UnSampleHashForTesting");
                    u.setRole(Role.HELPER);
                    u.setStatus(UserStatus.ACTIVE);
                    return userRepository.save(u);
                });

        citizenUser = userRepository.findByEmail("citizen@aram.ai")
                .orElseGet(() -> {
                    User u = new User();
                    u.setName("Citizen User");
                    u.setEmail("citizen@aram.ai");
                    u.setMobile("9999999996");
                    u.setPasswordHash("$2a$10$UnSampleHashForTesting");
                    u.setRole(Role.CITIZEN);
                    u.setStatus(UserStatus.ACTIVE);
                    return userRepository.save(u);
                });

        // Create Complaint
        sampleComplaint = new Complaint();
        sampleComplaint.setTitle("Sample Labour Dispute");
        sampleComplaint.setDescription("Unresolved labour payment issues.");
        sampleComplaint.setCategory(ComplaintCategory.LABOUR_DISPUTE);
        sampleComplaint.setPriority(PriorityLevel.MEDIUM);
        sampleComplaint.setStatus(ComplaintStatus.HELPER_ASSIGNED);
        sampleComplaint.setUser(citizenUser);
        sampleComplaint.setAssignedHelper(helperUser);
        sampleComplaint.setAssignedAt(LocalDateTime.now().minusHours(24)); // 24 hours ago
        sampleComplaint.setResolvedAt(LocalDateTime.now());
        sampleComplaint = complaintRepository.save(sampleComplaint);

        // Add AIResult with complexity
        AIResult aiResult = new AIResult();
        aiResult.setComplaint(sampleComplaint);
        aiResult.setCategory(ComplaintCategory.LABOUR_DISPUTE);
        aiResult.setPriority(PriorityLevel.MEDIUM);
        aiResult.setPriorityScore(50);
        aiResult.setConfidence(0.9);
        aiResult.setComplexity("MEDIUM");
        aiResult.setReason("Standard labour dispute");
        aiResult.setRecommendedAuthority("Labour Board");
        aiResult.setAuthorityLanguageMatch(false);
        aiResult.setReadAloudAvailable(false);
        aiResultRepository.save(aiResult);
    }

    @Test
    @DisplayName("TEST 1: New Guide starts at ELO 1000 and default values")
    void testEloInitialization() {
        LegalGuidePerformanceProfile profile = levelService.getOrCreatePerformanceProfile(helperUser.getId());
        assertEquals(1000, profile.getEloRating());
        assertEquals(0.5, profile.getReputationScore());
        assertEquals(0, profile.getCompletedCases());
        assertEquals(1.0, profile.getDeadlineSuccessRate());
    }

    @Test
    @DisplayName("TEST 2 & TEST 3: ELO updates once upon case resolution and is idempotent")
    void testEloUpdateAndIdempotency() {
        // Complete the case
        additionalFlowsService.updateReputationAndElo(sampleComplaint.getId(), 5, "Excellent work");

        LegalGuidePerformanceProfile profile = levelService.getOrCreatePerformanceProfile(helperUser.getId());
        int firstElo = profile.getEloRating();
        
        // ELO should be updated
        assertNotEquals(1000, firstElo);
        Optional<LegalGuideEloHistory> historyOpt = eloHistoryRepository.findByComplaintId(sampleComplaint.getId());
        assertTrue(historyOpt.isPresent());
        assertEquals(firstElo, historyOpt.get().getNewElo());

        // Run again -> Idempotent check
        additionalFlowsService.updateReputationAndElo(sampleComplaint.getId(), 5, "Duplicate review");
        
        // ELO must remain unchanged
        LegalGuidePerformanceProfile profile2 = levelService.getOrCreatePerformanceProfile(helperUser.getId());
        assertEquals(firstElo, profile2.getEloRating());
    }

    @Test
    @DisplayName("TEST 4: Complex case contributes appropriately with complexity multipliers")
    void testComplexCaseEloImpact() {
        // Set case complexity to CRITICAL
        AIResult res = aiResultRepository.findByComplaint(sampleComplaint).get();
        res.setComplexity("CRITICAL");
        aiResultRepository.save(res);

        additionalFlowsService.updateReputationAndElo(sampleComplaint.getId(), 5, "Superb handling of critical case");

        LegalGuidePerformanceProfile profile = levelService.getOrCreatePerformanceProfile(helperUser.getId());
        int eloRating = profile.getEloRating();
        
        // ELO delta should be larger for critical cases
        assertTrue(eloRating > 1000);
        Optional<LegalGuideEloHistory> historyOpt = eloHistoryRepository.findByComplaintId(sampleComplaint.getId());
        assertTrue(historyOpt.get().getDelta() > 0);
    }

    @Test
    @DisplayName("TEST 5 & TEST 7: Fast resolution and high citizen rating improves performance appropriately")
    void testFastResolutionHighFeedbackRating() {
        additionalFlowsService.updateReputationAndElo(sampleComplaint.getId(), 5, "Quick and helpful");

        LegalGuidePerformanceProfile profile = levelService.getOrCreatePerformanceProfile(helperUser.getId());
        
        System.out.println("=================================================");
        System.out.println("DEBUG ELO RATING: " + profile.getEloRating());
        System.out.println("DEBUG REPUTATION SCORE: " + profile.getReputationScore());
        System.out.println("DEBUG DEADLINE SUCCESS RATE: " + profile.getDeadlineSuccessRate());
        System.out.println("DEBUG AVERAGE RATING: " + profile.getAverageRating());
        System.out.println("=================================================");

        assertTrue(profile.getEloRating() > 1000);
        assertTrue(profile.getReputationScore() > 0.25);
        assertEquals(1.0, profile.getDeadlineSuccessRate());
        assertEquals(5.0, profile.getAverageRating());
    }

    @Test
    @DisplayName("TEST 6: Reopened cases negatively affect performance metrics")
    void testReopenedCasePerformanceScore() {
        // Simulate a case being reopened
        LegalGuidePerformanceProfile profile = levelService.getOrCreatePerformanceProfile(helperUser.getId());
        profile.setCasesAssigned(5);
        profile.setCasesReopened(2);
        performanceProfileRepository.save(profile);

        additionalFlowsService.updateReputationAndElo(sampleComplaint.getId(), 3, "Decent support");

        LegalGuidePerformanceProfile updatedProfile = levelService.getOrCreatePerformanceProfile(helperUser.getId());
        
        // Reopen rate is 2/5 = 40%, so ELO update should be penalised/lower
        Optional<LegalGuideEloHistory> historyOpt = eloHistoryRepository.findByComplaintId(sampleComplaint.getId());
        assertTrue(historyOpt.isPresent());
        assertTrue(historyOpt.get().getPerformanceScore() < 0.8);
    }

    @Test
    @DisplayName("TEST 9: No feedback does not create fake feedback counts")
    void testNoFeedbackNoFabrication() {
        additionalFlowsService.updateReputationAndElo(sampleComplaint.getId(), null, "No feedback");

        LegalGuidePerformanceProfile profile = levelService.getOrCreatePerformanceProfile(helperUser.getId());
        assertEquals(0, profile.getFeedbackCount());
        assertEquals(0.0, profile.getAverageRating());
        assertEquals(1, profile.getCompletedCases());
    }

    @Test
    @DisplayName("TEST 10: XP system remains unaffected")
    void testXpSystemCompatibility() {
        LegalGuidePerformanceProfile profileBefore = levelService.getOrCreatePerformanceProfile(helperUser.getId());
        int creditBefore = profileBefore.getCreditScore();
        int levelBefore = profileBefore.getCurrentLevelNumber();

        // Trigger ELO update
        additionalFlowsService.updateReputationAndElo(sampleComplaint.getId(), 5, "Great");

        LegalGuidePerformanceProfile profileAfter = levelService.getOrCreatePerformanceProfile(helperUser.getId());
        assertEquals(creditBefore, profileAfter.getCreditScore());
        assertEquals(levelBefore, profileAfter.getCurrentLevelNumber());
    }
}
