package com.aram.legalaid.repository;

import com.aram.legalaid.model.BlockchainBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlockchainBlockRepository extends JpaRepository<BlockchainBlock, Long> {
    Optional<BlockchainBlock> findFirstByOrderByBlockIndexDesc();
    Optional<BlockchainBlock> findByComplaintId(Long complaintId);
    java.util.List<BlockchainBlock> findAllByOrderByBlockIndexAsc();
}
