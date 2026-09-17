package com.aram.legalaid.scheduler;

import com.aram.legalaid.enums.Role;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.service.BlockchainService;
import com.aram.legalaid.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AuditMonitoringScheduler {
    private static final Logger log = LoggerFactory.getLogger(AuditMonitoringScheduler.class);

    private final BlockchainService blockchainService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public AuditMonitoringScheduler(BlockchainService blockchainService, EmailService emailService, UserRepository userRepository) {
        this.blockchainService = blockchainService;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    // Run audit integrity check once a day at 2:00 AM, configurable by cron property
    @Scheduled(cron = "${app.audit.scheduler.cron:0 0 2 * * ?}")
    public void runDailyAuditCheck() {
        log.info("Starting scheduled blockchain audit integrity verification...");
        boolean isValid = blockchainService.verifyFullChain();
        if (!isValid) {
            log.error("CRITICAL: Blockchain audit chain tampering detected!");
            
            // Collect detail info
            String details = "Tampering detected in blockchain blocks sequence. The hash link chain is broken or a block payload hash has been modified.";
            
            // Find all Super Admins to email alert
            List<User> superAdmins = userRepository.findByRole(Role.SUPER_ADMIN);
            if (superAdmins.isEmpty()) {
                log.warn("No Super Admin found in DB. Sending alert email to default support.");
                emailService.sendAuditAlertEmail("ouraramsupport@gmail.com", details);
            } else {
                for (User admin : superAdmins) {
                    log.info("Sending critical corruption email alert to Super Admin: {}", admin.getEmail());
                    emailService.sendAuditAlertEmail(admin.getEmail(), details);
                }
            }
        } else {
            log.info("Blockchain audit chain verification completed successfully. Status: SECURE.");
        }
    }
}
