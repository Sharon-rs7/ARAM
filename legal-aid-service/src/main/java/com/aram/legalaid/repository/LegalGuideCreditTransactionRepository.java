package com.aram.legalaid.repository;

import com.aram.legalaid.model.LegalGuideCreditTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LegalGuideCreditTransactionRepository extends JpaRepository<LegalGuideCreditTransaction, Long> {
    List<LegalGuideCreditTransaction> findAllByLegalGuideIdOrderByIdDesc(Long legalGuideId);
    List<LegalGuideCreditTransaction> findAllByLegalGuideId(Long legalGuideId);
    boolean existsByLegalGuideIdAndComplaintIdAndTransactionType(Long legalGuideId, Long complaintId, String transactionType);
}
