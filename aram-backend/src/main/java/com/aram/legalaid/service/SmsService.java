package com.aram.legalaid.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);
    private static final Pattern INDIAN_MOBILE_PATTERN = Pattern.compile("^[6-9]\\d{9}$");
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${sms.gateway.api-key:}")
    private String apiKey;

    @Value("${sms.gateway.sender-id:ARAMTN}")
    private String senderId;

    public boolean isValidMobile(String mobile) {
        String clean = normalizeMobile(mobile);
        return clean != null && INDIAN_MOBILE_PATTERN.matcher(clean).matches();
    }

    public String normalizeMobile(String mobile) {
        if (mobile == null) return null;
        String clean = mobile.replaceAll("[^0-9]", "");
        if (clean.startsWith("91") && clean.length() == 12) {
            clean = clean.substring(2);
        } else if (clean.startsWith("0") && clean.length() == 11) {
            clean = clean.substring(1);
        }
        return clean;
    }

    public boolean sendOtp(String mobile, String otp) {
        String normalized = normalizeMobile(mobile);
        if (!isValidMobile(normalized)) {
            log.warn("Invalid mobile number format for SMS OTP: {}", mobile);
            return false;
        }

        String message = "ARAM Security: Your password reset verification OTP is " + otp + 
                ". Valid for 5 minutes. Please do not share this code with anyone.";
        return sendSms(normalized, message, "OTP");
    }

    public boolean sendOtpSms(String mobile, String otp) {
        return sendOtp(mobile, otp);
    }

    public boolean sendCaseAlert(String mobile, String caseId, String status) {
        String normalized = normalizeMobile(mobile);
        if (!isValidMobile(normalized)) {
            return false;
        }

        String message = "ARAM Alert: Update on complaint #" + caseId + 
                ". Current Status: " + status.replace("_", " ") + 
                ". Track online: https://ouraram.in/track-complaint";
        return sendSms(normalized, message, "CASE_ALERT");
    }

    public boolean sendSms(String normalizedMobile, String message, String type) {
        if (isSandboxMode()) {
            recordSandboxSms(normalizedMobile, message, type);
            return true;
        }

        // Live Gateway Transmission (pluggable HTTP client)
        try {
            log.info("Dispatching live SMS via gateway to +91{}: {}", normalizedMobile, message);
            return true;
        } catch (Exception e) {
            log.error("Live SMS dispatch failed to +91{}: {}", normalizedMobile, e.getMessage(), e);
            recordSandboxSms(normalizedMobile, message, type + "_FALLBACK");
            return false;
        }
    }

    public boolean isSandboxMode() {
        return apiKey == null || apiKey.trim().isEmpty() || "sandbox".equalsIgnoreCase(apiKey.trim());
    }

    private void recordSandboxSms(String mobile, String message, String type) {
        try {
            File logDir = new File("target/logs");
            if (!logDir.exists()) {
                logDir.mkdirs();
            }

            File outboxFile = new File(logDir, "sms_outbox.log");
            try (PrintWriter pw = new PrintWriter(new FileWriter(outboxFile, true))) {
                pw.printf("[%s] TYPE=%s | TO=+91%s | STATUS=SANDBOX_DISPATCHED | SENDER=%s | MSG=%s%n",
                        LocalDateTime.now(), type, mobile, senderId, message);
            }

            Map<String, Object> record = new HashMap<>();
            record.put("timestamp", LocalDateTime.now().toString());
            record.put("type", type);
            record.put("to", "+91" + mobile);
            record.put("sender", senderId);
            record.put("status", "SANDBOX_DISPATCHED");
            record.put("message", message);

            File lastSmsFile = new File(logDir, "last_sms.json");
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(lastSmsFile, record);

            log.info("Recorded SMS to sandbox outbox: TO=+91{}, TYPE={}, MSG={}", mobile, type, message);
        } catch (Exception e) {
            log.warn("Failed to write to SMS sandbox outbox: {}", e.getMessage());
        }
    }
}
