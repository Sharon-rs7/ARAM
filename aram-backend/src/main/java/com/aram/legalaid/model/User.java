package com.aram.legalaid.model;

import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.ThemePreference;
import com.aram.legalaid.enums.UserStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email"),
        @Index(name = "idx_users_mobile", columnList = "mobile")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, unique = true, length = 10)
    private String mobile;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.CITIZEN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(length = 20)
    private String gender;

    @Column(length = 100)
    private String specialization;

    @Column(nullable = false)
    private boolean helperVerified = false;

    @Column(length = 500)
    private String avatarUrl;

    @Column(length = 500)
    private String bio;

    @Column(length = 100)
    private String district;

    @Column(length = 500)
    private String address;

    @Column(length = 40)
    private String preferredLanguage;

    @Column(length = 250)
    private String languagesKnown;

    @Column(length = 250)
    private String specializationCategories;

    @Column(nullable = false)
    private int maxActiveCases = 5;

    @Column(nullable = false)
    private int currentActiveCases = 0;

    @Column(length = 50)
    private String availabilityStatus = "AVAILABLE";

    @Column(nullable = false)
    private boolean womenSupportTrained = false;

    @Column(nullable = false)
    private boolean forcePasswordChange = false;

    @Column(length = 250)
    private String serviceArea;

    @Column(length = 250)
    private String subSpecializations;

    @Column(length = 50)
    private String experienceLevel;

    @Column(nullable = false)
    private boolean canHandleSensitiveCases = false;

    @Column(nullable = false)
    private boolean supportsTanglish = false;

    @Column(nullable = false)
    private boolean supportsHinglish = false;

    @Column(nullable = false)
    private boolean canReadTamil = false;

    @Column(nullable = false)
    private boolean canReadHindi = false;

    @Column(nullable = false)
    private boolean voiceAssistanceEnabled = false;

    @Column(nullable = false)
    private boolean profileCompleted = false;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 100)
    private String state;

    @Column(length = 20)
    private String pincode;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "mobile_verified", nullable = false)
    private boolean mobileVerified = true;

    @Column(name = "whatsapp_opt_in", nullable = false)
    private boolean whatsappOptIn = true;

    @Column(name = "profile_completion_percentage", nullable = false)
    private int profileCompletionPercentage = 0;

    @Column(nullable = false)
    private boolean simpleModeEnabled = false;

    @Column(nullable = false)
    private double speechRatePreference = 1.0;

    @Column(nullable = false)
    private boolean twoFactorEnabled = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ThemePreference themePreference = ThemePreference.SYSTEM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "associated_authority_id")
    private Authority associatedAuthority;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;

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
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public boolean isHelperVerified() { return helperVerified; }
    public void setHelperVerified(boolean helperVerified) { this.helperVerified = helperVerified; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public ThemePreference getThemePreference() { return themePreference; }
    public void setThemePreference(ThemePreference themePreference) { this.themePreference = themePreference; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
    public Authority getAssociatedAuthority() { return associatedAuthority; }
    public void setAssociatedAuthority(Authority associatedAuthority) { this.associatedAuthority = associatedAuthority; }

    public String getLanguagesKnown() { return languagesKnown; }
    public void setLanguagesKnown(String languagesKnown) { this.languagesKnown = languagesKnown; }
    public String getSpecializationCategories() { return specializationCategories; }
    public void setSpecializationCategories(String specializationCategories) { this.specializationCategories = specializationCategories; }
    public int getMaxActiveCases() { return maxActiveCases; }
    public void setMaxActiveCases(int maxActiveCases) { this.maxActiveCases = maxActiveCases; }
    public int getCurrentActiveCases() { return currentActiveCases; }
    public void setCurrentActiveCases(int currentActiveCases) { this.currentActiveCases = currentActiveCases; }
    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }
    public boolean isWomenSupportTrained() { return womenSupportTrained; }
    public void setWomenSupportTrained(boolean womenSupportTrained) { this.womenSupportTrained = womenSupportTrained; }
    public boolean isForcePasswordChange() { return forcePasswordChange; }
    public void setForcePasswordChange(boolean forcePasswordChange) { this.forcePasswordChange = forcePasswordChange; }
    public String getServiceArea() { return serviceArea; }
    public void setServiceArea(String serviceArea) { this.serviceArea = serviceArea; }
    public String getSubSpecializations() { return subSpecializations; }
    public void setSubSpecializations(String subSpecializations) { this.subSpecializations = subSpecializations; }
    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    public boolean isCanHandleSensitiveCases() { return canHandleSensitiveCases; }
    public void setCanHandleSensitiveCases(boolean canHandleSensitiveCases) { this.canHandleSensitiveCases = canHandleSensitiveCases; }

    public boolean isSupportsTanglish() { return supportsTanglish; }
    public void setSupportsTanglish(boolean supportsTanglish) { this.supportsTanglish = supportsTanglish; }
    public boolean isSupportsHinglish() { return supportsHinglish; }
    public void setSupportsHinglish(boolean supportsHinglish) { this.supportsHinglish = supportsHinglish; }
    public boolean isCanReadTamil() { return canReadTamil; }
    public void setCanReadTamil(boolean canReadTamil) { this.canReadTamil = canReadTamil; }
    public boolean isCanReadHindi() { return canReadHindi; }
    public void setCanReadHindi(boolean canReadHindi) { this.canReadHindi = canReadHindi; }

    public boolean isVoiceAssistanceEnabled() { return voiceAssistanceEnabled; }
    public void setVoiceAssistanceEnabled(boolean voiceAssistanceEnabled) { this.voiceAssistanceEnabled = voiceAssistanceEnabled; }

    public boolean isSimpleModeEnabled() { return simpleModeEnabled; }
    public void setSimpleModeEnabled(boolean simpleModeEnabled) { this.simpleModeEnabled = simpleModeEnabled; }

    public double getSpeechRatePreference() { return speechRatePreference; }
    public void setSpeechRatePreference(double speechRatePreference) { this.speechRatePreference = speechRatePreference; }

    public boolean isTwoFactorEnabled() { return twoFactorEnabled; }
    public void setTwoFactorEnabled(boolean twoFactorEnabled) { this.twoFactorEnabled = twoFactorEnabled; }

    public boolean isProfileCompleted() { return profileCompleted; }
    public void setProfileCompleted(boolean profileCompleted) { this.profileCompleted = profileCompleted; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public boolean isMobileVerified() { return mobileVerified; }
    public void setMobileVerified(boolean mobileVerified) { this.mobileVerified = mobileVerified; }

    public boolean isWhatsappOptIn() { return whatsappOptIn; }
    public void setWhatsappOptIn(boolean whatsappOptIn) { this.whatsappOptIn = whatsappOptIn; }

    public int getProfileCompletionPercentage() { return profileCompletionPercentage; }
    public void setProfileCompletionPercentage(int profileCompletionPercentage) { this.profileCompletionPercentage = profileCompletionPercentage; }
}
