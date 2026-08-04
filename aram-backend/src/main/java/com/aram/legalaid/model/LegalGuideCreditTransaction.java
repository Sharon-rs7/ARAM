package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "legal_guide_credit_transactions")
public class LegalGuideCreditTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long legalGuideId; // References User ID of Helper

    private Long complaintId;
    
    @Column(nullable = false)
    private String transactionType; // e.g. CASE_REVIEWED, PRIVACY_VIOLATION
    
    private int points;
    private String reason;
    private Long awardedByUserId;
    private String awardedByRole;
    private String source; // SYSTEM / ADMIN / USER_FEEDBACK

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public LegalGuideCreditTransaction() {}

    public LegalGuideCreditTransaction(Long legalGuideId, Long complaintId, String transactionType, int points, String reason, Long awardedByUserId, String awardedByRole, String source) {
        this.legalGuideId = legalGuideId;
        this.complaintId = complaintId;
        this.transactionType = transactionType;
        this.points = points;
        this.reason = reason;
        this.awardedByUserId = awardedByUserId;
        this.awardedByRole = awardedByRole;
        this.source = source;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLegalGuideId() { return legalGuideId; }
    public void setLegalGuideId(Long legalGuideId) { this.legalGuideId = legalGuideId; }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Long getAwardedByUserId() { return awardedByUserId; }
    public void setAwardedByUserId(Long awardedByUserId) { this.awardedByUserId = awardedByUserId; }

    public String getAwardedByRole() { return awardedByRole; }
    public void setAwardedByRole(String awardedByRole) { this.awardedByRole = awardedByRole; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
