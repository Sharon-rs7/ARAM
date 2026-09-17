package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "guide_elo_history", indexes = {
        @Index(name = "idx_elo_history_guide", columnList = "guide_id"),
        @Index(name = "idx_elo_history_complaint", columnList = "complaint_id", unique = true)
})
public class LegalGuideEloHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guide_id", nullable = false)
    private Long guideId;

    @Column(name = "complaint_id", nullable = false, unique = true)
    private Long complaintId;

    @Column(name = "old_elo", nullable = false)
    private int oldElo;

    @Column(name = "new_elo", nullable = false)
    private int newElo;

    @Column(nullable = false)
    private int delta;

    @Column(name = "performance_score", nullable = false)
    private double performanceScore;

    @Column(length = 255)
    private String reason;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public LegalGuideEloHistory() {}

    public LegalGuideEloHistory(Long guideId, Long complaintId, int oldElo, int newElo, int delta, double performanceScore, String reason) {
        this.guideId = guideId;
        this.complaintId = complaintId;
        this.oldElo = oldElo;
        this.newElo = newElo;
        this.delta = delta;
        this.performanceScore = performanceScore;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGuideId() { return guideId; }
    public void setGuideId(Long guideId) { this.guideId = guideId; }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public int getOldElo() { return oldElo; }
    public void setOldElo(int oldElo) { this.oldElo = oldElo; }

    public int getNewElo() { return newElo; }
    public void setNewElo(int newElo) { this.newElo = newElo; }

    public int getDelta() { return delta; }
    public void setDelta(int delta) { this.delta = delta; }

    public double getPerformanceScore() { return performanceScore; }
    public void setPerformanceScore(double performanceScore) { this.performanceScore = performanceScore; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
