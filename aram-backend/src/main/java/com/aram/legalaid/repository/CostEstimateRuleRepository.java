package com.aram.legalaid.repository;

import com.aram.legalaid.model.CostEstimateRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CostEstimateRuleRepository extends JpaRepository<CostEstimateRule, Long> {
    Optional<CostEstimateRule> findByCategoryAndAuthorityTypeAndActiveTrue(String category, String authorityType);
}
