package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "case_outcome_reviews")
public class CaseOutcomeReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long complaintId;

    @Column(nullable = false)
    private Long legalGuideId;

    @Column(nullable = false)
    private Long reviewedByAdminId;

    private String outcomeStatus;
    private int qualityRating; // 1 to 5 or percentage
    
    @Column(columnDefinition = "TEXT")
    private String notesQuality;
    
    private boolean authorityGuidanceCorrect;
    private boolean privacyHandledCorrectly;
    private boolean actionPlanUseful;
    private boolean downgradeRecommended;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public CaseOutcomeReview() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public Long getLegalGuideId() { return legalGuideId; }
    public void setLegalGuideId(Long legalGuideId) { this.legalGuideId = legalGuideId; }

    public Long getReviewedByAdminId() { return reviewedByAdminId; }
    public void setReviewedByAdminId(Long reviewedByAdminId) { this.reviewedByAdminId = reviewedByAdminId; }

    public String getOutcomeStatus() { return outcomeStatus; }
    public void setOutcomeStatus(String outcomeStatus) { this.outcomeStatus = outcomeStatus; }

    public int getQualityRating() { return qualityRating; }
    public void setQualityRating(int qualityRating) { this.qualityRating = qualityRating; }

    public String getNotesQuality() { return notesQuality; }
    public void setNotesQuality(String notesQuality) { this.notesQuality = notesQuality; }

    public boolean isAuthorityGuidanceCorrect() { return authorityGuidanceCorrect; }
    public void setAuthorityGuidanceCorrect(boolean authorityGuidanceCorrect) { this.authorityGuidanceCorrect = authorityGuidanceCorrect; }

    public boolean isPrivacyHandledCorrectly() { return privacyHandledCorrectly; }
    public void setPrivacyHandledCorrectly(boolean privacyHandledCorrectly) { this.privacyHandledCorrectly = privacyHandledCorrectly; }

    public boolean isActionPlanUseful() { return actionPlanUseful; }
    public void setActionPlanUseful(boolean actionPlanUseful) { this.actionPlanUseful = actionPlanUseful; }

    public boolean isDowngradeRecommended() { return downgradeRecommended; }
    public void setDowngradeRecommended(boolean downgradeRecommended) { this.downgradeRecommended = downgradeRecommended; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
