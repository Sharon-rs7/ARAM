package com.aram.legalaid.repository;

import com.aram.legalaid.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findAllByOrderByTimestampDesc();
    org.springframework.data.domain.Page<AuditLog> findAllByOrderByTimestampDesc(org.springframework.data.domain.Pageable pageable);
    java.util.Optional<AuditLog> findFirstByOrderByIdDesc();
}
