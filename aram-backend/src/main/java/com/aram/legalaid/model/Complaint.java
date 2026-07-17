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
    private String description;

    @Column(nullable = false, length = 20)
    private String language;

    @Column(length = 100)
    private String district;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InputMode inputMode = InputMode.TEXT;

    @Column(columnDefinition = "TEXT")
    private String transcribedText;

    private Double transcriptionConfidence;

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

    @Column(nullable = false)
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
    private String legalOpinion;

    @Column(columnDefinition = "TEXT")
    private String authorityRemarks;

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
}
