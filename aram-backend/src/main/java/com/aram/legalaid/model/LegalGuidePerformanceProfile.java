package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "legal_guide_performance_profiles")
public class LegalGuidePerformanceProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long legalGuideId; // References User ID of Helper

    private int currentLevelNumber = 1;
    private String currentLevelName = "Beginner Legal Guide";
    private int creditScore = 0;
    private int casesAssigned = 0;
    private int casesResolved = 0;
    private int casesConfirmedResolved = 0;
    private int casesReopened = 0;
    private double averageRating = 0.0;
    private int adminQualityScore = 0;
    private int responseTimeAvgMinutes = 0;
    private int documentRequestCount = 0;
    private int actionPlanSharedCount = 0;
    private int sensitiveCasesHandled = 0;
    private int privacyViolationCount = 0;
    private boolean downgradeReviewRequired = false;
    private LocalDateTime lastLevelUpdatedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        lastLevelUpdatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public LegalGuidePerformanceProfile() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLegalGuideId() { return legalGuideId; }
    public void setLegalGuideId(Long legalGuideId) { this.legalGuideId = legalGuideId; }

    public int getCurrentLevelNumber() { return currentLevelNumber; }
    public void setCurrentLevelNumber(int currentLevelNumber) { this.currentLevelNumber = currentLevelNumber; }

    public String getCurrentLevelName() { return currentLevelName; }
    public void setCurrentLevelName(String currentLevelName) { this.currentLevelName = currentLevelName; }

    public int getCreditScore() { return creditScore; }
    public void setCreditScore(int creditScore) { this.creditScore = creditScore; }

    public int getCasesAssigned() { return casesAssigned; }
    public void setCasesAssigned(int casesAssigned) { this.casesAssigned = casesAssigned; }

    public int getCasesResolved() { return casesResolved; }
    public void setCasesResolved(int casesResolved) { this.casesResolved = casesResolved; }

    public int getCasesConfirmedResolved() { return casesConfirmedResolved; }
    public void setCasesConfirmedResolved(int casesConfirmedResolved) { this.casesConfirmedResolved = casesConfirmedResolved; }

    public int getCasesReopened() { return casesReopened; }
    public void setCasesReopened(int casesReopened) { this.casesReopened = casesReopened; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public int getAdminQualityScore() { return adminQualityScore; }
    public void setAdminQualityScore(int adminQualityScore) { this.adminQualityScore = adminQualityScore; }

    public int getResponseTimeAvgMinutes() { return responseTimeAvgMinutes; }
    public void setResponseTimeAvgMinutes(int responseTimeAvgMinutes) { this.responseTimeAvgMinutes = responseTimeAvgMinutes; }

    public int getDocumentRequestCount() { return documentRequestCount; }
    public void setDocumentRequestCount(int documentRequestCount) { this.documentRequestCount = documentRequestCount; }

    public int getActionPlanSharedCount() { return actionPlanSharedCount; }
    public void setActionPlanSharedCount(int actionPlanSharedCount) { this.actionPlanSharedCount = actionPlanSharedCount; }

    public int getSensitiveCasesHandled() { return sensitiveCasesHandled; }
    public void setSensitiveCasesHandled(int sensitiveCasesHandled) { this.sensitiveCasesHandled = sensitiveCasesHandled; }

    public int getPrivacyViolationCount() { return privacyViolationCount; }
    public void setPrivacyViolationCount(int privacyViolationCount) { this.privacyViolationCount = privacyViolationCount; }

    public boolean isDowngradeReviewRequired() { return downgradeReviewRequired; }
    public void setDowngradeReviewRequired(boolean downgradeReviewRequired) { this.downgradeReviewRequired = downgradeReviewRequired; }

    public LocalDateTime getLastLevelUpdatedAt() { return lastLevelUpdatedAt; }
    public void setLastLevelUpdatedAt(LocalDateTime lastLevelUpdatedAt) { this.lastLevelUpdatedAt = lastLevelUpdatedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
