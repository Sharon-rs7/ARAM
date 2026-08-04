package com.aram.legalaid.repository;

import com.aram.legalaid.model.CaseOutcomeReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CaseOutcomeReviewRepository extends JpaRepository<CaseOutcomeReview, Long> {
    Optional<CaseOutcomeReview> findByComplaintId(Long complaintId);
}
