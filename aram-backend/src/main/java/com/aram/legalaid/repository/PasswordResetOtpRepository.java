package com.aram.legalaid.repository;

import com.aram.legalaid.model.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {
    Optional<PasswordResetOtp> findTopByEmailOrderByCreatedAtDesc(String email);
    Optional<PasswordResetOtp> findTopByEmailOrMobileNumberOrderByCreatedAtDesc(String email, String mobileNumber);
    long countByEmailAndCreatedAtAfter(String email, LocalDateTime after);
    long countByMobileNumberAndCreatedAtAfter(String mobileNumber, LocalDateTime after);
}
