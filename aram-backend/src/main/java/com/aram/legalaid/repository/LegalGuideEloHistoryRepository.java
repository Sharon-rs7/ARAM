package com.aram.legalaid.repository;

import com.aram.legalaid.model.LegalGuideEloHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LegalGuideEloHistoryRepository extends JpaRepository<LegalGuideEloHistory, Long> {
    Optional<LegalGuideEloHistory> findByComplaintId(Long complaintId);
}
