package com.aram.legalaid.service;

import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.NotificationType;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommunicationGateway {

    private static final Logger log = LoggerFactory.getLogger(CommunicationGateway.class);

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final WhatsAppService whatsAppService;

    public CommunicationGateway(
            NotificationService notificationService,
            EmailService emailService,
            WhatsAppService whatsAppService
    ) {
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.whatsAppService = whatsAppService;
    }

    /**
     * Triggered when a new grievance is submitted by a citizen.
     */
    @Async
    public void notifyComplaintSubmitted(Complaint complaint, User citizen) {
        if (citizen == null || complaint == null) return;
        String caseId = getFormattedCaseId(complaint);

        // 1. In-App Notification
        try {
            notificationService.create(
                    citizen,
                    "Your grievance " + caseId + " has been registered successfully.",
                    NotificationType.IN_APP
            );
        } catch (Exception e) {
            log.error("Failed to create in-app notification for submission: {}", e.getMessage());
        }

        // 2. WhatsApp Notification
        if (citizen.isWhatsappOptIn() && citizen.getMobile() != null && !citizen.getMobile().isBlank()) {
            try {
                String waMsg = String.format(
                        "🟢 *ARAM — Grievance Registered*\n\n" +
                        "Vanakkam %s,\n" +
                        "Your grievance has been successfully submitted to the ARAM civic registry.\n\n" +
                        "📋 *Case ID:* %s\n" +
                        "📍 *District:* %s\n" +
                        "📌 *Status:* AI Analysis in Progress\n\n" +
                        "You can track your case anytime at: https://ouraram.in/track-complaint",
                        citizen.getName(), caseId, complaint.getDistrict() != null ? complaint.getDistrict() : "Tamil Nadu"
                );
                whatsAppService.sendTextMessage(citizen.getMobile(), waMsg);
            } catch (Exception e) {
                log.error("Failed to dispatch WhatsApp submission message: {}", e.getMessage());
            }
        }
    }

    /**
     * Triggered when complaint status updates (e.g. UNDER_INVESTIGATION, RESOLVED, etc.)
     */
    @Async
    public void notifyStatusUpdated(Complaint complaint, User citizen, ComplaintStatus oldStatus, ComplaintStatus newStatus, String note) {
        if (citizen == null || complaint == null) return;
        String caseId = getFormattedCaseId(complaint);
        String statusLabel = newStatus != null ? newStatus.name().replace("_", " ") : "UPDATED";

        // 1. In-App Notification
        try {
            notificationService.create(
                    citizen,
                    "Grievance " + caseId + " status updated to " + statusLabel + ".",
                    NotificationType.IN_APP
            );
        } catch (Exception e) {
            log.error("Failed to create in-app notification for status update: {}", e.getMessage());
        }

        // 2. Email Notification (Preserve working email flow)
        if (citizen.getEmail() != null && !citizen.getEmail().isBlank()) {
            try {
                emailService.sendComplaintStatusUpdateEmail(
                        citizen.getEmail(),
                        citizen.getName(),
                        caseId,
                        oldStatus != null ? oldStatus.name() : "PENDING",
                        newStatus != null ? newStatus.name() : "UPDATED"
                );
            } catch (Exception e) {
                log.error("Failed to send status update email: {}", e.getMessage());
            }
        }

        // 3. WhatsApp Notification
        if (citizen.isWhatsappOptIn() && citizen.getMobile() != null && !citizen.getMobile().isBlank()) {
            try {
                String emoji = (newStatus == ComplaintStatus.RESOLVED) ? "✅" : "📌";
                String waMsg = String.format(
                        "%s *ARAM — Case Status Update*\n\n" +
                        "Dear %s,\n" +
                        "Your grievance milestone has been updated.\n\n" +
                        "📋 *Case ID:* %s\n" +
                        "🔄 *Current Status:* %s\n" +
                        "📝 *Update Note:* %s\n\n" +
                        "Review full case details and official response: https://ouraram.in/track-complaint",
                        emoji, citizen.getName(), caseId, statusLabel,
                        (note != null && !note.isBlank()) ? note : "Case review progress recorded by assigned authority."
                );
                whatsAppService.sendTextMessage(citizen.getMobile(), waMsg);
            } catch (Exception e) {
                log.error("Failed to dispatch WhatsApp status update: {}", e.getMessage());
            }
        }
    }

    /**
     * Triggered when a legal guide is assigned to the case.
     */
    @Async
    public void notifyGuideAssigned(Complaint complaint, User citizen, User guide) {
        if (citizen == null || complaint == null || guide == null) return;
        String caseId = getFormattedCaseId(complaint);

        // 1. In-App Notification
        try {
            notificationService.create(
                    citizen,
                    "Verified Legal Guide " + guide.getName() + " assigned to your grievance " + caseId + ".",
                    NotificationType.IN_APP
            );
        } catch (Exception e) {
            log.error("Failed to create in-app notification for guide assignment: {}", e.getMessage());
        }

        // 2. WhatsApp Notification
        if (citizen.isWhatsappOptIn() && citizen.getMobile() != null && !citizen.getMobile().isBlank()) {
            try {
                String waMsg = String.format(
                        "👤 *ARAM — Legal Guide Assigned*\n\n" +
                        "Dear %s,\n" +
                        "An accredited legal guide has been assigned to support your case in %s.\n\n" +
                        "📋 *Case ID:* %s\n" +
                        "⚖️ *Assigned Guide:* %s\n" +
                        "💬 Direct confidential chat is now active in your citizen portal.\n\n" +
                        "Connect with your guide: https://ouraram.in/track-complaint",
                        citizen.getName(),
                        complaint.getDistrict() != null ? complaint.getDistrict() : "your district",
                        caseId, guide.getName()
                );
                whatsAppService.sendTextMessage(citizen.getMobile(), waMsg);
            } catch (Exception e) {
                log.error("Failed to dispatch WhatsApp guide assignment: {}", e.getMessage());
            }
        }
    }

    private String getFormattedCaseId(Complaint complaint) {
        if (complaint.getComplaintCustomId() != null && !complaint.getComplaintCustomId().isBlank()) {
            return complaint.getComplaintCustomId();
        }
        return "ARAM-2026-" + String.format("%06d", complaint.getId());
    }
}
