package com.aram.legalaid.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class WhatsAppService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppService.class);

    @Value("${whatsapp.enabled:true}")
    private boolean whatsappEnabled;

    @Value("${whatsapp.phone-number-id:}")
    private String phoneNumberId;

    @Value("${whatsapp.access-token:}")
    private String accessToken;

    @Value("${whatsapp.api-version:v20.0}")
    private String apiVersion;

    @Value("${whatsapp.base-url:https://graph.facebook.com}")
    private String baseUrl;

    private final RestTemplate restTemplate;

    public WhatsAppService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Sends a direct text message via WhatsApp.
     */
    public boolean sendTextMessage(String recipientMobile, String message) {
        if (!whatsappEnabled) {
            log.info("[WHATSAPP DISABLED] Skipping WhatsApp message to {}", recipientMobile);
            return false;
        }

        String formattedMobile = normalizePhoneNumber(recipientMobile);

        if (isSandboxMode()) {
            recordOutbox("TEXT", formattedMobile, message, null, null);
            log.info("[WHATSAPP SANDBOX] Text sent to {}: {}", formattedMobile, message);
            return true;
        }

        try {
            String url = String.format("%s/%s/%s/messages", baseUrl, apiVersion, phoneNumberId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            Map<String, Object> body = new HashMap<>();
            body.put("messaging_product", "whatsapp");
            body.put("recipient_type", "individual");
            body.put("to", formattedMobile);
            body.put("type", "text");
            body.put("text", Map.of("body", message));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            recordOutbox("TEXT", formattedMobile, message, response.getStatusCode().toString(), response.getBody());
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.error("[WHATSAPP API ERROR] Failed to send text message to {}: {}", formattedMobile, e.getMessage());
            recordOutbox("TEXT", formattedMobile, message, "FAILED", e.getMessage());
            return false;
        }
    }

    /**
     * Sends a pre-approved Meta Utility Template message.
     */
    public boolean sendTemplateMessage(String recipientMobile, String templateName, String langCode, List<String> parameters) {
        if (!whatsappEnabled) return false;

        String formattedMobile = normalizePhoneNumber(recipientMobile);
        String paramSummary = String.join(" | ", parameters);

        if (isSandboxMode()) {
            recordOutbox("TEMPLATE:" + templateName, formattedMobile, paramSummary, null, null);
            log.info("[WHATSAPP SANDBOX] Template [{}] sent to {}: {}", templateName, formattedMobile, paramSummary);
            return true;
        }

        try {
            String url = String.format("%s/%s/%s/messages", baseUrl, apiVersion, phoneNumberId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            List<Map<String, String>> componentParams = new ArrayList<>();
            for (String param : parameters) {
                componentParams.add(Map.of("type", "text", "text", param));
            }

            Map<String, Object> body = new HashMap<>();
            body.put("messaging_product", "whatsapp");
            body.put("to", formattedMobile);
            body.put("type", "template");

            Map<String, Object> templateObj = new HashMap<>();
            templateObj.put("name", templateName);
            templateObj.put("language", Map.of("code", langCode != null ? langCode : "en"));
            templateObj.put("components", List.of(Map.of("type", "body", "parameters", componentParams)));
            body.put("template", templateObj);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            recordOutbox("TEMPLATE:" + templateName, formattedMobile, paramSummary, response.getStatusCode().toString(), response.getBody());
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.error("[WHATSAPP API ERROR] Failed to send template message to {}: {}", formattedMobile, e.getMessage());
            recordOutbox("TEMPLATE:" + templateName, formattedMobile, paramSummary, "FAILED", e.getMessage());
            return false;
        }
    }

    /**
     * Sends a PDF document message to the citizen via WhatsApp.
     */
    public boolean sendDocumentMessage(String recipientMobile, byte[] pdfBytes, String filename, String caption) {
        if (!whatsappEnabled) return false;

        String formattedMobile = normalizePhoneNumber(recipientMobile);

        if (isSandboxMode()) {
            recordOutbox("DOCUMENT:" + filename, formattedMobile, caption + " (" + (pdfBytes != null ? pdfBytes.length : 0) + " bytes)", "SANDBOX_OK", null);
            log.info("[WHATSAPP SANDBOX] Document [{}] ({} bytes) dispatched to {}: {}", 
                    filename, pdfBytes != null ? pdfBytes.length : 0, formattedMobile, caption);
            return true;
        }

        try {
            // Step 1: Upload media to Meta WhatsApp Cloud API
            String uploadUrl = String.format("%s/%s/%s/media", baseUrl, apiVersion, phoneNumberId);

            HttpHeaders uploadHeaders = new HttpHeaders();
            uploadHeaders.setContentType(MediaType.MULTIPART_FORM_DATA);
            uploadHeaders.setBearerAuth(accessToken);

            MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
            form.add("messaging_product", "whatsapp");
            form.add("type", "application/pdf");

            ByteArrayResource fileResource = new ByteArrayResource(pdfBytes, filename);
            form.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> uploadEntity = new HttpEntity<>(form, uploadHeaders);
            ResponseEntity<Map> uploadResponse = restTemplate.postForEntity(uploadUrl, uploadEntity, Map.class);

            String mediaId = null;
            if (uploadResponse.getBody() != null && uploadResponse.getBody().containsKey("id")) {
                mediaId = uploadResponse.getBody().get("id").toString();
            }

            if (mediaId == null) {
                throw new IllegalStateException("Failed to retrieve mediaId from Meta Cloud API upload");
            }

            // Step 2: Send document message using media ID
            String messageUrl = String.format("%s/%s/%s/messages", baseUrl, apiVersion, phoneNumberId);

            HttpHeaders msgHeaders = new HttpHeaders();
            msgHeaders.setContentType(MediaType.APPLICATION_JSON);
            msgHeaders.setBearerAuth(accessToken);

            Map<String, Object> documentObj = new HashMap<>();
            documentObj.put("id", mediaId);
            documentObj.put("filename", filename);
            documentObj.put("caption", caption);

            Map<String, Object> body = new HashMap<>();
            body.put("messaging_product", "whatsapp");
            body.put("recipient_type", "individual");
            body.put("to", formattedMobile);
            body.put("type", "document");
            body.put("document", documentObj);

            HttpEntity<Map<String, Object>> msgEntity = new HttpEntity<>(body, msgHeaders);
            ResponseEntity<String> msgResponse = restTemplate.postForEntity(messageUrl, msgEntity, String.class);

            recordOutbox("DOCUMENT:" + filename, formattedMobile, caption, msgResponse.getStatusCode().toString(), msgResponse.getBody());
            return msgResponse.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.error("[WHATSAPP DOCUMENT ERROR] Failed to send PDF to {}: {}", formattedMobile, e.getMessage());
            recordOutbox("DOCUMENT:" + filename, formattedMobile, caption, "FAILED", e.getMessage());
            return false;
        }
    }

    public boolean isSandboxMode() {
        return phoneNumberId == null || phoneNumberId.isBlank() || 
               accessToken == null || accessToken.isBlank() || 
               accessToken.startsWith("DUMMY_") || accessToken.startsWith("TODO_");
    }

    private String normalizePhoneNumber(String phone) {
        if (phone == null) return "";
        String clean = phone.replaceAll("[^0-9]", "");
        if (clean.length() == 10) {
            return "91" + clean;
        }
        return clean;
    }

    private void recordOutbox(String type, String to, String content, String status, String rawResponse) {
        try {
            Path logDir = Path.of("target", "logs");
            Files.createDirectories(logDir);

            String logLine = String.format("[%s] TYPE=%s | TO=%s | STATUS=%s | CONTENT=%s%n",
                    LocalDateTime.now(), type, to, status != null ? status : "SANDBOX_DISPATCHED", content);
            Files.writeString(logDir.resolve("whatsapp_outbox.log"), logLine,
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND);

            String json = String.format(
                    "{\"timestamp\":\"%s\",\"type\":\"%s\",\"to\":\"%s\",\"status\":\"%s\",\"content\":\"%s\"}",
                    LocalDateTime.now(), type, to, 
                    status != null ? status : "SANDBOX_DISPATCHED",
                    content != null ? content.replace("\"", "\\\"").replace("\n", " ") : "");
            Files.writeString(logDir.resolve("last_whatsapp.json"), json);
        } catch (Exception ignored) {}
    }

    private static class ByteArrayResource extends org.springframework.core.io.ByteArrayResource {
        private final String filename;

        public ByteArrayResource(byte[] byteArray, String filename) {
            super(byteArray);
            this.filename = filename;
        }

        @Override
        public String getFilename() {
            return this.filename;
        }
    }
}
