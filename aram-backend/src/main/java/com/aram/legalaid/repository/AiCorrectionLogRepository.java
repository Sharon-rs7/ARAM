package com.aram.legalaid.repository;

import com.aram.legalaid.model.AiCorrectionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiCorrectionLogRepository extends JpaRepository<AiCorrectionLog, Long> {
    List<AiCorrectionLog> findByComplaintId(Long complaintId);
}
