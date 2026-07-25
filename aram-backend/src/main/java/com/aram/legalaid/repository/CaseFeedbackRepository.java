package com.aram.legalaid.repository;

import com.aram.legalaid.model.CaseFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CaseFeedbackRepository extends JpaRepository<CaseFeedback, Long> {
    Optional<CaseFeedback> findByComplaintId(Long complaintId);
}
