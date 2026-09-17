package com.aram.legalaid.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class RedisNotificationPublisher {
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private static final String CHANNEL_TOPIC = "aram_notifications";

    public RedisNotificationPublisher(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public void publishNotification(String type, Long complaintId, Long userId, String message, Map<String, Object> extraData) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", type);
            payload.put("complaintId", complaintId != null ? complaintId : "");
            payload.put("userId", userId != null ? userId : "");
            payload.put("message", message != null ? message : "");
            payload.put("timestamp", System.currentTimeMillis());
            if (extraData != null) {
                payload.put("data", extraData);
            }

            String jsonString = objectMapper.writeValueAsString(payload);
            redisTemplate.convertAndSend(CHANNEL_TOPIC, jsonString);
            System.out.println("[REDIS PUBLISH] Published event '" + type + "' to topic '" + CHANNEL_TOPIC + "'");
        } catch (Exception e) {
            System.err.println("[REDIS PUBLISH ERROR] Failed to publish event: " + e.getMessage());
        }
    }

    public void publishNotification(String type, Long complaintId, Long userId, String message) {
        publishNotification(type, complaintId, userId, message, null);
    }
}
