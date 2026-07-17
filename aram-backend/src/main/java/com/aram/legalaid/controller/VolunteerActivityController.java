package com.aram.legalaid.controller;

import com.aram.legalaid.model.VolunteerActivityLog;
import com.aram.legalaid.model.VolunteerSession;
import com.aram.legalaid.service.VolunteerActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class VolunteerActivityController {
    private final VolunteerActivityService activityService;

    public VolunteerActivityController(VolunteerActivityService activityService) {
        this.activityService = activityService;
    }

    // --- VOLUNTEER ENDPOINTS ---

    @PostMapping("/volunteer/session/start")
    public ResponseEntity<VolunteerSession> startSession(@RequestBody Map<String, Object> body) {
        Long volunteerId = ((Number) body.get("volunteerId")).longValue();
        String sessionId = (String) body.get("sessionId");
        String deviceInfo = (String) body.get("deviceInfo");
        return ResponseEntity.ok(activityService.startSession(volunteerId, sessionId, deviceInfo));
    }

    @PostMapping("/volunteer/session/heartbeat")
    public ResponseEntity<Void> heartbeat(@RequestBody Map<String, String> body) {
        String sessionId = body.get("sessionId");
        activityService.heartbeat(sessionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/volunteer/session/end")
    public ResponseEntity<Void> endSession(@RequestBody Map<String, String> body) {
        String sessionId = body.get("sessionId");
        activityService.endSession(sessionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/volunteer/activity/log")
    public ResponseEntity<VolunteerActivityLog> logActivity(@RequestBody Map<String, Object> body) {
        Long volunteerId = ((Number) body.get("volunteerId")).longValue();
        String actionType = (String) body.get("actionType");
        String label = (String) body.get("actionLabel");
        String targetType = (String) body.get("targetType");
        String targetId = (String) body.get("targetId");
        String route = (String) body.get("routePath");
        String sessionId = (String) body.get("sessionId");
        String metadata = (String) body.get("metadataJson");

        return ResponseEntity.ok(activityService.logActivity(
                volunteerId, actionType, label, targetType, targetId, route, sessionId, metadata
        ));
    }

    // --- ADMIN ENDPOINTS ---

    @GetMapping("/admin/volunteers/{volunteerId}/activity")
    public ResponseEntity<List<VolunteerActivityLog>> getVolunteerActivity(@PathVariable Long volunteerId) {
        return ResponseEntity.ok(activityService.getVolunteerActivities(volunteerId));
    }

    @GetMapping("/admin/volunteers/{volunteerId}/sessions")
    public ResponseEntity<List<VolunteerSession>> getVolunteerSessions(@PathVariable Long volunteerId) {
        return ResponseEntity.ok(activityService.getVolunteerSessions(volunteerId));
    }

    @GetMapping("/admin/volunteers/{volunteerId}/activity/summary")
    public ResponseEntity<Map<String, Object>> getVolunteerSummary(@PathVariable Long volunteerId) {
        return ResponseEntity.ok(activityService.getActivitySummary(volunteerId));
    }

    @GetMapping("/admin/volunteer-activity/overview")
    public ResponseEntity<Map<String, Object>> getOverallOverview() {
        return ResponseEntity.ok(activityService.getOverallOverview());
    }
}
