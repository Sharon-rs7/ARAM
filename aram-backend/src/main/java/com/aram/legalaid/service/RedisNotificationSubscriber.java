package com.aram.legalaid.service;

import com.aram.legalaid.websocket.NotificationWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class RedisNotificationSubscriber implements MessageListener {
    private final NotificationWebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper;

    public RedisNotificationSubscriber(NotificationWebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String payloadStr = new String(message.getBody(), StandardCharsets.UTF_8);
            System.out.println("[REDIS SUBSCRIBE] Received message from channel: " + payloadStr);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(payloadStr, Map.class);
            
            // Forward to WebSocket Handler to broadcast to matching authorized connections
            webSocketHandler.handleNotificationMessage(payload);
        } catch (IOException e) {
            System.err.println("[REDIS SUBSCRIBE ERROR] Failed to parse message body: " + e.getMessage());
        }
    }
}
