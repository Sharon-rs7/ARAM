package com.aram.legalaid.repository;

import com.aram.legalaid.model.CaseDocumentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseDocumentRequestRepository extends JpaRepository<CaseDocumentRequest, Long> {
    List<CaseDocumentRequest> findByComplaintId(Long complaintId);
}
