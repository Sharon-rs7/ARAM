package com.aram.legalaid.repository;

import com.aram.legalaid.model.LegalGuideLevelRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LegalGuideLevelRuleRepository extends JpaRepository<LegalGuideLevelRule, Long> {
    List<LegalGuideLevelRule> findAllByActiveTrueOrderByLevelNumberAsc();
}
