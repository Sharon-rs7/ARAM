package com.aram.legalaid.model;

import com.aram.legalaid.enums.ComplaintCategory;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "case_action_plans", indexes = {
        @Index(name = "idx_action_plan_complaint", columnList = "complaintId"),
        @Index(name = "idx_action_plan_helper", columnList = "legalGuideId")
})
public class CaseActionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long complaintId;

    @Column(nullable = false)
    private Long legalGuideId;

    private Long adminId;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.aram.legalaid.util.EncryptedStringConverter.class)
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String immediateSteps; // Newline-separated steps

    @Column(columnDefinition = "TEXT")
    private String documentChecklist; // Newline-separated required document names

    private String recommendedAuthorityName;

    @Enumerated(EnumType.STRING)
    @Column(length = 60)
    private ComplaintCategory authorityCategory;

    private boolean visitRequired = false;
    private boolean onlineSubmissionAvailable = false;
    private String expectedTimeline;
    private String safetyNote;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.aram.legalaid.util.EncryptedStringConverter.class)
    private String legalGuideNote;

    @Column(nullable = false, length = 20)
    private String status = "DRAFT"; // DRAFT, SHARED, UPDATED, COMPLETED

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public CaseActionPlan() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public Long getLegalGuideId() { return legalGuideId; }
    public void setLegalGuideId(Long legalGuideId) { this.legalGuideId = legalGuideId; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getImmediateSteps() { return immediateSteps; }
    public void setImmediateSteps(String immediateSteps) { this.immediateSteps = immediateSteps; }

    public String getDocumentChecklist() { return documentChecklist; }
    public void setDocumentChecklist(String documentChecklist) { this.documentChecklist = documentChecklist; }

    public String getRecommendedAuthorityName() { return recommendedAuthorityName; }
    public void setRecommendedAuthorityName(String recommendedAuthorityName) { this.recommendedAuthorityName = recommendedAuthorityName; }

    public ComplaintCategory getAuthorityCategory() { return authorityCategory; }
    public void setAuthorityCategory(ComplaintCategory authorityCategory) { this.authorityCategory = authorityCategory; }

    public boolean isVisitRequired() { return visitRequired; }
    public void setVisitRequired(boolean visitRequired) { this.visitRequired = visitRequired; }

    public boolean isOnlineSubmissionAvailable() { return onlineSubmissionAvailable; }
    public void setOnlineSubmissionAvailable(boolean onlineSubmissionAvailable) { this.onlineSubmissionAvailable = onlineSubmissionAvailable; }

    public String getExpectedTimeline() { return expectedTimeline; }
    public void setExpectedTimeline(String expectedTimeline) { this.expectedTimeline = expectedTimeline; }

    public String getSafetyNote() { return safetyNote; }
    public void setSafetyNote(String safetyNote) { this.safetyNote = safetyNote; }

    public String getLegalGuideNote() { return legalGuideNote; }
    public void setLegalGuideNote(String legalGuideNote) { this.legalGuideNote = legalGuideNote; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
