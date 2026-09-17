package com.aram.legalaid.repository;

import com.aram.legalaid.model.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    
    @Query("SELECT o FROM OtpVerification o WHERE o.user.id = :userId AND o.email = :email AND o.verifiedAt IS NULL AND o.expiresAt > :now")
    java.util.List<OtpVerification> findActiveOtps(
        @Param("userId") Long userId,
        @Param("email") String email,
        @Param("now") LocalDateTime now
    );

    @Query("SELECT COUNT(o) FROM OtpVerification o WHERE o.user.id = :userId AND o.createdAt > :since")
    long countOtpsSentSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);
}
