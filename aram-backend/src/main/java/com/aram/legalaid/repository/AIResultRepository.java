package com.aram.legalaid.repository;

import com.aram.legalaid.model.AIResult;
import com.aram.legalaid.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AIResultRepository extends JpaRepository<AIResult, Long> {
    Optional<AIResult> findByComplaint(Complaint complaint);
    Optional<AIResult> findByComplaintId(Long complaintId);
}
