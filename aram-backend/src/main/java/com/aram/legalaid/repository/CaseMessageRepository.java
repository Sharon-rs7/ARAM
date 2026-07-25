package com.aram.legalaid.repository;

import com.aram.legalaid.model.CaseMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseMessageRepository extends JpaRepository<CaseMessage, Long> {
    List<CaseMessage> findByThreadIdOrderByCreatedAtAsc(Long threadId);
    List<CaseMessage> findByComplaintIdOrderByCreatedAtAsc(Long complaintId);
}
