package com.aram.legalaid.repository;

import com.aram.legalaid.model.LegalGuideProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LegalGuideProfileRepository extends JpaRepository<LegalGuideProfile, Long> {
    Optional<LegalGuideProfile> findByUserId(Long userId);
    Optional<LegalGuideProfile> findByEmail(String email);
}
