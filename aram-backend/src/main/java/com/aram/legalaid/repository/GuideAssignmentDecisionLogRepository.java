package com.aram.legalaid.repository;

import com.aram.legalaid.model.GuideAssignmentDecisionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GuideAssignmentDecisionLogRepository extends JpaRepository<GuideAssignmentDecisionLog, Long> {
    Optional<GuideAssignmentDecisionLog> findByComplaintId(Long complaintId);
}
