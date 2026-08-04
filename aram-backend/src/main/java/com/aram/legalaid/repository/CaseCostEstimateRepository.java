package com.aram.legalaid.repository;

import com.aram.legalaid.model.CaseCostEstimate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CaseCostEstimateRepository extends JpaRepository<CaseCostEstimate, Long> {
    Optional<CaseCostEstimate> findByComplaintId(Long complaintId);
}
