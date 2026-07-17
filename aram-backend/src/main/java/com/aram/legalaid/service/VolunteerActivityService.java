package com.aram.legalaid.service;

import com.aram.legalaid.model.VolunteerActivityLog;
import com.aram.legalaid.model.VolunteerSession;
import com.aram.legalaid.repository.VolunteerActivityRepository;
import com.aram.legalaid.repository.VolunteerSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class VolunteerActivityService {
    private final VolunteerActivityRepository activityRepository;
    private final VolunteerSessionRepository sessionRepository;

    public VolunteerActivityService(VolunteerActivityRepository activityRepository, VolunteerSessionRepository sessionRepository) {
        this.activityRepository = activityRepository;
        this.sessionRepository = sessionRepository;
    }

    public VolunteerActivityLog logActivity(Long volunteerId, String actionType, String label, String targetType, String targetId, String route, String sessionId, String metadata) {
        VolunteerActivityLog log = new VolunteerActivityLog();
        log.setVolunteerId(volunteerId);
        log.setActionType(actionType);
        log.setActionLabel(label);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setRoutePath(route);
        log.setSessionId(sessionId);
        log.setMetadataJson(metadata);
        
        // Try update last active time of current session
        if (sessionId != null) {
            sessionRepository.findBySessionId(sessionId).ifPresent(session -> {
                session.setLastActiveAt(LocalDateTime.now());
                long diff = Duration.between(session.getLoginAt(), LocalDateTime.now()).toSeconds();
                session.setTotalDurationSeconds(diff);
                sessionRepository.save(session);
            });
        }

        return activityRepository.save(log);
    }

    public VolunteerSession startSession(Long volunteerId, String sessionId, String deviceInfo) {
        VolunteerSession session = new VolunteerSession();
        session.setVolunteerId(volunteerId);
        session.setSessionId(sessionId);
        session.setDeviceInfo(deviceInfo);
        session.setLoginAt(LocalDateTime.now());
        session.setLastActiveAt(LocalDateTime.now());
        session.setStatus("ACTIVE");
        return sessionRepository.save(session);
    }

    public void heartbeat(String sessionId) {
        sessionRepository.findBySessionId(sessionId).ifPresent(session -> {
            session.setLastActiveAt(LocalDateTime.now());
            long diff = Duration.between(session.getLoginAt(), LocalDateTime.now()).toSeconds();
            session.setTotalDurationSeconds(diff);
            sessionRepository.save(session);
        });
    }

    public void endSession(String sessionId) {
        sessionRepository.findBySessionId(sessionId).ifPresent(session -> {
            session.setLogoutAt(LocalDateTime.now());
            session.setLastActiveAt(LocalDateTime.now());
            long diff = Duration.between(session.getLoginAt(), LocalDateTime.now()).toSeconds();
            session.setTotalDurationSeconds(diff);
            session.setStatus("ENDED");
            sessionRepository.save(session);
        });
    }

    public List<VolunteerActivityLog> getVolunteerActivities(Long volunteerId) {
        return activityRepository.findByVolunteerIdOrderByCreatedAtDesc(volunteerId);
    }

    public List<VolunteerSession> getVolunteerSessions(Long volunteerId) {
        return sessionRepository.findByVolunteerIdOrderByLoginAtDesc(volunteerId);
    }

    public Map<String, Object> getActivitySummary(Long volunteerId) {
        List<VolunteerSession> sessions = getVolunteerSessions(volunteerId);
        List<VolunteerActivityLog> activities = getVolunteerActivities(volunteerId);

        long totalScreenTime = sessions.stream().mapToLong(VolunteerSession::getTotalDurationSeconds).sum();
        long activeSessionsCount = sessions.stream().filter(s -> "ACTIVE".equals(s.getStatus())).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("volunteerId", volunteerId);
        summary.put("totalSessions", sessions.size());
        summary.put("activeSessions", activeSessionsCount);
        summary.put("totalScreenTimeSeconds", totalScreenTime);
        summary.put("totalActions", activities.size());
        
        if (!sessions.isEmpty()) {
            summary.put("lastActive", sessions.get(0).getLastActiveAt());
        }

        return summary;
    }

    public Map<String, Object> getOverallOverview() {
        List<VolunteerSession> sessions = sessionRepository.findAll();
        List<VolunteerActivityLog> activities = activityRepository.findAllByOrderByCreatedAtDesc();

        long activeNow = sessions.stream().filter(s -> "ACTIVE".equals(s.getStatus())).count();
        long totalScreenTime = sessions.stream().mapToLong(VolunteerSession::getTotalDurationSeconds).sum();

        Map<String, Object> overview = new HashMap<>();
        overview.put("totalSessions", sessions.size());
        overview.put("activeNow", activeNow);
        overview.put("totalScreenTimeSeconds", totalScreenTime);
        overview.put("totalActions", activities.size());
        
        return overview;
    }
}
