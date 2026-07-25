package com.aram.legalaid.controller;

import com.aram.legalaid.service.AIClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SpeechController {

    private final AIClientService aiClientService;

    public SpeechController(AIClientService aiClientService) {
        this.aiClientService = aiClientService;
    }

    @PostMapping("/speech/transcribe")
    public ResponseEntity<Map<String, Object>> transcribeSpeech(
            @RequestParam(value = "audio", required = false) MultipartFile audio,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "selectedLanguage", required = false) String selectedLanguage,
            @RequestParam(value = "preferredOutputLanguage", required = false) String preferredOutputLanguage
    ) {
        MultipartFile uploadFile = audio != null ? audio : file;
        if (uploadFile == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Audio file is required"));
        }
        return ResponseEntity.ok(aiClientService.transcribeSpeech(uploadFile, selectedLanguage));
    }

    @PostMapping("/language/detect")
    public ResponseEntity<Map<String, Object>> detectLanguage(@RequestBody Map<String, String> payload) {
        String text = payload.get("text");
        return ResponseEntity.ok(aiClientService.detectLanguage(text));
    }

    @PostMapping("/language/translate")
    public ResponseEntity<Map<String, Object>> translateText(@RequestBody Map<String, String> payload) {
        String text = payload.get("text");
        String sourceLanguage = payload.get("sourceLanguage");
        String targetLanguage = payload.get("targetLanguage");
        return ResponseEntity.ok(aiClientService.translateText(text, sourceLanguage, targetLanguage));
    }

    @PostMapping("/language/normalize")
    public ResponseEntity<Map<String, Object>> normalizeText(@RequestBody Map<String, String> payload) {
        String text = payload.get("text");
        return ResponseEntity.ok(aiClientService.normalizeText(text));
    }

    @GetMapping("/speech/status")
    public ResponseEntity<Map<String, Object>> getSpeechStatus() {
        return ResponseEntity.ok(aiClientService.getSpeechStatus());
    }
}
