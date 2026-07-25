package com.aram.legalaid.model;

import jakarta.persistence.*;

@Entity
@Table(name = "authority_offices", indexes = {
        @Index(name = "idx_offices_district", columnList = "district"),
        @Index(name = "idx_offices_category", columnList = "categorySupported")
})
public class AuthorityOffice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String authorityType;

    @Column(nullable = false, length = 100)
    private String categorySupported;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(nullable = false, length = 100)
    private String area;

    @Column(nullable = false, length = 255)
    private String address;

    private String phone;
    private String email;
    private String website;
    private String workingHours;
    private Double latitude;
    private Double longitude;

    @Column(length = 500)
    private String mapsUrl;

    @Column(length = 255)
    private String onlinePortalUrl;

    private boolean active = true;

    public AuthorityOffice() {}

    public AuthorityOffice(String name, String authorityType, String categorySupported, String district, String area, String address, String phone, String email, String website, String workingHours, Double latitude, Double longitude, String mapsUrl, String onlinePortalUrl) {
        this.name = name;
        this.authorityType = authorityType;
        this.categorySupported = categorySupported;
        this.district = district;
        this.area = area;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.website = website;
        this.workingHours = workingHours;
        this.latitude = latitude;
        this.longitude = longitude;
        this.mapsUrl = mapsUrl;
        this.onlinePortalUrl = onlinePortalUrl;
        this.active = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAuthorityType() { return authorityType; }
    public void setAuthorityType(String authorityType) { this.authorityType = authorityType; }

    public String getCategorySupported() { return categorySupported; }
    public void setCategorySupported(String categorySupported) { this.categorySupported = categorySupported; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getWorkingHours() { return workingHours; }
    public void setWorkingHours(String workingHours) { this.workingHours = workingHours; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getMapsUrl() { return mapsUrl; }
    public void setMapsUrl(String mapsUrl) { this.mapsUrl = mapsUrl; }

    public String getOnlinePortalUrl() { return onlinePortalUrl; }
    public void setOnlinePortalUrl(String onlinePortalUrl) { this.onlinePortalUrl = onlinePortalUrl; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
