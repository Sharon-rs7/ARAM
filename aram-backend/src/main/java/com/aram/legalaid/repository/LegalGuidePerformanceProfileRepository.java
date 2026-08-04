package com.aram.legalaid.repository;

import com.aram.legalaid.model.LegalGuidePerformanceProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LegalGuidePerformanceProfileRepository extends JpaRepository<LegalGuidePerformanceProfile, Long> {
    Optional<LegalGuidePerformanceProfile> findByLegalGuideId(Long legalGuideId);
}
