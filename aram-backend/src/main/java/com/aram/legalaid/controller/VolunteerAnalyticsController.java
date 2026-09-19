package com.aram.legalaid.controller;

import com.aram.legalaid.enums.Role;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.service.UserService;
import com.aram.legalaid.service.VolunteerAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class VolunteerAnalyticsController {

    private final VolunteerAnalyticsService analyticsService;
    private final UserService userService;
    private final UserRepository userRepository;

    public VolunteerAnalyticsController(VolunteerAnalyticsService analyticsService, 
                                        UserService userService,
                                        UserRepository userRepository) {
        this.analyticsService = analyticsService;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/admin/volunteers/{id}/analytics")
    public ResponseEntity<Map<String, Object>> getVolunteerAnalyticsForAdmin(@PathVariable Long id) {
        // Admin authorization is handled by Spring Security via requestMatchers("/api/admin/**").hasRole("ADMIN")
        return ResponseEntity.ok(analyticsService.getVolunteerAnalytics(id));
    }

    @GetMapping({"/volunteer/my-analytics", "/helper/analytics"})
    public ResponseEntity<Map<String, Object>> getMyVolunteerAnalytics() {
        User currentUser = userService.currentUser();
        if (currentUser.getRole() == Role.HELPER) {
            return ResponseEntity.ok(analyticsService.getVolunteerAnalytics(currentUser.getId()));
        }
        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.SUPER_ADMIN) {
            List<User> helpers = userRepository.findByRole(Role.HELPER);
            if (!helpers.isEmpty()) {
                User matched = helpers.stream()
                        .filter(h -> currentUser.getDistrict() != null && currentUser.getDistrict().equalsIgnoreCase(h.getDistrict()))
                        .findFirst()
                        .orElse(helpers.get(0));
                return ResponseEntity.ok(analyticsService.getVolunteerAnalytics(matched.getId()));
            }
        }
        throw new ForbiddenException("Helper role required to access individual volunteer analytics");
    }
}
