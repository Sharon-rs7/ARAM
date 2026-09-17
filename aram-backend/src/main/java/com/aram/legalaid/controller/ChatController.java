package com.aram.legalaid.controller;

import com.aram.legalaid.dto.AiChatRequest;
import com.aram.legalaid.service.AIClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final AIClientService aiClientService;

    public ChatController(AIClientService aiClientService) {
        this.aiClientService = aiClientService;
    }

    @PostMapping("/ask")
    public ResponseEntity<Map<String, Object>> ask(@RequestBody AiChatRequest request) {
        return ResponseEntity.ok(aiClientService.askChatbot(request));
    }
}
