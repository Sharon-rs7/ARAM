package com.aram.legalaid.repository;

import com.aram.legalaid.model.CaseChatThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CaseChatThreadRepository extends JpaRepository<CaseChatThread, Long> {
    Optional<CaseChatThread> findByComplaintId(Long complaintId);
}
