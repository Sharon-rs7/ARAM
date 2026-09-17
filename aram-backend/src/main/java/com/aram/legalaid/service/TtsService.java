package com.aram.legalaid.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Map;
import java.util.HashMap;
import java.util.Base64;

import java.util.List;
import java.util.ArrayList;
import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class TtsService {

    @Value("${app.tts.provider:BROWSER_FALLBACK}")
    private String ttsProvider;

    @Value("${app.tts.google.api-key:}")
    private String googleApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public byte[] generateTts(String text, String lang) {
        String provider = ttsProvider == null ? "BROWSER_FALLBACK" : ttsProvider.toUpperCase();
        if ("GOOGLE_CLOUD".equals(provider) && googleApiKey != null && !googleApiKey.trim().isEmpty()) {
            byte[] googleAudio = generateGoogleCloudTts(text, mapLanguageToLocale(lang));
            if (googleAudio != null && googleAudio.length > 0) {
                return googleAudio;
            }
        }
        // Fallback: Free translate TTS service to ensure Tamil/Hindi output works natively on all machines/browsers
        return generateFreeGoogleTts(text, mapLanguageToLocale(lang));
    }

    private byte[] generateFreeGoogleTts(String text, String locale) {
        try {
            String lang = locale.split("-")[0];
            List<String> chunks = splitTextIntoChunks(text, 150);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            
            for (String chunk : chunks) {
                if (chunk.trim().isEmpty()) continue;
                String encodedText = URLEncoder.encode(chunk.trim(), StandardCharsets.UTF_8.name());
                String url = "https://translate.google.com/translate_tts?ie=UTF-8&tl=" + lang + "&client=tw-ob&q=" + encodedText;
                
                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36");
                HttpEntity<Void> entity = new HttpEntity<>(headers);
                
                org.springframework.http.ResponseEntity<byte[]> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    byte[].class
                );
                
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    outputStream.write(response.getBody());
                }
                Thread.sleep(100);
            }
            
            byte[] result = outputStream.toByteArray();
            return result.length > 0 ? result : null;
        } catch (Exception e) {
            System.err.println("[TTS SERVICE] Free Google Translate Text-To-Speech failed: " + e.getMessage());
        }
        return null;
    }

    private List<String> splitTextIntoChunks(String text, int maxLength) {
        List<String> chunks = new ArrayList<>();
        int length = text.length();
        int start = 0;
        while (start < length) {
            int end = Math.min(start + maxLength, length);
            if (end < length) {
                int lastSpace = text.lastIndexOf(' ', end);
                if (lastSpace > start) {
                    end = lastSpace;
                }
            }
            chunks.add(text.substring(start, end));
            start = end;
        }
        return chunks;
    }

    private String mapLanguageToLocale(String lang) {
        if (lang == null) return "en-IN";
        String l = lang.toLowerCase().trim();
        if (l.contains("tamil") || l.equals("ta") || l.equals("ta-in") || l.equals("ta-en")) {
            return "ta-IN";
        } else if (l.contains("hindi") || l.equals("hi") || l.equals("hi-in") || l.equals("hi-en")) {
            return "hi-IN";
        } else {
            return "en-IN";
        }
    }

    private byte[] generateGoogleCloudTts(String text, String locale) {
        try {
            String url = "https://texttospeech.googleapis.com/v1/text:synthesize?key=" + googleApiKey;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> input = new HashMap<>();
            input.put("text", text);

            Map<String, Object> voice = new HashMap<>();
            voice.put("languageCode", locale);
            voice.put("ssmlGender", "NEUTRAL");

            Map<String, Object> audioConfig = new HashMap<>();
            audioConfig.put("audioEncoding", "MP3");

            Map<String, Object> payload = new HashMap<>();
            payload.put("input", input);
            payload.put("voice", voice);
            payload.put("audioConfig", audioConfig);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

            if (response != null && response.containsKey("audioContent")) {
                String audioContentBase64 = (String) response.get("audioContent");
                return Base64.getDecoder().decode(audioContentBase64);
            }
        } catch (Exception e) {
            System.err.println("[TTS SERVICE] Google Cloud Text-To-Speech request failed: " + e.getMessage());
        }
        return null;
    }
}
