package com.aram.legalaid.controller;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.service.AIClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIProxyController {

    private final AIClientService aiClientService;

    public AIProxyController(AIClientService aiClientService) {
        this.aiClientService = aiClientService;
    }

    @PostMapping("/analyze-complaint")
    @SuppressWarnings("unchecked")
    public ResponseEntity<AiTriageResponse> analyzeComplaint(@RequestBody Map<String, Object> body) {
        String title = (String) body.getOrDefault("title", "");
        String description = (String) body.getOrDefault("description", body.getOrDefault("complaintText", ""));
        String language = (String) body.getOrDefault("language", "en");
        String district = (String) body.getOrDefault("district", "Coimbatore");
        boolean isSensitive = body.containsKey("isSensitive") && (boolean) body.get("isSensitive");
        String preferredGender = (String) body.getOrDefault("preferredHelperGender", "ANY");
        java.util.List<Map<String, Object>> existing = (java.util.List<Map<String, Object>>) body.getOrDefault("existingComplaints", java.util.List.of());
        return ResponseEntity.ok(aiClientService.analyzeComplaint(title, description, language, district, isSensitive, preferredGender, existing));
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        return ResponseEntity.ok(aiClientService.askChatbot(request));
    }

    @PostMapping("/documents/ocr")
    public ResponseEntity<Map<String, Object>> ocrDocument(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(aiClientService.ocrDocument(file));
    }

    @PostMapping("/documents/verify")
    public ResponseEntity<AiDocumentVerifyResponse> verifyDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("expectedDocumentType") String expectedType,
            @RequestParam("complaintCategory") String category
    ) {
        return ResponseEntity.ok(aiClientService.verifyDocument(file, expectedType, category));
    }
}
