package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "case_cost_estimates", indexes = {
        @Index(name = "idx_cost_estimate_complaint", columnList = "complaintId")
})
public class CaseCostEstimate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long complaintId;

    @Column(length = 100)
    private String category;

    @Column(length = 100)
    private String authorityType;

    private Integer estimatedMinAmount = 0;
    private Integer estimatedMaxAmount = 0;

    @Column(length = 10)
    private String currency = "INR";

    @Column(length = 50)
    private String costType = "Free Legal Aid";

    private boolean freeLegalAidAvailable = true;

    @Column(columnDefinition = "TEXT")
    private String includes;

    @Column(columnDefinition = "TEXT")
    private String excludes;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 50)
    private String estimateSource = "SYSTEM"; // SYSTEM, VOLUNTEER, ADMIN

    private boolean verifiedByLegalGuide = false;
    private boolean verifiedByAdmin = false;

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
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getAuthorityType() { return authorityType; }
    public void setAuthorityType(String authorityType) { this.authorityType = authorityType; }
    public Integer getEstimatedMinAmount() { return estimatedMinAmount; }
    public void setEstimatedMinAmount(Integer estimatedMinAmount) { this.estimatedMinAmount = estimatedMinAmount; }
    public Integer getEstimatedMaxAmount() { return estimatedMaxAmount; }
    public void setEstimatedMaxAmount(Integer estimatedMaxAmount) { this.estimatedMaxAmount = estimatedMaxAmount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getCostType() { return costType; }
    public void setCostType(String costType) { this.costType = costType; }
    public boolean isFreeLegalAidAvailable() { return freeLegalAidAvailable; }
    public void setFreeLegalAidAvailable(boolean freeLegalAidAvailable) { this.freeLegalAidAvailable = freeLegalAidAvailable; }
    public String getIncludes() { return includes; }
    public void setIncludes(String includes) { this.includes = includes; }
    public String getExcludes() { return excludes; }
    public void setExcludes(String excludes) { this.excludes = excludes; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getEstimateSource() { return estimateSource; }
    public void setEstimateSource(String estimateSource) { this.estimateSource = estimateSource; }
    public boolean isVerifiedByLegalGuide() { return verifiedByLegalGuide; }
    public void setVerifiedByLegalGuide(boolean verifiedByLegalGuide) { this.verifiedByLegalGuide = verifiedByLegalGuide; }
    public boolean isVerifiedByAdmin() { return verifiedByAdmin; }
    public void setVerifiedByAdmin(boolean verifiedByAdmin) { this.verifiedByAdmin = verifiedByAdmin; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
