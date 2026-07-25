package com.aram.legalaid.controller;

import com.aram.legalaid.enums.Role;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.model.User;
import com.aram.legalaid.service.UserService;
import com.aram.legalaid.service.VolunteerAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class VolunteerAnalyticsController {

    private final VolunteerAnalyticsService analyticsService;
    private final UserService userService;

    public VolunteerAnalyticsController(VolunteerAnalyticsService analyticsService, UserService userService) {
        this.analyticsService = analyticsService;
        this.userService = userService;
    }

    @GetMapping("/admin/volunteers/{id}/analytics")
    public ResponseEntity<Map<String, Object>> getVolunteerAnalyticsForAdmin(@PathVariable Long id) {
        // Admin authorization is handled by Spring Security via requestMatchers("/api/admin/**").hasRole("ADMIN")
        return ResponseEntity.ok(analyticsService.getVolunteerAnalytics(id));
    }

    @GetMapping("/volunteer/my-analytics")
    public ResponseEntity<Map<String, Object>> getMyVolunteerAnalytics() {
        User currentUser = userService.currentUser();
        if (currentUser.getRole() != Role.HELPER) {
            throw new ForbiddenException("Helper role required to access individual volunteer analytics");
        }
        return ResponseEntity.ok(analyticsService.getVolunteerAnalytics(currentUser.getId()));
    }
}
