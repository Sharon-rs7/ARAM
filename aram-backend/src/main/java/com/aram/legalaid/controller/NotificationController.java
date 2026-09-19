package com.aram.legalaid.controller;

import com.aram.legalaid.dto.NotificationResponse;
import com.aram.legalaid.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> myNotifications() {
        return ResponseEntity.ok(notificationService.myNotifications());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        long cnt = notificationService.unreadCount();
        return ResponseEntity.ok(Map.of("count", cnt, "unreadCount", cnt));
    }

    @RequestMapping(value = "/{id}/read", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @RequestMapping(value = {"/read-all", "/mark-all-read"}, method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read."));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearAll() {
        notificationService.clearAll();
        return ResponseEntity.ok(Map.of("message", "All notifications cleared."));
    }
}
