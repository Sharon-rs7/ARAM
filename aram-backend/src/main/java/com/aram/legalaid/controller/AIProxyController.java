package com.aram.legalaid.controller;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.service.AIClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

import com.aram.legalaid.util.FileUploadValidator;
import com.aram.legalaid.util.UploadCategory;

@RestController
@RequestMapping("/api/ai")
public class AIProxyController {

    private final AIClientService aiClientService;
    private final com.aram.legalaid.service.TtsService ttsService;
    private final FileUploadValidator fileUploadValidator;

    public AIProxyController(AIClientService aiClientService, 
                              com.aram.legalaid.service.TtsService ttsService,
                              FileUploadValidator fileUploadValidator) {
        this.aiClientService = aiClientService;
        this.ttsService = ttsService;
        this.fileUploadValidator = fileUploadValidator;
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
        String complaintId = (String) body.getOrDefault("complaintId", "");
        Long citizenId = body.containsKey("citizenId") && body.get("citizenId") != null ? ((Number) body.get("citizenId")).longValue() : null;
        String regionId = (String) body.getOrDefault("regionId", district);
        return ResponseEntity.ok(aiClientService.analyzeComplaint(complaintId, citizenId, regionId, title, description, language, district, isSensitive, preferredGender, existing));
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody AiChatRequest request) {
        return ResponseEntity.ok(aiClientService.askChatbot(request));
    }

    @PostMapping("/case-assistant")
    public ResponseEntity<Map<String, Object>> caseAssistant(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(aiClientService.askCaseAssistant(body));
    }

    @PostMapping("/documents/ocr")
    public ResponseEntity<Map<String, Object>> ocrDocument(@RequestParam("file") MultipartFile file) {
        String orig = file.getOriginalFilename();
        UploadCategory cat = UploadCategory.DOCUMENT;
        if (orig != null) {
            String lower = orig.toLowerCase();
            if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp")) {
                cat = UploadCategory.IMAGE;
            }
        }
        fileUploadValidator.validateAndGenerateSafeName(file, cat);
        return ResponseEntity.ok(aiClientService.ocrDocument(file));
    }

    @PostMapping("/documents/verify")
    public ResponseEntity<AiDocumentVerifyResponse> verifyDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("expectedDocumentType") String expectedType,
            @RequestParam("complaintCategory") String category
    ) {
        String orig = file.getOriginalFilename();
        UploadCategory cat = UploadCategory.DOCUMENT;
        if (orig != null) {
            String lower = orig.toLowerCase();
            if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp")) {
                cat = UploadCategory.IMAGE;
            }
        }
        fileUploadValidator.validateAndGenerateSafeName(file, cat);
        return ResponseEntity.ok(aiClientService.verifyDocument(file, expectedType, category));
    }

    @GetMapping("/tts")
    public ResponseEntity<byte[]> streamTts(
            @RequestParam("text") String text,
            @RequestParam(value = "lang", defaultValue = "en") String lang
    ) {
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String cleanText = text.trim();
        if (cleanText.length() > 500) {
            cleanText = cleanText.substring(0, 500);
        }

        String cleanLang = lang == null ? "en" : lang.trim().toLowerCase();
        if (!cleanLang.equals("en") && !cleanLang.equals("ta") && !cleanLang.equals("hi") &&
            !cleanLang.equals("en-in") && !cleanLang.equals("ta-in") && !cleanLang.equals("hi-in") &&
            !cleanLang.equals("ta-en") && !cleanLang.equals("hi-en")) {
            return ResponseEntity.badRequest().build();
        }

        System.out.println("[AI PROXY TTS] Synthesizing TTS text of length: " + cleanText.length() + " in lang: " + cleanLang);

        byte[] audioBytes = ttsService.generateTts(cleanText, cleanLang);
        if (audioBytes == null) {
            return ResponseEntity.noContent()
                    .header("X-TTS-Fallback", "true")
                    .build();
        }

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "audio/mpeg")
                .body(audioBytes);
    }
}
