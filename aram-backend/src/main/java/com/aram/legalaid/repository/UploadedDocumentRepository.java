package com.aram.legalaid.repository;

import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.UploadedDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UploadedDocumentRepository extends JpaRepository<UploadedDocument, Long> {
    List<UploadedDocument> findByComplaint(Complaint complaint);
}
