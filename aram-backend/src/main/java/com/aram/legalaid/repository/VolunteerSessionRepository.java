package com.aram.legalaid.repository;

import com.aram.legalaid.model.VolunteerSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerSessionRepository extends JpaRepository<VolunteerSession, Long> {
    Optional<VolunteerSession> findBySessionId(String sessionId);
    List<VolunteerSession> findByVolunteerIdOrderByLoginAtDesc(Long volunteerId);
    List<VolunteerSession> findByStatus(String status);
}
