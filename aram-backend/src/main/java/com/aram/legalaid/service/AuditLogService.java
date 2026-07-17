package com.aram.legalaid.service;

import com.aram.legalaid.model.AuditLog;
import com.aram.legalaid.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void log(String action, String performedBy, String details) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setPerformedBy(performedBy == null ? "SYSTEM" : performedBy);
        auditLog.setDetails(details);
        auditLogRepository.save(auditLog);
    }
}
