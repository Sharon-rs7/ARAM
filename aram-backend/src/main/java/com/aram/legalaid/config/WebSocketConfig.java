package com.aram.legalaid.config;

import com.aram.legalaid.security.WebSocketHandshakeInterceptor;
import com.aram.legalaid.websocket.NotificationWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final NotificationWebSocketHandler webSocketHandler;
    private final WebSocketHandshakeInterceptor handshakeInterceptor;

    public WebSocketConfig(NotificationWebSocketHandler webSocketHandler,
                           WebSocketHandshakeInterceptor handshakeInterceptor) {
        this.webSocketHandler = webSocketHandler;
        this.handshakeInterceptor = handshakeInterceptor;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler, "/ws/updates")
                .addInterceptors(handshakeInterceptor)
                .setAllowedOrigins("*");
    }
}
