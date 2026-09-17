package com.aram.legalaid.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

@Service
public class SmsService {

    @Value("${app.sms.provider:MOCK}")
    private String smsProvider;

    @Value("${app.sms.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${app.sms.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${app.sms.twilio.phone-number:}")
    private String twilioPhoneNumber;

    @Value("${app.sms.msg91.auth-key:}")
    private String msg91AuthKey;

    @Value("${app.sms.msg91.sender-id:ARAMSMS}")
    private String msg91SenderId;

    @Value("${app.sms.msg91.template-id:}")
    private String msg91TemplateId;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOtpSms(String mobile, String otp) {
        String message = "Your ARAM verification OTP code is: " + otp + ". This code is valid for 5 minutes.";
        sendSms(mobile, message, otp);
    }

    public void sendNotificationSms(String mobile, String message) {
        sendSms(mobile, message, null);
    }

    private void sendSms(String mobile, String message, String otp) {
        String provider = smsProvider == null ? "MOCK" : smsProvider.toUpperCase();
        System.out.println("[SMS SERVICE] Routing SMS via provider: " + provider + " to mobile: " + mobile);

        if ("TWILIO".equals(provider)) {
            sendViaTwilio(mobile, message);
        } else if ("MSG91".equals(provider)) {
            sendViaMsg91(mobile, otp);
        } else {
            sendViaMock(mobile, message);
        }
    }

    private void sendViaTwilio(String mobile, String message) {
        if (twilioAccountSid.isEmpty() || twilioAuthToken.isEmpty() || twilioPhoneNumber.isEmpty()) {
            System.err.println("[SMS SERVICE] Twilio credentials missing. Falling back to MOCK log.");
            sendViaMock(mobile, message);
            return;
        }

        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(twilioAccountSid, twilioAuthToken);

            String body = "To=" + mobile + "&From=" + twilioPhoneNumber + "&Body=" + java.net.URLEncoder.encode(message, "UTF-8");
            HttpEntity<String> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, request, String.class);
            System.out.println("[SMS SERVICE] SMS sent successfully via Twilio to " + mobile);
        } catch (Exception e) {
            System.err.println("[SMS SERVICE] Twilio dispatch failed: " + e.getMessage());
        }
    }

    private void sendViaMsg91(String mobile, String otp) {
        if (msg91AuthKey.isEmpty() || msg91TemplateId.isEmpty()) {
            System.err.println("[SMS SERVICE] Msg91 credentials missing. Falling back to MOCK log.");
            sendViaMock(mobile, "OTP Code: " + otp);
            return;
        }

        try {
            String url = "https://api.msg91.com/api/v5/otp?template_id=" + msg91TemplateId + "&mobile=" + mobile + "&authkey=" + msg91AuthKey;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            if (otp != null) {
                body.put("otp", otp);
            }
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, request, String.class);
            System.out.println("[SMS SERVICE] OTP SMS sent successfully via Msg91 to " + mobile);
        } catch (Exception e) {
            System.err.println("[SMS SERVICE] Msg91 dispatch failed: " + e.getMessage());
        }
    }

    private void sendViaMock(String mobile, String message) {
        String logLine = "[MOCK SMS] To: " + mobile + " | Message: " + message;
        System.out.println(logLine);

        String path = "C:/Users/Sharon/.gemini/antigravity/brain/a7b001b8-4fd1-4569-8080-8e19f6bab6ed/scratch/last_sms_otp.txt";
        try (FileWriter writer = new FileWriter(path, false)) {
            writer.write(message);
            System.out.println("[SMS SERVICE] Logged SMS code to " + path);
        } catch (IOException e) {
            System.err.println("[SMS SERVICE] Failed to write mock SMS log: " + e.getMessage());
        }
    }
}
