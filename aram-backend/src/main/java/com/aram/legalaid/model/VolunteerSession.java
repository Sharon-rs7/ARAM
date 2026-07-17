package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "volunteer_sessions")
public class VolunteerSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "volunteer_id", nullable = false)
    private Long volunteerId;

    @Column(name = "session_id", nullable = false, unique = true)
    private String sessionId;

    @Column(name = "login_at", nullable = false)
    private LocalDateTime loginAt = LocalDateTime.now();

    @Column(name = "logout_at")
    private LocalDateTime logoutAt;

    @Column(name = "last_active_at", nullable = false)
    private LocalDateTime lastActiveAt = LocalDateTime.now();

    @Column(name = "total_duration_seconds")
    private Long totalDurationSeconds = 0L;

    @Column(name = "device_info")
    private String deviceInfo;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE"; // ACTIVE, ENDED

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVolunteerId() { return volunteerId; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public LocalDateTime getLoginAt() { return loginAt; }
    public void setLoginAt(LocalDateTime loginAt) { this.loginAt = loginAt; }

    public LocalDateTime getLogoutAt() { return logoutAt; }
    public void setLogoutAt(LocalDateTime logoutAt) { this.logoutAt = logoutAt; }

    public LocalDateTime getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(LocalDateTime lastActiveAt) { this.lastActiveAt = lastActiveAt; }

    public Long getTotalDurationSeconds() { return totalDurationSeconds; }
    public void setTotalDurationSeconds(Long totalDurationSeconds) { this.totalDurationSeconds = totalDurationSeconds; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
