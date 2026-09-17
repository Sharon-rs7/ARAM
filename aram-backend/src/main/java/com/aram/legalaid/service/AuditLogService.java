package com.aram.legalaid.service;

import com.aram.legalaid.model.AuditLog;
import com.aram.legalaid.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;
    private static final String GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    private String calculateHash(String action, String performedBy, String details, LocalDateTime timestamp, String prevHash) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String tsStr = timestamp.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            String data = action + "|" + performedBy + "|" + details + "|" + tsStr + "|" + prevHash;
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException("SHA-256 algorithm not found", ex);
        }
    }

    @Transactional
    public void log(String action, String performedBy, String details) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setPerformedBy(performedBy == null ? "SYSTEM" : performedBy);
        auditLog.setDetails(details);
        
        // Truncate to second precision to align with DB storage
        LocalDateTime ts = LocalDateTime.now().withNano(0);
        auditLog.setTimestamp(ts);

        // Fetch last log to get previousHash
        Optional<AuditLog> lastLogOpt = auditLogRepository.findFirstByOrderByIdDesc();
        String prevHash = lastLogOpt.map(AuditLog::getHash).orElse(GENESIS_HASH);
        auditLog.setPreviousHash(prevHash);

        // Calculate and set hash
        String currentHash = calculateHash(auditLog.getAction(), auditLog.getPerformedBy(), auditLog.getDetails(), ts, prevHash);
        auditLog.setHash(currentHash);

        auditLogRepository.save(auditLog);
    }

    public Map<String, Object> verifyAuditChain() {
        Map<String, Object> result = new LinkedHashMap<>();
        List<AuditLog> logs = auditLogRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "id"));
        
        boolean intact = true;
        int corruptedCount = 0;
        List<Map<String, Object>> issues = new ArrayList<>();
        
        String expectedPrevHash = GENESIS_HASH;
        for (int i = 0; i < logs.size(); i++) {
            AuditLog log = logs.get(i);
            
            // Check previousHash matches expected
            if (!expectedPrevHash.equals(log.getPreviousHash())) {
                intact = false;
                corruptedCount++;
                issues.add(Map.of(
                    "logId", log.getId(),
                    "issueType", "PREVIOUS_HASH_MISMATCH",
                    "details", "Expected: " + expectedPrevHash + ", Actual: " + log.getPreviousHash()
                ));
            }
            
            // Check recalculated hash matches stored hash
            String computed = calculateHash(log.getAction(), log.getPerformedBy(), log.getDetails(), log.getTimestamp(), log.getPreviousHash());
            if (!computed.equals(log.getHash())) {
                intact = false;
                corruptedCount++;
                issues.add(Map.of(
                    "logId", log.getId(),
                    "issueType", "CONTENT_TAMPERED",
                    "details", "Recalculated: " + computed + ", Stored: " + log.getHash()
                ));
            }
            
            expectedPrevHash = log.getHash();
        }
        
        result.put("intact", intact);
        result.put("totalLogs", logs.size());
        result.put("corruptedLogsCount", corruptedCount);
        result.put("issues", issues);
        result.put("verificationTimestamp", LocalDateTime.now());
        
        if (!intact) {
            System.err.println("[AUDIT INTEGRITY ALERT] Hash chain corruption detected! Corrupted logs count: " + corruptedCount);
        }
        
        return result;
    }
}
