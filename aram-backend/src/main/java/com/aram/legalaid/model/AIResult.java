package com.aram.legalaid.model;

import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.PriorityLevel;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_results", indexes = {
        @Index(name = "idx_ai_results_complaint", columnList = "complaint_id")
})
public class AIResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "complaint_id", nullable = false, unique = true)
    private Complaint complaint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private ComplaintCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PriorityLevel priority;

    @Column(nullable = false)
    private Integer priorityScore;

    @Column(nullable = false)
    private Double confidence;

    @Column(nullable = false, length = 150)
    private String recommendedAuthority;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String requiredDocuments;

    @Column(columnDefinition = "TEXT")
    private String nextSteps;

    @Column(nullable = false)
    private boolean manualReviewRequired;

    @Column(length = 50)
    private String detectedLanguage;

    @Column(columnDefinition = "TEXT")
    private String normalizedText;

    private Double languageConfidence;

    @Column(length = 50)
    private String responseLanguage;

    private Boolean authorityLanguageMatch;

    @Column(columnDefinition = "TEXT")
    private String translatedSummary;

    @Column(columnDefinition = "TEXT")
    private String spokenSummaryText;

    @Column(nullable = false)
    private boolean readAloudAvailable = false;

    @Column(length = 50)
    private String modelVersion;

    @Column(columnDefinition = "TEXT")
    private String detectedIssues;

    @Column(length = 50)
    private String complexity;

    @Column(nullable = false)
    private boolean fallbackUsed = false;

    @Column(name = "case_summary", columnDefinition = "TEXT")
    private String caseSummary;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (authorityLanguageMatch == null) {
            authorityLanguageMatch = Boolean.TRUE;
        }
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }
    public ComplaintCategory getCategory() { return category; }
    public void setCategory(ComplaintCategory category) { this.category = category; }
    public PriorityLevel getPriority() { return priority; }
    public void setPriority(PriorityLevel priority) { this.priority = priority; }
    public Integer getPriorityScore() { return priorityScore; }
    public void setPriorityScore(Integer priorityScore) { this.priorityScore = priorityScore; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    public String getRecommendedAuthority() { return recommendedAuthority; }
    public void setRecommendedAuthority(String recommendedAuthority) { this.recommendedAuthority = recommendedAuthority; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getRequiredDocuments() { return requiredDocuments; }
    public void setRequiredDocuments(String requiredDocuments) { this.requiredDocuments = requiredDocuments; }
    public String getNextSteps() { return nextSteps; }
    public void setNextSteps(String nextSteps) { this.nextSteps = nextSteps; }
    public boolean isManualReviewRequired() { return manualReviewRequired; }
    public void setManualReviewRequired(boolean manualReviewRequired) { this.manualReviewRequired = manualReviewRequired; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    
    public boolean isFallbackUsed() { return fallbackUsed; }
    public void setFallbackUsed(boolean fallbackUsed) { this.fallbackUsed = fallbackUsed; }

    public String getDetectedLanguage() { return detectedLanguage; }
    public void setDetectedLanguage(String detectedLanguage) { this.detectedLanguage = detectedLanguage; }
    public String getTranslatedSummary() { return translatedSummary; }
    public void setTranslatedSummary(String translatedSummary) { this.translatedSummary = translatedSummary; }
    public String getSpokenSummaryText() { return spokenSummaryText; }
    public void setSpokenSummaryText(String spokenSummaryText) { this.spokenSummaryText = spokenSummaryText; }
    public boolean isReadAloudAvailable() { return readAloudAvailable; }
    public void setReadAloudAvailable(boolean readAloudAvailable) { this.readAloudAvailable = readAloudAvailable; }

    public String getNormalizedText() { return normalizedText; }
    public void setNormalizedText(String normalizedText) { this.normalizedText = normalizedText; }

    public Double getLanguageConfidence() { return languageConfidence; }
    public void setLanguageConfidence(Double languageConfidence) { this.languageConfidence = languageConfidence; }

    public String getResponseLanguage() { return responseLanguage; }
    public void setResponseLanguage(String responseLanguage) { this.responseLanguage = responseLanguage; }

    public Boolean getAuthorityLanguageMatch() { return authorityLanguageMatch; }
    public void setAuthorityLanguageMatch(Boolean authorityLanguageMatch) { this.authorityLanguageMatch = authorityLanguageMatch; }

    public String getDetectedIssues() { return detectedIssues; }
    public void setDetectedIssues(String detectedIssues) { this.detectedIssues = detectedIssues; }

    public String getComplexity() { return complexity; }
    public void setComplexity(String complexity) { this.complexity = complexity; }

    public String getCaseSummary() { return caseSummary; }
    public void setCaseSummary(String caseSummary) { this.caseSummary = caseSummary; }
}
