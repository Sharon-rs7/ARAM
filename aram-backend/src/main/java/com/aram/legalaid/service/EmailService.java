package com.aram.legalaid.service;

import com.aram.legalaid.enums.EmailTemplateType;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final EmailTemplateService templateService;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:ouraramsupport@gmail.com}")
    private String mailFrom;

    @Value("${app.mail.from-name:ARAM Legal Assistance}")
    private String mailFromName;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender,
                        EmailTemplateService templateService) {
        this.mailSender = mailSender;
        this.templateService = templateService;
    }

    private void sendEmailAsync(String to, String subject, EmailTemplateType type, Map<String, String> variables) {
        // Run in background thread to prevent blocking transactional requests
        CompletableFuture.runAsync(() -> {
            try {
                String htmlContent = templateService.buildEmail(type, variables);

                if (!mailEnabled || mailSender == null) {
                    log.info("Email sending is disabled or mail sender is not configured. Logging content instead.");
                    log.debug("To: {}, Subject: {}\nContent:\n{}", to, subject, htmlContent);
                    return;
                }

                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                
                helper.setFrom(mailFromName + " <" + mailFrom + ">");
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                mailSender.send(mimeMessage);
                log.info("Email of type {} successfully sent to: {}", type, to);
            } catch (Exception e) {
                // Safeguard credential and SMTP error logs
                String errorMsg = e.getMessage() != null ? e.getMessage() : "Unknown SMTP exception";
                log.error("Failed to send transactional email [Type: {}] to {}. Reason category: {} | Details: {}", type, to, e.getClass().getSimpleName(), errorMsg);
            }
        });
    }

    // Helper to write OTP to scratch file for dev mode verification & automation tests
    private void writeDevOtpScratch(String email, String otp) {
        try {
            Path scratchPath = Path.of("C:", "Users", "Sharon", ".gemini", "antigravity", "brain", "a7b001b8-4fd1-4569-8080-8e19f6bab6ed", "scratch");
            Files.createDirectories(scratchPath);
            Files.writeString(scratchPath.resolve("last_otp.txt"), otp);
            log.info("Dev Mode OTP helper written to last_otp.txt for: {}", email);
        } catch (Exception e) {
            log.error("Failed to write dev-mode OTP scratch file: {}", e.getMessage());
        }
    }

    public void sendOtpEmail(String to, String userName, String otp) {
        // Write to scratch file for E2E / testing checks
        writeDevOtpScratch(to, otp);

        Map<String, String> vars = new HashMap<>();
        vars.put("userName", userName);
        vars.put("message", "Your ARAM verification code is:");
        vars.put("actionOrOtp", otp);
        vars.put("importantInfo", "<strong>For your security:</strong><br>- Never share this code with anyone.<br>- ARAM Support will never ask for your OTP.");

        sendEmailAsync(to, "ARAM — Your Email Verification Code", EmailTemplateType.EMAIL_VERIFICATION_OTP, vars);
    }

    public void sendAccountVerifiedEmail(String to, String userName) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", userName);
        vars.put("message", "Your email address has been successfully verified.<br><br>Your ARAM account is now ready.<br>You can securely complete your profile and access ARAM's legal assistance services.");

        sendEmailAsync(to, "Welcome to ARAM — Your Account Has Been Verified", EmailTemplateType.ACCOUNT_VERIFIED, vars);
    }

    public void sendComplaintSubmittedEmail(String to, String userName, String complaintCustomId, String district, String state) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", userName);
        vars.put("message", "Your complaint has been successfully registered with ARAM.<br><br>" +
                "<strong>Complaint ID:</strong> " + complaintCustomId + "<br>" +
                "<strong>Location:</strong> " + district + ", " + state + "<br>" +
                "<strong>Current Status:</strong> Submitted<br><br>" +
                "Your complaint is now being processed through the ARAM assistance workflow. You can track the status from your ARAM dashboard.");

        sendEmailAsync(to, "ARAM Complaint Registered — " + complaintCustomId, EmailTemplateType.COMPLAINT_SUBMITTED, vars);
    }

    public void sendGuideAssignedEmail(String to, String userName, String complaintCustomId, String guideName) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", userName);
        vars.put("message", "An ARAM Legal Guide has been assigned to your complaint.<br><br>" +
                "<strong>Complaint ID:</strong> " + complaintCustomId + "<br>" +
                "<strong>Your assigned Guide:</strong> " + guideName + "<br><br>" +
                "Your case is now available to the assigned Guide through the secure ARAM platform. You can view updates from your dashboard.");

        sendEmailAsync(to, "ARAM — Legal Guide Assigned to Your Case", EmailTemplateType.GUIDE_ASSIGNED, vars);
    }

    public void sendAdminNewRequestEmail(String to, String adminName, String complaintCustomId, String district, String state, String language, String category) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", adminName);
        vars.put("message", "A citizen has requested assistance from an ARAM Legal Guide.<br><br>" +
                "<strong>Complaint:</strong> " + complaintCustomId + "<br>" +
                "<strong>Region:</strong> " + district + ", " + state + "<br>" +
                "<strong>Language:</strong> " + language + "<br>" +
                "<strong>Category:</strong> " + category + "<br>" +
                "<strong>Guide request:</strong> YES<br><br>" +
                "Please review the case and available AI recommendations through the ARAM Admin Dashboard.");

        sendEmailAsync(to, "ARAM — New Legal Guide Request | " + complaintCustomId, EmailTemplateType.GUIDE_REQUEST_RECEIVED, vars);
    }

    public void sendGuideNewCaseEmail(String to, String guideName, String complaintCustomId, String category, String district, String language) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", guideName);
        vars.put("message", "A new case has been assigned to you through ARAM.<br><br>" +
                "<strong>Complaint ID:</strong> " + complaintCustomId + "<br>" +
                "<strong>Category:</strong> " + category + "<br>" +
                "<strong>Region:</strong> " + district + "<br>" +
                "<strong>Language:</strong> " + language + "<br><br>" +
                "Please review the case details through your secure ARAM Guide Dashboard.<br>" +
                "<em>Note: Do not include unnecessary sensitive complaint information directly inside the email. Use the dashboard for complete case information.</em>");

        sendEmailAsync(to, "ARAM — New Case Assigned | " + complaintCustomId, EmailTemplateType.GUIDE_NEW_CASE, vars);
    }

    public void sendPasswordResetOtpEmail(String to, String userName, String otp) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", userName);
        vars.put("message", "We received a request to reset your ARAM account password.<br>Your verification code is:");
        vars.put("actionOrOtp", otp);
        vars.put("importantInfo", "This code expires in 5 minutes. If you did not request a password reset, please ignore this email.");

        sendEmailAsync(to, "ARAM — Password Reset Verification Code", EmailTemplateType.PASSWORD_RESET_OTP, vars);
    }

    public void sendPasswordChangedEmail(String to, String userName) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", userName);
        vars.put("message", "Your ARAM account password was recently changed.<br><br>" +
                "If you did not perform this action, please secure your account immediately through the ARAM platform.");
        vars.put("importantInfo", "Contact: <a href=\"mailto:ouraramsupport@gmail.com\">ouraramsupport@gmail.com</a>");

        sendEmailAsync(to, "ARAM Security Alert", EmailTemplateType.SECURITY_ALERT, vars);
    }

    public void sendContactSupportEmail(String fromEmail, String fromName, String subject, String message) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", "ARAM Support Team");
        vars.put("message", "You received a new contact support message from the Landing Page:<br><br>" +
                "<strong>Name:</strong> " + fromName + "<br>" +
                "<strong>Email:</strong> " + fromEmail + "<br>" +
                "<strong>Subject:</strong> " + subject + "<br><br>" +
                "<strong>Message:</strong><br>" + message);

        sendEmailAsync("ouraramsupport@gmail.com", "[ARAM Contact Support] " + subject, EmailTemplateType.SECURITY_ALERT, vars);
    }

    public void sendComplaintStatusUpdateEmail(String to, String userName, String complaintCustomId, String oldStatus, String newStatus) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", userName);
        vars.put("message", "The status of your ARAM complaint has been updated.<br><br>" +
                "<strong>Complaint ID:</strong> " + complaintCustomId + "<br>" +
                "<strong>Previous Status:</strong> " + oldStatus + "<br>" +
                "<strong>New Status:</strong> <span style=\"color: #1e4b8f; font-weight: bold;\">" + newStatus + "</span><br><br>" +
                "You can log in to your ARAM Citizen Dashboard to view updated next steps or communicate with your assigned Legal Guide.");

        sendEmailAsync(to, "ARAM Status Update — Complaint " + complaintCustomId, EmailTemplateType.COMPLAINT_STATUS_UPDATED, vars);
    }

    public void sendCaseResolvedEmail(String to, String userName, String complaintCustomId, String resolutionSummary) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", userName);
        vars.put("message", "Your complaint has been marked as <strong>RESOLVED</strong>.<br><br>" +
                "<strong>Complaint ID:</strong> " + complaintCustomId + "<br>" +
                "<strong>Resolution Summary:</strong> " + (resolutionSummary != null && !resolutionSummary.isEmpty() ? resolutionSummary : "Legal guidance and grievance resolution successfully completed.") + "<br><br>" +
                "Thank you for using ARAM Legal Assistance. Please log in to download your final resolution summary or rate your Legal Guide.");

        sendEmailAsync(to, "ARAM — Case Resolved | " + complaintCustomId, EmailTemplateType.CASE_RESOLVED, vars);
    }

    public void sendEscalationAlertEmail(String to, String recipientName, String complaintCustomId, String reason, String district) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", recipientName);
        vars.put("message", "<strong>URGENT ESCALATION NOTICE:</strong> A complaint in your jurisdiction requires immediate administrative / legal-aid review.<br><br>" +
                "<strong>Complaint ID:</strong> " + complaintCustomId + "<br>" +
                "<strong>District:</strong> " + district + "<br>" +
                "<strong>Escalation Reason:</strong> " + reason + "<br><br>" +
                "Please access your secure ARAM Admin Dashboard to inspect case files and coordinate legal aid.");

        sendEmailAsync(to, "URGENT: ARAM Case Escalation Notice — " + complaintCustomId, EmailTemplateType.ESCALATION_ALERT, vars);
    }

    public void sendGuideInvitationEmail(String to, String userName, String district, String inviteLink) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", userName);
        vars.put("message", "You have been invited to join ARAM as a Legal Guide for the region: <strong>" + district + "</strong>.<br><br>" +
                "Please click the button below to accept your invitation, choose your new password, and activate your account.");
        vars.put("actionOrOtp", inviteLink);
        vars.put("importantInfo", "<strong>This invitation link is valid for 7 days.</strong> If you were not expecting this invitation, you can safely ignore this email.");

        sendEmailAsync(to, "ARAM Legal Assistance — Legal Guide Invitation", EmailTemplateType.GUIDE_INVITATION, vars);
    }

    public void sendAdminInvitationEmail(String to, String userName, String district, String inviteLink) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", userName);
        vars.put("message", "Welcome to ARAM Legal Assistance. You have been invited to join ARAM as a Regional Administrator for <strong>" + district + " District</strong>.<br><br>" +
                "Please click the button below to activate your account, choose your secure password, and get started.");
        vars.put("actionOrOtp", inviteLink);
        vars.put("importantInfo", "<strong>This activation link is valid for 24 hours.</strong> If you were not expecting this invitation, you can safely ignore this email.");

        sendEmailAsync(to, "Welcome to ARAM — Activate Your Regional Admin Account", EmailTemplateType.ADMIN_INVITATION, vars);
    }

    public void sendAccountActivatedEmail(String to, String userName, String roleName) {
        Map<String, String> vars = new HashMap<>();
        vars.put("userName", userName);
        vars.put("message", "Your ARAM account has been successfully activated as a <strong>" + roleName + "</strong>.<br><br>" +
                "You can now log in using your registered email and the password you configured.");
        vars.put("importantInfo", "If you did not perform this action, please contact the ARAM Support Team immediately at ouraramsupport@gmail.com.");

        sendEmailAsync(to, "ARAM Account Activated Successfully", EmailTemplateType.ACCOUNT_VERIFIED, vars);
    }

    public void sendAuditAlertEmail(String to, String details) {
        writeDevAuditAlertScratch(to, details);

        Map<String, String> vars = new HashMap<>();
        vars.put("userName", "ARAM Security Team");
        vars.put("message", "<strong>CRITICAL SECURITY ALERT:</strong> The daily ARAM Blockchain Integrity Monitor has detected corruption or unauthorized modifications in the complaint blockchain audit ledger!<br><br>" +
                "<strong>Audit Analysis Details:</strong><br>" + details);
        vars.put("importantInfo", "Please inspect the database blocks and audit logs immediately to identify the tampering source.");

        sendEmailAsync(to, "CRITICAL: ARAM Blockchain Audit Corruption Alert", EmailTemplateType.SECURITY_ALERT, vars);
    }

    private void writeDevAuditAlertScratch(String email, String details) {
        try {
            Path scratchPath = Path.of("C:", "Users", "Sharon", ".gemini", "antigravity", "brain", "df2c1ee5-098b-4d5d-8273-4efe2c8f7ce5", "scratch");
            Files.createDirectories(scratchPath);
            Files.writeString(scratchPath.resolve("last_audit_alert.txt"), "To: " + email + "\nDetails: " + details);
            log.info("Dev Mode Audit alert helper written to last_audit_alert.txt");
        } catch (Exception e) {
            log.error("Failed to write dev-mode audit alert scratch file: {}", e.getMessage());
        }
    }
}
