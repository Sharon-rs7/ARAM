package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "guide_invitations", indexes = {
        @Index(name = "idx_guide_invitation_token", columnList = "token"),
        @Index(name = "idx_guide_invitation_email", columnList = "email")
})
public class GuideInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, unique = true, length = 100)
    private String token;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(length = 250)
    private String languages;

    @Column(length = 250)
    private String specializations;

    private boolean womenSensitive;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    private boolean used = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public GuideInvitation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }

    public String getSpecializations() { return specializations; }
    public void setSpecializations(String specializations) { this.specializations = specializations; }

    public boolean isWomenSensitive() { return womenSensitive; }
    public void setWomenSensitive(boolean womenSensitive) { this.womenSensitive = womenSensitive; }

    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }

    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }

    @Column(nullable = false, length = 50)
    private String role = "HELPER";

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
