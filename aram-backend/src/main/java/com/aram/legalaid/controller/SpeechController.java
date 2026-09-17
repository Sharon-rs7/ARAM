package com.aram.legalaid.controller;

import com.aram.legalaid.service.AIClientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import com.aram.legalaid.util.FileUploadValidator;
import com.aram.legalaid.util.UploadCategory;

@RestController
@RequestMapping("/api")
public class SpeechController {

    private final AIClientService aiClientService;
    private final com.aram.legalaid.service.JobService jobService;
    private final com.aram.legalaid.service.UserService userService;

    @org.springframework.beans.factory.annotation.Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private final FileUploadValidator fileUploadValidator;

    public SpeechController(AIClientService aiClientService, 
                            com.aram.legalaid.service.JobService jobService,
                            com.aram.legalaid.service.UserService userService,
                            FileUploadValidator fileUploadValidator) {
        this.aiClientService = aiClientService;
        this.jobService = jobService;
        this.userService = userService;
        this.fileUploadValidator = fileUploadValidator;
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
        fileUploadValidator.validateAndGenerateSafeName(uploadFile, UploadCategory.AUDIO);
        return ResponseEntity.ok(aiClientService.transcribeSpeech(uploadFile, selectedLanguage));
    }

    @PostMapping("/speech/transcribe-async")
    public ResponseEntity<com.aram.legalaid.model.Job> transcribeSpeechAsync(
            @RequestParam(value = "audio", required = false) MultipartFile audio,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "selectedLanguage", required = false) String selectedLanguage
    ) {
        MultipartFile uploadFile = audio != null ? audio : file;
        if (uploadFile == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            String safeName = fileUploadValidator.validateAndGenerateSafeName(uploadFile, UploadCategory.AUDIO);
            java.nio.file.Path target = fileUploadValidator.getSafeUploadPath(safeName, null);
            java.nio.file.Files.createDirectories(target.getParent());
            java.nio.file.Files.copy(uploadFile.getInputStream(), target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            com.aram.legalaid.model.User current = userService.currentUser();
            Long userId = current != null ? current.getId() : null;
            String meta = "{\"selectedLanguage\":\"" + (selectedLanguage != null ? selectedLanguage : "") + "\"}";

            com.aram.legalaid.model.Job job = jobService.createJob(null, userId, "WHISPER_TRANSCRIPTION", target.toString(), meta);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(job);
        } catch (Exception e) {
            System.err.println("Async Whisper transcription job creation failed: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
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
