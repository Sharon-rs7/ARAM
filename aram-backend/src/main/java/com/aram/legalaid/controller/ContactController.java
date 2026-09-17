package com.aram.legalaid.controller;

import com.aram.legalaid.service.EmailService;
import com.aram.legalaid.service.MongoLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
public class ContactController {

    @Autowired
    private EmailService emailService;

    @Autowired(required = false)
    private MongoLogService mongoLogService;

    @PostMapping("/contact")
    public ResponseEntity<Map<String, Object>> handleContactForm(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String subject = body.get("subject");
        String message = body.get("message");

        if (name == null || email == null || message == null ||
                name.trim().isEmpty() || email.trim().isEmpty() || message.trim().isEmpty()) {
            Map<String, Object> errorRes = new HashMap<>();
            errorRes.put("success", false);
            errorRes.put("message", "Name, email, and message are required.");
            return ResponseEntity.badRequest().body(errorRes);
        }

        String finalSubject = (subject == null || subject.trim().isEmpty()) ? "General Inquiry" : subject;

        // 1. Persist to MongoDB so message is never lost
        if (mongoLogService != null) {
            Map<String, Object> logData = new HashMap<>();
            logData.put("name", name.trim());
            logData.put("email", email.trim());
            logData.put("subject", finalSubject.trim());
            logData.put("message", message.trim());
            logData.put("timestamp", java.time.Instant.now().toString());
            mongoLogService.log("contact_inquiries", logData);
        }

        // 2. Dispatch Email asynchronously
        try {
            emailService.sendContactSupportEmail(email.trim(), name.trim(), finalSubject.trim(), message.trim());
        } catch (Exception e) {
            // Async email failure must not drop response
        }

        Map<String, Object> successRes = new HashMap<>();
        successRes.put("success", true);
        successRes.put("message", "Message sent successfully! We will get back to you soon.");
        return ResponseEntity.ok(successRes);
    }
}
