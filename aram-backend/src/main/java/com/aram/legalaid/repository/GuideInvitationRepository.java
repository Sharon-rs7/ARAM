package com.aram.legalaid.repository;

import com.aram.legalaid.model.GuideInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GuideInvitationRepository extends JpaRepository<GuideInvitation, Long> {
    Optional<GuideInvitation> findByToken(String token);
    Optional<GuideInvitation> findByEmail(String email);
    boolean existsByEmail(String email);
}
