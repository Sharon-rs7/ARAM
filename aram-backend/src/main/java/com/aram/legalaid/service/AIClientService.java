package com.aram.legalaid.service;

import com.aram.legalaid.config.AIServiceProperties;
import com.aram.legalaid.dto.*;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
public class AIClientService {

    private final RestTemplate restTemplate;
    private final AIServiceProperties properties;

    public AIClientService(AIServiceProperties properties) {
        this.restTemplate = new RestTemplate();
        this.properties = properties;
    }

    public AiTriageResponse analyzeComplaint(String title, String description, String language, String district, boolean isSensitive, String preferredGender, List<Map<String, Object>> existingComplaints) {
        String url = properties.getUrl() + "/complaint/analyze";
        try {
            Map<String, Object> payload = Map.of(
                "title", title != null ? title : "",
                "description", description != null ? description : "",
                "languageHint", language != null ? language : "en",
                "district", district != null ? district : "Coimbatore",
                "area", "",
                "sensitive", isSensitive,
                "preferredLegalGuideGender", preferredGender != null ? preferredGender : "ANY",
                "existingComplaints", existingComplaints != null ? existingComplaints : List.of()
            );
            return restTemplate.postForObject(url, payload, AiTriageResponse.class);
        } catch (Exception e) {
            System.err.println("FastAPI analyzeComplaint failed: " + e.getMessage());
            throw new RuntimeException("AI Triage service is currently offline. Please try again later.", e);
        }
    }

    public AiChatResponse askChatbot(AiChatRequest request) {
        String url = properties.getUrl() + "/chat/ask";
        try {
            return restTemplate.postForObject(url, request, AiChatResponse.class);
        } catch (Exception e) {
            System.err.println("FastAPI askChatbot failed: " + e.getMessage());
            return new AiChatResponse(
                "I am sorry, the AI service is currently undergoing maintenance. Please reach out to your local helper. This is preliminary legal aid guidance only.",
                "I am sorry, the AI service is currently undergoing maintenance. Please reach out to your local helper. This is preliminary legal aid guidance only.",
                null,
                0.0,
                List.of("Retry connection", "Consult counselor"),
                "This is preliminary legal aid guidance only."
            );
        }
    }

    public Map<String, Object> ocrDocument(MultipartFile file) {
        String url = properties.getUrl() + "/documents/ocr";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", getFileResource(file));

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("FastAPI ocrDocument failed: " + e.getMessage());
            return Map.of(
                "extractedText", "",
                "maskedText", "",
                "confidence", 0.0,
                "status", "NEEDS_MANUAL_REVIEW"
            );
        }
    }

    public AiDocumentVerifyResponse verifyDocument(MultipartFile file, String expectedType, String category) {
        String url = properties.getUrl() + "/documents/verify";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", getFileResource(file));
            body.add("expectedDocumentType", expectedType);
            body.add("complaintCategory", category);

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<AiDocumentVerifyResponse> response = restTemplate.postForEntity(url, entity, AiDocumentVerifyResponse.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("FastAPI verifyDocument failed: " + e.getMessage());
            return new AiDocumentVerifyResponse(
                expectedType,
                "OCR Service Failed.",
                0.0,
                0.0,
                0.0,
                "REUPLOAD_REQUIRED",
                List.of("OCR processing failed due to connection error"),
                List.of("CONNECTION_ERROR"),
                List.of(),
                Map.of(),
                "none",
                "none"
            );
        }
    }

    public List<Map<String, Object>> recommendVolunteers(String category, String language, boolean preferWoman, String district, List<Map<String, Object>> volunteers) {
        String url = properties.getUrl() + "/recommend/volunteer";
        try {
            Map<String, Object> payload = Map.of(
                "category", category,
                "language", language != null ? language : "en",
                "preferWomanVolunteer", preferWoman,
                "district", district != null ? district : "Coimbatore",
                "volunteers", volunteers
            );
            return restTemplate.postForObject(url, payload, List.class);
        } catch (Exception e) {
            System.err.println("FastAPI recommendVolunteers failed: " + e.getMessage());
            return List.of();
        }
    }

    public Map<String, Object> transcribeSpeech(MultipartFile file, String selectedLanguage) {
        String url = properties.getUrl() + "/voice/transcribe";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", getFileResource(file));
            if (selectedLanguage != null) {
                body.add("language", selectedLanguage);
            }
            
            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("FastAPI transcribeSpeech failed: " + e.getMessage());
            return Map.of("transcript", "Speech transcription failed. Please check microphone connection or type manually.", "confidence", 0.0);
        }
    }

    public Map<String, Object> detectLanguage(String text) {
        String url = properties.getUrl() + "/language/detect";
        try {
            return restTemplate.postForObject(url, Map.of("text", text), Map.class);
        } catch (Exception e) {
            System.err.println("FastAPI detectLanguage failed: " + e.getMessage());
            return Map.of("language", "English");
        }
    }

    public Map<String, Object> translateText(String text, String sourceLanguage, String targetLanguage) {
        String url = properties.getUrl() + "/language/translate";
        try {
            Map<String, Object> payload = Map.of(
                "text", text,
                "sourceLanguage", sourceLanguage != null ? sourceLanguage : "Tamil",
                "targetLanguage", targetLanguage != null ? targetLanguage : "English"
            );
            return restTemplate.postForObject(url, payload, Map.class);
        } catch (Exception e) {
            System.err.println("FastAPI translateText failed: " + e.getMessage());
            return Map.of("originalText", text, "translatedText", text);
        }
    }

    public Map<String, Object> normalizeText(String text) {
        String url = properties.getUrl() + "/language/normalize";
        try {
            return restTemplate.postForObject(url, Map.of("text", text), Map.class);
        } catch (Exception e) {
            System.err.println("FastAPI normalizeText failed: " + e.getMessage());
            return Map.of("originalText", text, "normalizedText", text);
        }
    }

    public Map<String, Object> getSpeechStatus() {
        String url = properties.getUrl() + "/speech/status";
        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            System.err.println("FastAPI getSpeechStatus failed: " + e.getMessage());
            return Map.of("modelLoaded", false, "modelSize", "base", "device", "cpu");
        }
    }

    private ByteArrayResource getFileResource(MultipartFile file) throws Exception {
        return new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "file.wav";
            }
        };
    }
}
