package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "legal_guide_level_rules")
public class LegalGuideLevelRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int levelNumber;
    private String levelName;
    private int minCreditScore;
    private int maxCreditScore;
    private String badgeName;
    private double assignmentWeight = 1.0;
    private boolean active = true;

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

    public LegalGuideLevelRule() {}

    public LegalGuideLevelRule(int levelNumber, String levelName, int minCreditScore, int maxCreditScore, String badgeName, double assignmentWeight) {
        this.levelNumber = levelNumber;
        this.levelName = levelName;
        this.minCreditScore = minCreditScore;
        this.maxCreditScore = maxCreditScore;
        this.badgeName = badgeName;
        this.assignmentWeight = assignmentWeight;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getLevelNumber() { return levelNumber; }
    public void setLevelNumber(int levelNumber) { this.levelNumber = levelNumber; }

    public String getLevelName() { return levelName; }
    public void setLevelName(String levelName) { this.levelName = levelName; }

    public int getMinCreditScore() { return minCreditScore; }
    public void setMinCreditScore(int minCreditScore) { this.minCreditScore = minCreditScore; }

    public int getMaxCreditScore() { return maxCreditScore; }
    public void setMaxCreditScore(int maxCreditScore) { this.maxCreditScore = maxCreditScore; }

    public String getBadgeName() { return badgeName; }
    public void setBadgeName(String badgeName) { this.badgeName = badgeName; }

    public double getAssignmentWeight() { return assignmentWeight; }
    public void setAssignmentWeight(double assignmentWeight) { this.assignmentWeight = assignmentWeight; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
