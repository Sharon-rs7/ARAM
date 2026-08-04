package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "legal_guide_profiles")
public class LegalGuideProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    private String phone;
    private String gender;
    private String district;
    private String serviceAreas;
    private String languagesKnown;
    private boolean supportsTanglish;
    private boolean supportsHinglish;
    private boolean canReadTamil;
    private boolean canReadHindi;
    private String expertiseCategories;
    private int experienceYears;
    private int maxCaseCapacity;
    private int currentWorkload;
    private boolean available = true;
    private boolean womenSupportTrained;
    private String verificationStatus;

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

    public LegalGuideProfile() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getServiceAreas() { return serviceAreas; }
    public void setServiceAreas(String serviceAreas) { this.serviceAreas = serviceAreas; }

    public String getLanguagesKnown() { return languagesKnown; }
    public void setLanguagesKnown(String languagesKnown) { this.languagesKnown = languagesKnown; }

    public boolean isSupportsTanglish() { return supportsTanglish; }
    public void setSupportsTanglish(boolean supportsTanglish) { this.supportsTanglish = supportsTanglish; }

    public boolean isSupportsHinglish() { return supportsHinglish; }
    public void setSupportsHinglish(boolean supportsHinglish) { this.supportsHinglish = supportsHinglish; }

    public boolean isCanReadTamil() { return canReadTamil; }
    public void setCanReadTamil(boolean canReadTamil) { this.canReadTamil = canReadTamil; }

    public boolean isCanReadHindi() { return canReadHindi; }
    public void setCanReadHindi(boolean canReadHindi) { this.canReadHindi = canReadHindi; }

    public String getExpertiseCategories() { return expertiseCategories; }
    public void setExpertiseCategories(String expertiseCategories) { this.expertiseCategories = expertiseCategories; }

    public int getExperienceYears() { return experienceYears; }
    public void setExperienceYears(int experienceYears) { this.experienceYears = experienceYears; }

    public int getMaxCaseCapacity() { return maxCaseCapacity; }
    public void setMaxCaseCapacity(int maxCaseCapacity) { this.maxCaseCapacity = maxCaseCapacity; }

    public int getCurrentWorkload() { return currentWorkload; }
    public void setCurrentWorkload(int currentWorkload) { this.currentWorkload = currentWorkload; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public boolean isWomenSupportTrained() { return womenSupportTrained; }
    public void setWomenSupportTrained(boolean womenSupportTrained) { this.womenSupportTrained = womenSupportTrained; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
