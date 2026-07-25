package com.aram.legalaid.model;

import jakarta.persistence.*;

@Entity
@Table(name = "legal_problem_templates", indexes = {
    @Index(name = "idx_problem_id", columnList = "problemId"),
    @Index(name = "idx_problem_category", columnList = "category")
})
public class LegalProblemTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String problemId;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 150)
    private String subcategory;

    @Column(length = 20)
    private String priorityCode;

    @Column(length = 100)
    private String priorityName;

    @Column(columnDefinition = "TEXT")
    private String requiredDocuments; // Comma-separated list of documents

    @Column(length = 150)
    private String recommendedAuthority;

    @Column(columnDefinition = "TEXT")
    private String nextSteps; // Semicolon-separated list of steps

    private boolean womenSensitive;

    @Column(length = 50)
    private String preferredVolunteerGenderRule;

    @Column(columnDefinition = "TEXT")
    private String disclaimer;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }

    public String getPriorityCode() { return priorityCode; }
    public void setPriorityCode(String priorityCode) { this.priorityCode = priorityCode; }

    public String getPriorityName() { return priorityName; }
    public void setPriorityName(String priorityName) { this.priorityName = priorityName; }

    public String getRequiredDocuments() { return requiredDocuments; }
    public void setRequiredDocuments(String requiredDocuments) { this.requiredDocuments = requiredDocuments; }

    public String getRecommendedAuthority() { return recommendedAuthority; }
    public void setRecommendedAuthority(String recommendedAuthority) { this.recommendedAuthority = recommendedAuthority; }

    public String getNextSteps() { return nextSteps; }
    public void setNextSteps(String nextSteps) { this.nextSteps = nextSteps; }

    public boolean isWomenSensitive() { return womenSensitive; }
    public void setWomenSensitive(boolean womenSensitive) { this.womenSensitive = womenSensitive; }

    public String getPreferredVolunteerGenderRule() { return preferredVolunteerGenderRule; }
    public void setPreferredVolunteerGenderRule(String preferredVolunteerGenderRule) { this.preferredVolunteerGenderRule = preferredVolunteerGenderRule; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
