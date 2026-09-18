package com.aram.legalaid.security;

import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public WebSocketHandshakeInterceptor(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpServletRequest = servletRequest.getServletRequest();
            String token = httpServletRequest.getParameter("token");
            if (token != null && !token.trim().isEmpty()) {
                token = token.trim();
                if (token.startsWith("Bearer ")) {
                    token = token.substring(7).trim();
                }
                try {
                    String username = jwtUtil.extractUsername(token);
                    if (username != null && jwtUtil.isTokenValid(token, username)) {
                        User user = userRepository.findByEmail(username).orElse(null);
                        if (user != null) {
                            attributes.put("userId", user.getId());
                            attributes.put("role", user.getRole().name());
                            attributes.put("district", user.getDistrict() != null ? user.getDistrict() : "");
                            System.out.println("[WS HANDSHAKE] User " + username + " authenticated successfully for WebSocket.");
                            return true;
                        }
                    }
                } catch (Exception e) {
                    System.err.println("[WS HANDSHAKE ERROR] JWT Validation failed: " + e.getMessage());
                }
            }
        }
        System.err.println("[WS HANDSHAKE REJECTED] Connection upgrade request rejected due to missing or invalid token.");
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
    }
}
