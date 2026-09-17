package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "volunteer_self_evaluations", indexes = {
        @Index(name = "idx_vse_complaint", columnList = "complaintId"),
        @Index(name = "idx_vse_volunteer", columnList = "volunteerId")
})
public class VolunteerSelfEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long complaintId;

    @Column(nullable = false)
    private Long volunteerId;

    @Column(length = 30)
    private String caseDifficulty; // EASY, MODERATE, COMPLEX, CRITICAL

    private Integer confidenceLevel; // 1 to 5

    private Double timeSpentHours;

    @Column(columnDefinition = "TEXT")
    private String challengesFaced;

    private Integer aiUsefulnessRating; // 1 to 5

    @Column(length = 30)
    private String communicationDifficulty; // SMOOTH, AVERAGE, CHALLENGING

    @Column(length = 50)
    private String caseOutcome; // RESOLVED_SATISFACTORILY, REFERRED_TO_AUTHORITY, ESCALATED_LEGAL_ACTION, CITIZEN_DROPPED

    @Column(columnDefinition = "TEXT")
    private String lessonsLearned;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public VolunteerSelfEvaluation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public Long getVolunteerId() { return volunteerId; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }

    public String getCaseDifficulty() { return caseDifficulty; }
    public void setCaseDifficulty(String caseDifficulty) { this.caseDifficulty = caseDifficulty; }

    public Integer getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(Integer confidenceLevel) { this.confidenceLevel = confidenceLevel; }

    public Double getTimeSpentHours() { return timeSpentHours; }
    public void setTimeSpentHours(Double timeSpentHours) { this.timeSpentHours = timeSpentHours; }

    public String getChallengesFaced() { return challengesFaced; }
    public void setChallengesFaced(String challengesFaced) { this.challengesFaced = challengesFaced; }

    public Integer getAiUsefulnessRating() { return aiUsefulnessRating; }
    public void setAiUsefulnessRating(Integer aiUsefulnessRating) { this.aiUsefulnessRating = aiUsefulnessRating; }

    public String getCommunicationDifficulty() { return communicationDifficulty; }
    public void setCommunicationDifficulty(String communicationDifficulty) { this.communicationDifficulty = communicationDifficulty; }

    public String getCaseOutcome() { return caseOutcome; }
    public void setCaseOutcome(String caseOutcome) { this.caseOutcome = caseOutcome; }

    public String getLessonsLearned() { return lessonsLearned; }
    public void setLessonsLearned(String lessonsLearned) { this.lessonsLearned = lessonsLearned; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
