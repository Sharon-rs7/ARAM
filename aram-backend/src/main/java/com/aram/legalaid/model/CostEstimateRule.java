package com.aram.legalaid.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cost_estimate_rules", indexes = {
        @Index(name = "idx_cost_rules_cat_auth", columnList = "category,authorityType")
})
public class CostEstimateRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 100)
    private String authorityType;

    private Integer minAmount = 0;
    private Integer maxAmount = 500;

    @Column(length = 10)
    private String currency = "INR";

    private boolean freeLegalAidAvailable = true;

    @Column(columnDefinition = "TEXT")
    private String includes;

    @Column(columnDefinition = "TEXT")
    private String excludes;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private boolean active = true;

    public CostEstimateRule() {}

    public CostEstimateRule(String category, String authorityType, Integer minAmount, Integer maxAmount, String currency, boolean freeLegalAidAvailable, String includes, String excludes, String notes) {
        this.category = category;
        this.authorityType = authorityType;
        this.minAmount = minAmount;
        this.maxAmount = maxAmount;
        this.currency = currency;
        this.freeLegalAidAvailable = freeLegalAidAvailable;
        this.includes = includes;
        this.excludes = excludes;
        this.notes = notes;
        this.active = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getAuthorityType() { return authorityType; }
    public void setAuthorityType(String authorityType) { this.authorityType = authorityType; }
    public Integer getMinAmount() { return minAmount; }
    public void setMinAmount(Integer minAmount) { this.minAmount = minAmount; }
    public Integer getMaxAmount() { return maxAmount; }
    public void setMaxAmount(Integer maxAmount) { this.maxAmount = maxAmount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public boolean isFreeLegalAidAvailable() { return freeLegalAidAvailable; }
    public void setFreeLegalAidAvailable(boolean freeLegalAidAvailable) { this.freeLegalAidAvailable = freeLegalAidAvailable; }
    public String getIncludes() { return includes; }
    public void setIncludes(String includes) { this.includes = includes; }
    public String getExcludes() { return excludes; }
    public void setExcludes(String excludes) { this.excludes = excludes; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
