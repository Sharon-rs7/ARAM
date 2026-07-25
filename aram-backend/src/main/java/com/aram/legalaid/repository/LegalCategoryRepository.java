package com.aram.legalaid.repository;

import com.aram.legalaid.model.LegalCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LegalCategoryRepository extends JpaRepository<LegalCategory, Long> {
    Optional<LegalCategory> findByCode(String code);
    boolean existsByCode(String code);
}
