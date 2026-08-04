package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "guide_assignment_decision_logs")
public class GuideAssignmentDecisionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long complaintId;

    private Long recommendedGuideId;

    @Column(nullable = false)
    private Long assignedGuideId;

    @Column(nullable = false)
    private Long adminId;

    private double recommendationScore;
    private String modelVersion;
    
    @Column(columnDefinition = "TEXT")
    private String overrideReason;
    
    private String finalOutcome;
    private Integer userRating;
    private boolean reopened = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public GuideAssignmentDecisionLog() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public Long getRecommendedGuideId() { return recommendedGuideId; }
    public void setRecommendedGuideId(Long recommendedGuideId) { this.recommendedGuideId = recommendedGuideId; }

    public Long getAssignedGuideId() { return assignedGuideId; }
    public void setAssignedGuideId(Long assignedGuideId) { this.assignedGuideId = assignedGuideId; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

    public double getRecommendationScore() { return recommendationScore; }
    public void setRecommendationScore(double recommendationScore) { this.recommendationScore = recommendationScore; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }

    public String getFinalOutcome() { return finalOutcome; }
    public void setFinalOutcome(String finalOutcome) { this.finalOutcome = finalOutcome; }

    public Integer getUserRating() { return userRating; }
    public void setUserRating(Integer userRating) { this.userRating = userRating; }

    public boolean isReopened() { return reopened; }
    public void setReopened(boolean reopened) { this.reopened = reopened; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
