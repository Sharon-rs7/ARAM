package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "volunteer_matching_training_samples")
public class VolunteerMatchingTrainingSample {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String problemId;

    @Column(columnDefinition = "TEXT")
    private String complaintText;

    private String languageCode;
    private String category;
    private String priority;
    private boolean sensitiveFlag;

    @Column(columnDefinition = "TEXT")
    private String requiredDocuments;

    private String recommendedAuthority;
    private boolean candidateLanguageMatch;
    private boolean candidateCategoryMatch;
    private int candidateWorkload;
    private int candidateExperienceYears;
    private int candidateCreditScore;
    private int candidateLevel;
    private boolean candidateWomenSupportTrained;
    private double matchQualityScore;

    private String sourceFileName;
    private String rowHash;
    private LocalDateTime importedAt;

    @PrePersist
    protected void onCreate() {
        importedAt = LocalDateTime.now();
    }

    public VolunteerMatchingTrainingSample() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }

    public String getComplaintText() { return complaintText; }
    public void setComplaintText(String complaintText) { this.complaintText = complaintText; }

    public String getLanguageCode() { return languageCode; }
    public void setLanguageCode(String languageCode) { this.languageCode = languageCode; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public boolean isSensitiveFlag() { return sensitiveFlag; }
    public void setSensitiveFlag(boolean sensitiveFlag) { this.sensitiveFlag = sensitiveFlag; }

    public String getRequiredDocuments() { return requiredDocuments; }
    public void setRequiredDocuments(String requiredDocuments) { this.requiredDocuments = requiredDocuments; }

    public String getRecommendedAuthority() { return recommendedAuthority; }
    public void setRecommendedAuthority(String recommendedAuthority) { this.recommendedAuthority = recommendedAuthority; }

    public boolean isCandidateLanguageMatch() { return candidateLanguageMatch; }
    public void setCandidateLanguageMatch(boolean candidateLanguageMatch) { this.candidateLanguageMatch = candidateLanguageMatch; }

    public boolean isCandidateCategoryMatch() { return candidateCategoryMatch; }
    public void setCandidateCategoryMatch(boolean candidateCategoryMatch) { this.candidateCategoryMatch = candidateCategoryMatch; }

    public int getCandidateWorkload() { return candidateWorkload; }
    public void setCandidateWorkload(int candidateWorkload) { this.candidateWorkload = candidateWorkload; }

    public int getCandidateExperienceYears() { return candidateExperienceYears; }
    public void setCandidateExperienceYears(int candidateExperienceYears) { this.candidateExperienceYears = candidateExperienceYears; }

    public int getCandidateCreditScore() { return candidateCreditScore; }
    public void setCandidateCreditScore(int candidateCreditScore) { this.candidateCreditScore = candidateCreditScore; }

    public int getCandidateLevel() { return candidateLevel; }
    public void setCandidateLevel(int candidateLevel) { this.candidateLevel = candidateLevel; }

    public boolean isCandidateWomenSupportTrained() { return candidateWomenSupportTrained; }
    public void setCandidateWomenSupportTrained(boolean candidateWomenSupportTrained) { this.candidateWomenSupportTrained = candidateWomenSupportTrained; }

    public double getMatchQualityScore() { return matchQualityScore; }
    public void setMatchQualityScore(double matchQualityScore) { this.matchQualityScore = matchQualityScore; }

    public String getSourceFileName() { return sourceFileName; }
    public void setSourceFileName(String sourceFileName) { this.sourceFileName = sourceFileName; }

    public String getRowHash() { return rowHash; }
    public void setRowHash(String rowHash) { this.rowHash = rowHash; }

    public LocalDateTime getImportedAt() { return importedAt; }
    public void setImportedAt(LocalDateTime importedAt) { this.importedAt = importedAt; }
}
