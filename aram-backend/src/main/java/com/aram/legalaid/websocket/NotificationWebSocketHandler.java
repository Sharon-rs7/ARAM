package com.aram.legalaid.websocket;

import com.aram.legalaid.enums.Role;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.repository.ComplaintRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {
    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ComplaintRepository complaintRepository;
    private final ObjectMapper objectMapper;

    public NotificationWebSocketHandler(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.put(session.getId(), session);
        System.out.println("[WS CONNECTED] Session: " + session.getId() + ", User ID: " + session.getAttributes().get("userId"));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session.getId());
        System.out.println("[WS CLOSED] Session: " + session.getId());
    }

    public void handleNotificationMessage(Map<String, Object> payload) {
        // Broadcast updates to authorized sessions
        String type = (String) payload.get("type");
        String messageText = (String) payload.get("message");
        Object complaintIdObj = payload.get("complaintId");
        
        Long complaintId = null;
        if (complaintIdObj != null) {
            if (complaintIdObj instanceof Number) {
                complaintId = ((Number) complaintIdObj).longValue();
            } else {
                try {
                    complaintId = Long.parseLong(complaintIdObj.toString());
                } catch (NumberFormatException ignored) {}
            }
        }

        Complaint complaint = null;
        if (complaintId != null) {
            complaint = complaintRepository.findById(complaintId).orElse(null);
        }

        for (WebSocketSession session : sessions.values()) {
            if (!session.isOpen()) {
                continue;
            }

            Long wsUserId = (Long) session.getAttributes().get("userId");
            String wsRoleStr = (String) session.getAttributes().get("role");
            String wsDistrict = (String) session.getAttributes().get("district");
            
            if (wsUserId == null || wsRoleStr == null) {
                continue;
            }

            // Perform strict authentication and authorization checks on each WebSocket connection
            boolean authorized = false;

            Object targetUserIdObj = payload.get("userId");
            Long targetUserId = null;
            if (targetUserIdObj != null) {
                if (targetUserIdObj instanceof Number) {
                    targetUserId = ((Number) targetUserIdObj).longValue();
                } else {
                    try {
                        targetUserId = Long.parseLong(targetUserIdObj.toString());
                    } catch (NumberFormatException ignored) {}
                }
            }

            if (targetUserId != null && targetUserId.equals(wsUserId)) {
                authorized = true;
            } else if ("ADMIN".equals(wsRoleStr) || "SUPER_ADMIN".equals(wsRoleStr)) {
                if (complaint == null || wsDistrict == null || wsDistrict.isEmpty() || wsDistrict.equalsIgnoreCase("GLOBAL") || (complaint.getDistrict() != null && wsDistrict.equalsIgnoreCase(complaint.getDistrict()))) {
                    authorized = true;
                }
            } else if (complaint != null) {
                if ("CITIZEN".equals(wsRoleStr) && complaint.getUser().getId().equals(wsUserId)) {
                    authorized = true;
                } else if ("HELPER".equals(wsRoleStr) && complaint.getAssignedHelper() != null && complaint.getAssignedHelper().getId().equals(wsUserId)) {
                    authorized = true;
                }
            }

            if (authorized) {
                try {
                    String json = objectMapper.writeValueAsString(payload);
                    session.sendMessage(new TextMessage(json));
                    System.out.println("[WS SENT] Pushed real-time update to session: " + session.getId());
                } catch (IOException e) {
                    System.err.println("[WS SEND ERROR] Failed to send message to session " + session.getId() + ": " + e.getMessage());
                }
            }
        }
    }
}
