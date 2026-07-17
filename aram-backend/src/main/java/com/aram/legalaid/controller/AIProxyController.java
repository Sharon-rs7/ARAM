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
    public ResponseEntity<AiTriageResponse> analyzeComplaint(@RequestBody Map<String, Object> body) {
        String text = (String) body.get("complaintText");
        String language = (String) body.get("language");
        String district = (String) body.get("district");
        boolean isSensitive = body.containsKey("isSensitive") && (boolean) body.get("isSensitive");
        return ResponseEntity.ok(aiClientService.analyzeComplaint(text, language, district, isSensitive));
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
