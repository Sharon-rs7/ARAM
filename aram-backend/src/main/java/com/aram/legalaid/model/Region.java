package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "regions", indexes = {
        @Index(name = "idx_regions_id", columnList = "regionId")
})
public class Region {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String regionId; // e.g. "chennai", "coimbatore"

    @Column(nullable = false, length = 100)
    private String regionName; // e.g. "Chennai", "Coimbatore"

    @Column(length = 150)
    private String adminEmail; // Primary administrator email for this region

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Region() {}

    public Region(String regionId, String regionName, String adminEmail) {
        this.regionId = regionId;
        this.regionName = regionName;
        this.adminEmail = adminEmail;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRegionId() { return regionId; }
    public void setRegionId(String regionId) { this.regionId = regionId; }

    public String getRegionName() { return regionName; }
    public void setRegionName(String regionName) { this.regionName = regionName; }

    public String getAdminEmail() { return adminEmail; }
    public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
