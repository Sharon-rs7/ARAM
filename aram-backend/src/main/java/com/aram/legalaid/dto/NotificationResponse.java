package com.aram.legalaid.dto;

import com.aram.legalaid.enums.NotificationStatus;
import com.aram.legalaid.enums.NotificationType;
import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String message,
        NotificationType type,
        NotificationStatus status,
        boolean read,
        LocalDateTime createdAt,
        LocalDateTime sentAt
) {}
