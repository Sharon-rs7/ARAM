package com.aram.legalaid.repository;

import com.aram.legalaid.model.LegalProblemTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LegalProblemTemplateRepository extends JpaRepository<LegalProblemTemplate, Long> {
    Optional<LegalProblemTemplate> findByProblemId(String problemId);
    List<LegalProblemTemplate> findByCategory(String category);
    boolean existsByProblemId(String problemId);
}
