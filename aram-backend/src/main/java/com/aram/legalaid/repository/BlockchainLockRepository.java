package com.aram.legalaid.repository;

import com.aram.legalaid.model.BlockchainLock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlockchainLockRepository extends JpaRepository<BlockchainLock, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM BlockchainLock l WHERE l.id = :id")
    Optional<BlockchainLock> findAndLockById(@Param("id") Long id);
}
