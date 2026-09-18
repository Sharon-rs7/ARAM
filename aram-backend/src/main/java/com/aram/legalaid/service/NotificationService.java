package com.aram.legalaid.service;

import com.aram.legalaid.dto.NotificationResponse;
import com.aram.legalaid.enums.NotificationStatus;
import com.aram.legalaid.enums.NotificationType;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.Notification;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserService userService;
    private final MapperService mapperService;
    private final com.aram.legalaid.websocket.NotificationWebSocketHandler webSocketHandler;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserService userService,
            MapperService mapperService,
            com.aram.legalaid.websocket.NotificationWebSocketHandler webSocketHandler
    ) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
        this.mapperService = mapperService;
        this.webSocketHandler = webSocketHandler;
    }

    @Transactional
    public Notification create(User user, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type == null ? NotificationType.IN_APP : type);
        notification.setStatus(NotificationStatus.SENT);
        Notification saved = notificationRepository.save(notification);

        // Real-time broadcast to connected WebSocket sessions
        try {
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("type", type != null ? type.name() : "IN_APP");
            payload.put("message", message);
            payload.put("userId", user != null ? user.getId() : null);
            payload.put("notificationId", saved.getId());
            payload.put("timestamp", System.currentTimeMillis());
            webSocketHandler.handleNotificationMessage(payload);
        } catch (Exception e) {
            System.err.println("[NOTIFICATION WS BROADCAST ERROR] " + e.getMessage());
        }

        return saved;
    }

    @Transactional
    public void notifyAdmins(String message) {
        for (User admin : userService.getAdmins()) {
            create(admin, message, NotificationType.SYSTEM);
        }
    }

    public List<NotificationResponse> myNotifications() {
        User user = userService.currentUser();
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(mapperService::toNotificationResponse)
                .toList();
    }

    public long unreadCount() {
        return notificationRepository.countByUserAndReadFlagFalse(userService.currentUser());
    }

    @Transactional
    public NotificationResponse markAsRead(Long id) {
        User user = userService.currentUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notification.setReadFlag(true);
        return mapperService.toNotificationResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead() {
        User user = userService.currentUser();
        List<Notification> unread = notificationRepository.findByUserAndReadFlagFalse(user);
        for (Notification n : unread) {
            n.setReadFlag(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void clearAll() {
        User user = userService.currentUser();
        List<Notification> all = notificationRepository.findByUser(user);
        notificationRepository.deleteAll(all);
    }
}
