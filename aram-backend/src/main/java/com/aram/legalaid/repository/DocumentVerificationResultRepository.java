package com.aram.legalaid.repository;

import com.aram.legalaid.model.DocumentVerificationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentVerificationResultRepository extends JpaRepository<DocumentVerificationResult, Long> {
    Optional<DocumentVerificationResult> findByDocumentId(Long documentId);
}
