package com.aram.legalaid.model;

import com.aram.legalaid.enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints", indexes = {
        @Index(name = "idx_complaints_user", columnList = "user_id"),
        @Index(name = "idx_complaints_status", columnList = "status"),
        @Index(name = "idx_complaints_category", columnList = "category")
})
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_helper_id")
    private User assignedHelper;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Convert(converter = com.aram.legalaid.util.EncryptedStringConverter.class)
    private String description;

    @Column(nullable = false, length = 20)
    private String language;

    @Column(length = 100)
    private String district;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InputMode inputMode = InputMode.TEXT;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.aram.legalaid.util.EncryptedStringConverter.class)
    private String transcribedText;

    private Double transcriptionConfidence;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.aram.legalaid.util.EncryptedStringConverter.class)
    private String originalText;

    @Column(length = 50)
    private String originalLanguage;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.aram.legalaid.util.EncryptedStringConverter.class)
    private String normalizedText;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.aram.legalaid.util.EncryptedStringConverter.class)
    private String translatedText;

    @Column(nullable = false)
    private boolean voiceInputUsed = false;

    private Double voiceTranscriptConfidence;

    @Column(length = 50)
    private String inputLanguage;

    @Column(length = 50)
    private String detectedLanguage;

    private Double languageConfidence;

    @Column(nullable = false)
    private boolean transcriptConfirmed = false;

    @Column(length = 50)
    private String preferredResponseLanguage;

    @Enumerated(EnumType.STRING)
    @Column(length = 60)
    private ComplaintCategory category;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PriorityLevel priority;

    private Integer priorityScore;

    @Column(length = 150)
    private String authority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ComplaintStatus status = ComplaintStatus.SUBMITTED;

    @Column(name = "sensitivity_flag", nullable = false)
    private boolean sensitive = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HelperGender preferredHelperGender = HelperGender.ANY;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IdentityVisibility identityVisibility = IdentityVisibility.VISIBLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_advocate_id")
    private User referredAdvocate;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.aram.legalaid.util.EncryptedStringConverter.class)
    private String legalOpinion;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.aram.legalaid.util.EncryptedStringConverter.class)
    private String authorityRemarks;

    @Column(nullable = false)
    private boolean womenSensitive = false;

    @Column(length = 50)
    private String safeContactMethod = "APP";

    @Column(length = 100)
    private String safeContactTime = "ANYTIME";

    @Column(nullable = false)
    private boolean highRisk = false;

    @Column(nullable = false)
    private boolean disclaimerAccepted = false;

    private LocalDateTime disclaimerAcceptedAt;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.aram.legalaid.util.EncryptedStringConverter.class)
    private String resolutionSummary;

    @Column(columnDefinition = "TEXT")
    private String reopenReason;

    @Column(columnDefinition = "TEXT")
    private String assignmentOverrideReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public User getAssignedHelper() { return assignedHelper; }
    public void setAssignedHelper(User assignedHelper) { this.assignedHelper = assignedHelper; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public InputMode getInputMode() { return inputMode; }
    public void setInputMode(InputMode inputMode) { this.inputMode = inputMode; }
    public String getTranscribedText() { return transcribedText; }
    public void setTranscribedText(String transcribedText) { this.transcribedText = transcribedText; }
    public Double getTranscriptionConfidence() { return transcriptionConfidence; }
    public void setTranscriptionConfidence(Double transcriptionConfidence) { this.transcriptionConfidence = transcriptionConfidence; }
    public ComplaintCategory getCategory() { return category; }
    public void setCategory(ComplaintCategory category) { this.category = category; }
    public PriorityLevel getPriority() { return priority; }
    public void setPriority(PriorityLevel priority) { this.priority = priority; }
    public Integer getPriorityScore() { return priorityScore; }
    public void setPriorityScore(Integer priorityScore) { this.priorityScore = priorityScore; }
    public String getAuthority() { return authority; }
    public void setAuthority(String authority) { this.authority = authority; }
    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }
    public boolean isSensitive() { return sensitive; }
    public void setSensitive(boolean sensitive) { this.sensitive = sensitive; }
    public HelperGender getPreferredHelperGender() { return preferredHelperGender; }
    public void setPreferredHelperGender(HelperGender preferredHelperGender) { this.preferredHelperGender = preferredHelperGender; }
    public IdentityVisibility getIdentityVisibility() { return identityVisibility; }
    public void setIdentityVisibility(IdentityVisibility identityVisibility) { this.identityVisibility = identityVisibility; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public User getReferredAdvocate() { return referredAdvocate; }
    public void setReferredAdvocate(User referredAdvocate) { this.referredAdvocate = referredAdvocate; }
    public String getLegalOpinion() { return legalOpinion; }
    public void setLegalOpinion(String legalOpinion) { this.legalOpinion = legalOpinion; }
    public String getAuthorityRemarks() { return authorityRemarks; }
    public void setAuthorityRemarks(String authorityRemarks) { this.authorityRemarks = authorityRemarks; }

    public String getOriginalText() { return originalText; }
    public void setOriginalText(String originalText) { this.originalText = originalText; }
    public String getOriginalLanguage() { return originalLanguage; }
    public void setOriginalLanguage(String originalLanguage) { this.originalLanguage = originalLanguage; }
    
    public String getInputLanguage() { return inputLanguage; }
    public void setInputLanguage(String inputLanguage) { this.inputLanguage = inputLanguage; }
    
    public String getDetectedLanguage() { return detectedLanguage; }
    public void setDetectedLanguage(String detectedLanguage) { this.detectedLanguage = detectedLanguage; }
    
    public Double getLanguageConfidence() { return languageConfidence; }
    public void setLanguageConfidence(Double languageConfidence) { this.languageConfidence = languageConfidence; }
    
    public boolean isTranscriptConfirmed() { return transcriptConfirmed; }
    public void setTranscriptConfirmed(boolean transcriptConfirmed) { this.transcriptConfirmed = transcriptConfirmed; }

    public String getNormalizedText() { return normalizedText; }
    public void setNormalizedText(String normalizedText) { this.normalizedText = normalizedText; }
    public String getTranslatedText() { return translatedText; }
    public void setTranslatedText(String translatedText) { this.translatedText = translatedText; }
    public boolean isVoiceInputUsed() { return voiceInputUsed; }
    public void setVoiceInputUsed(boolean voiceInputUsed) { this.voiceInputUsed = voiceInputUsed; }
    public Double getVoiceTranscriptConfidence() { return voiceTranscriptConfidence; }
    public void setVoiceTranscriptConfidence(Double voiceTranscriptConfidence) { this.voiceTranscriptConfidence = voiceTranscriptConfidence; }
    public String getPreferredResponseLanguage() { return preferredResponseLanguage; }
    public void setPreferredResponseLanguage(String preferredResponseLanguage) { this.preferredResponseLanguage = preferredResponseLanguage; }

    public boolean isWomenSensitive() { return womenSensitive; }
    public void setWomenSensitive(boolean womenSensitive) { this.womenSensitive = womenSensitive; }
    public String getSafeContactMethod() { return safeContactMethod; }
    public void setSafeContactMethod(String safeContactMethod) { this.safeContactMethod = safeContactMethod; }
    public String getSafeContactTime() { return safeContactTime; }
    public void setSafeContactTime(String safeContactTime) { this.safeContactTime = safeContactTime; }
    public String getAssignmentOverrideReason() { return assignmentOverrideReason; }
    public void setAssignmentOverrideReason(String assignmentOverrideReason) { this.assignmentOverrideReason = assignmentOverrideReason; }

    public boolean isHighRisk() { return highRisk; }
    public void setHighRisk(boolean highRisk) { this.highRisk = highRisk; }
    public boolean isDisclaimerAccepted() { return disclaimerAccepted; }
    public void setDisclaimerAccepted(boolean disclaimerAccepted) { this.disclaimerAccepted = disclaimerAccepted; }
    public LocalDateTime getDisclaimerAcceptedAt() { return disclaimerAcceptedAt; }
    public void setDisclaimerAcceptedAt(LocalDateTime disclaimerAcceptedAt) { this.disclaimerAcceptedAt = disclaimerAcceptedAt; }
    public String getResolutionSummary() { return resolutionSummary; }
    public void setResolutionSummary(String resolutionSummary) { this.resolutionSummary = resolutionSummary; }
    public String getReopenReason() { return reopenReason; }
    public void setReopenReason(String reopenReason) { this.reopenReason = reopenReason; }
}
