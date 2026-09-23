package com.aram.legalaid.service;

import com.aram.legalaid.config.AIServiceProperties;
import com.aram.legalaid.dto.*;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class AIClientService {

    private final RestTemplate restTemplate;
    private final AIServiceProperties properties;
    private final UserService userService;
    private final CitizenChatContextService citizenChatContextService;

    @Value("${ai.internal.token:${internal.api.token:}}")
    private String internalToken;

    public AIClientService(AIServiceProperties properties, @Lazy UserService userService, @Lazy CitizenChatContextService citizenChatContextService) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000); // 5 seconds connect timeout
        requestFactory.setReadTimeout(45000);   // 45 seconds read timeout for LLM & heavy models
        this.restTemplate = new RestTemplate(requestFactory);
        this.properties = properties;
        this.userService = userService;
        this.citizenChatContextService = citizenChatContextService;
    }

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (internalToken != null && !internalToken.trim().isEmpty()) {
            headers.set("X-Internal-Token", internalToken.trim());
        }
        try {
            if (userService != null) {
                com.aram.legalaid.model.User user = userService.currentUser();
                if (user != null) {
                    headers.set("X-User-Id", user.getId().toString());
                    headers.set("X-User-Role", user.getRole().name());
                    headers.set("X-User-District", user.getDistrict() != null ? user.getDistrict() : "Coimbatore");
                }
            }
        } catch (Exception e) {
            headers.set("X-User-Id", "ANONYMOUS");
            headers.set("X-User-Role", "CITIZEN");
            headers.set("X-User-District", "Coimbatore");
        }
        return headers;
    }

    private <T> T executeWithRetry(String endpoint, java.util.function.Supplier<T> action) {
        int maxAttempts = 3;
        int attempt = 0;
        while (true) {
            try {
                attempt++;
                return action.get();
            } catch (ResourceAccessException e) {
                if (attempt >= maxAttempts) {
                    System.err.println("FastAPI connection failed/timed out on " + endpoint + " after " + attempt + " attempts: " + e.getMessage());
                    throw e;
                }
                System.out.println("Transient ResourceAccess error calling " + endpoint + ", retrying attempt " + attempt + "...");
                try {
                    Thread.sleep(150 * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Retry interrupted", ie);
                }
            } catch (HttpServerErrorException e) {
                if (attempt >= maxAttempts) {
                    System.err.println("FastAPI 5xx Server Error on " + endpoint + " after " + attempt + " attempts: " + e.getMessage());
                    throw e;
                }
                System.out.println("Transient HTTP 5xx error calling " + endpoint + ", retrying attempt " + attempt + "...");
                try {
                    Thread.sleep(150 * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Retry interrupted", ie);
                }
            }
        }
    }

    private String getDetailedErrorMsg(String method, Exception e) {
        if (e instanceof ResourceAccessException) {
            return "Connection timeout / refused calling AI Service (" + method + "): " + e.getMessage();
        } else if (e instanceof HttpClientErrorException) {
            HttpClientErrorException ex = (HttpClientErrorException) e;
            return "AI Service returned client error 4xx (" + method + ", Code: " + ex.getStatusCode() + "): " + ex.getResponseBodyAsString();
        } else if (e instanceof HttpServerErrorException) {
            HttpServerErrorException ex = (HttpServerErrorException) e;
            return "AI Service returned server error 5xx (" + method + ", Code: " + ex.getStatusCode() + "): " + ex.getResponseBodyAsString();
        } else {
            return "AI Service call failed (" + method + "): " + e.getMessage();
        }
    }

    public AiTriageResponse analyzeComplaint(String complaintId, Long citizenId, String regionId, String title, String description, String language, String district, boolean isSensitive, String preferredGender, List<Map<String, Object>> existingComplaints) {
        String url = properties.getUrl() + "/complaint/analyze";
        try {
            Map<String, Object> payload = new HashMap<>();
            String fullText = (description != null && !description.isEmpty()) ? description : (title != null ? title : "");
            payload.put("complaintText", fullText);
            payload.put("title", title != null ? title : "");
            payload.put("description", description != null ? description : "");
            payload.put("language", language != null ? language : "en");
            payload.put("languageHint", language != null ? language : "en");
            payload.put("district", district != null ? district : "Coimbatore");
            payload.put("area", "");
            payload.put("sensitive", isSensitive);
            payload.put("preferredLegalGuideGender", preferredGender != null ? preferredGender : "ANY");
            payload.put("existingComplaints", existingComplaints != null ? existingComplaints : List.of());
            payload.put("complaintId", complaintId);
            payload.put("citizenId", citizenId);
            payload.put("regionId", regionId);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, getHeaders());
            return restTemplate.postForObject(url, entity, AiTriageResponse.class);
        } catch (Exception e) {
            String errorMsg = getDetailedErrorMsg("analyzeComplaint", e);
            System.err.println(errorMsg);
            throw new RuntimeException("AI Triage service is currently offline or failed. Please try again later. Details: " + errorMsg, e);
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> askChatbot(AiChatRequest request) {
        String url = properties.getUrl() + "/chat/ask";
        try {
            CitizenChatContextDTO ctx = citizenChatContextService != null
                    ? citizenChatContextService.buildContext(
                            request.message(),
                            request.complaintId(),
                            request.complaintCustomId()
                    )
                    : null;
            AiChatRequest enrichedRequest = new AiChatRequest(
                    request.message(),
                    request.language(),
                    request.userRole(),
                    request.complaintId(),
                    request.complaintCustomId(),
                    request.conversationId(),
                    request.sessionId(),
                    ctx
            );
            HttpEntity<AiChatRequest> entity = new HttpEntity<>(enrichedRequest, getHeaders());
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return (Map<String, Object>) response.getBody();
        } catch (Exception e) {
            String errorMsg = getDetailedErrorMsg("askChatbot", e);
            System.err.println(errorMsg);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("reply", "I am sorry, the AI service is currently undergoing maintenance. Please reach out to your local helper. This is preliminary legal aid guidance only.");
            fallback.put("answer", "I am sorry, the AI service is currently undergoing maintenance. Please reach out to your local helper. This is preliminary legal aid guidance only.");
            fallback.put("category", "GENERAL_LEGAL_AID");
            fallback.put("confidence", 0.0);
            fallback.put("suggestedActions", List.of("Retry connection", "Consult counselor"));
            fallback.put("disclaimer", "This is preliminary legal aid guidance only.");
            fallback.put("is_conversational", false);
            return fallback;
        }
    }

    public Map<String, Object> ocrDocument(MultipartFile file) {
        String url = properties.getUrl() + "/documents/ocr";
        try {
            HttpHeaders headers = getHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", getFileResource(file));

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println(getDetailedErrorMsg("ocrDocument", e));
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
            HttpHeaders headers = getHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", getFileResource(file));
            body.add("expectedDocumentType", expectedType);
            body.add("complaintCategory", category);

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<AiDocumentVerifyResponse> response = restTemplate.postForEntity(url, entity, AiDocumentVerifyResponse.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println(getDetailedErrorMsg("verifyDocument", e));
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

    public List<Map<String, Object>> recommendVolunteers(String complaintId, String category, String language, boolean preferWoman, String district, List<Map<String, Object>> volunteers) {
        String url = properties.getUrl() + "/recommend/volunteer";
        try {
            Map<String, Object> payload = Map.of(
                "complaintId", complaintId != null ? complaintId : "",
                "category", category,
                "language", language != null ? language : "en",
                "preferWomanVolunteer", preferWoman,
                "district", district != null ? district : "Coimbatore",
                "volunteers", volunteers
            );
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, getHeaders());
            return restTemplate.postForObject(url, entity, List.class);
        } catch (Exception e) {
            System.err.println(getDetailedErrorMsg("recommendVolunteers", e));
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> askCaseAssistant(Map<String, Object> body) {
        String url = properties.getUrl() + "/ai/case-assistant";
        try {
            Map<String, Object> enrichedBody = new HashMap<>(body);
            if (!enrichedBody.containsKey("citizenContext") && citizenChatContextService != null) {
                String msg = (String) enrichedBody.getOrDefault("message", enrichedBody.getOrDefault("query", enrichedBody.getOrDefault("userQuery", "")));
                Long complaintId = null;
                if (enrichedBody.get("complaintId") instanceof Number n) {
                    complaintId = n.longValue();
                }
                String customId = (String) enrichedBody.get("caseId");
                CitizenChatContextDTO ctx = citizenChatContextService.buildContext(msg, complaintId, customId);
                enrichedBody.put("citizenContext", ctx);
            }
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(enrichedBody, getHeaders());
            ResponseEntity<Map> response = executeWithRetry("askCaseAssistant", () -> restTemplate.postForEntity(url, entity, Map.class));
            return response.getBody() != null ? response.getBody() : Map.of();
        } catch (Exception e) {
            System.err.println("Error calling AI Case Assistant: " + e.getMessage());
            return Map.of(
                "answer", "Our AI legal assistant is temporarily processing. Please try sending your query again in a moment.",
                "reply", "Our AI legal assistant is temporarily processing. Please try sending your query again in a moment.",
                "grounded", false,
                "provider", "error_retry",
                "citations", List.of()
            );
        }
    }

    public Map<String, Object> transcribeSpeech(MultipartFile file, String selectedLanguage) {
        String url = properties.getUrl() + "/voice/transcribe";
        try {
            HttpHeaders headers = getHeaders();
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
            System.err.println(getDetailedErrorMsg("transcribeSpeech", e));
            return Map.of("transcript", "Speech transcription failed. Please check microphone connection or type manually.", "confidence", 0.0);
        }
    }

    public Map<String, Object> detectLanguage(String text) {
        String url = properties.getUrl() + "/language/detect";
        try {
            Map<String, Object> payload = Map.of("text", text);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, getHeaders());
            return executeWithRetry("detectLanguage", () -> restTemplate.postForObject(url, entity, Map.class));
        } catch (Exception e) {
            System.err.println(getDetailedErrorMsg("detectLanguage", e));
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
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, getHeaders());
            return executeWithRetry("translateText", () -> restTemplate.postForObject(url, entity, Map.class));
        } catch (Exception e) {
            System.err.println(getDetailedErrorMsg("translateText", e));
            return Map.of("originalText", text, "translatedText", text);
        }
    }

    public Map<String, Object> normalizeText(String text) {
        String url = properties.getUrl() + "/language/normalize";
        try {
            Map<String, Object> payload = Map.of("text", text);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, getHeaders());
            return executeWithRetry("normalizeText", () -> restTemplate.postForObject(url, entity, Map.class));
        } catch (Exception e) {
            System.err.println(getDetailedErrorMsg("normalizeText", e));
            return Map.of("originalText", text, "normalizedText", text);
        }
    }

    public Map<String, Object> getSpeechStatus() {
        String url = properties.getUrl() + "/speech/status";
        try {
            HttpHeaders headers = getHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println(getDetailedErrorMsg("getSpeechStatus", e));
            return Map.of("modelLoaded", false, "modelSize", "base", "device", "cpu");
        }
    }

    public void syncComplaint(String complaintId, String status, String assignedGuideId, String assignedGuideName, String note) {
        syncComplaint(complaintId, status, assignedGuideId, assignedGuideName, note, null);
    }

    public void syncComplaint(String complaintId, String status, String assignedGuideId, String assignedGuideName, String note, Boolean guideRequested) {
        String url = properties.getUrl() + "/complaint/sync";
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("complaintId", complaintId);
            payload.put("status", status);
            if (assignedGuideId != null) payload.put("assignedGuideId", assignedGuideId);
            if (assignedGuideName != null) payload.put("assignedGuideName", assignedGuideName);
            if (note != null) payload.put("note", note);
            if (guideRequested != null) payload.put("guideRequested", guideRequested);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, getHeaders());
            restTemplate.postForObject(url, entity, Map.class);
        } catch (Exception e) {
            System.err.println("Failed to sync complaint status to FastAPI: " + e.getMessage());
        }
    }

    public void syncResolvedComplaint(String complaintId, String status, String assignedGuideId, String assignedGuideName, String complexity, Double resolutionTime, Double feedbackScore, String outcome) {
        String url = properties.getUrl() + "/complaint/sync";
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("complaintId", complaintId);
            payload.put("status", status);
            if (assignedGuideId != null) payload.put("assignedGuideId", assignedGuideId);
            if (assignedGuideName != null) payload.put("assignedGuideName", assignedGuideName);
            if (complexity != null) payload.put("complexity", complexity);
            if (resolutionTime != null) payload.put("resolutionTime", resolutionTime);
            if (feedbackScore != null) payload.put("feedbackScore", feedbackScore);
            if (outcome != null) payload.put("resolutionOutcome", outcome);
            payload.put("note", "Case completed");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, getHeaders());
            restTemplate.postForObject(url, entity, Map.class);
        } catch (Exception e) {
            System.err.println("Failed to sync resolved complaint to FastAPI: " + e.getMessage());
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
