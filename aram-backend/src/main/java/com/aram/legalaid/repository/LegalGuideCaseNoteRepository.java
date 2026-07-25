package com.aram.legalaid.repository;

import com.aram.legalaid.model.LegalGuideCaseNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LegalGuideCaseNoteRepository extends JpaRepository<LegalGuideCaseNote, Long> {
    List<LegalGuideCaseNote> findByComplaintIdOrderByCreatedAtDesc(Long complaintId);
}
