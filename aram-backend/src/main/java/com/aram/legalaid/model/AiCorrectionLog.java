package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_correction_logs")
public class AiCorrectionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long complaintId;

    @Column(length = 50)
    private String modelVersion;

    @Column(length = 60)
    private String originalCategory;

    @Column(length = 60)
    private String correctedCategory;

    @Column(length = 20)
    private String originalPriority;

    @Column(length = 20)
    private String correctedPriority;

    @Column(length = 150)
    private String originalAuthority;

    @Column(length = 150)
    private String correctedAuthority;

    @Column(columnDefinition = "TEXT")
    private String correctionReason;

    private Long correctedByAdminId;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    public String getOriginalCategory() { return originalCategory; }
    public void setOriginalCategory(String originalCategory) { this.originalCategory = originalCategory; }
    public String getCorrectedCategory() { return correctedCategory; }
    public void setCorrectedCategory(String correctedCategory) { this.correctedCategory = correctedCategory; }
    public String getOriginalPriority() { return originalPriority; }
    public void setOriginalPriority(String originalPriority) { this.originalPriority = originalPriority; }
    public String getCorrectedPriority() { return correctedPriority; }
    public void setCorrectedPriority(String correctedPriority) { this.correctedPriority = correctedPriority; }
    public String getOriginalAuthority() { return originalAuthority; }
    public void setOriginalAuthority(String originalAuthority) { this.originalAuthority = originalAuthority; }
    public String getCorrectedAuthority() { return correctedAuthority; }
    public void setCorrectedAuthority(String correctedAuthority) { this.correctedAuthority = correctedAuthority; }
    public String getCorrectionReason() { return correctionReason; }
    public void setCorrectionReason(String correctionReason) { this.correctionReason = correctionReason; }
    public Long getCorrectedByAdminId() { return correctedByAdminId; }
    public void setCorrectedByAdminId(Long correctedByAdminId) { this.correctedByAdminId = correctedByAdminId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
