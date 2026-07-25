package com.aram.legalaid.repository;

import com.aram.legalaid.model.CaseActionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CaseActionPlanRepository extends JpaRepository<CaseActionPlan, Long> {
    Optional<CaseActionPlan> findByComplaintId(Long complaintId);
    boolean existsByComplaintId(Long complaintId);
}
