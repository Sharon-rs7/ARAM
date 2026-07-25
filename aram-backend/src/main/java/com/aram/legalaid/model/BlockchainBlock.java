package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blockchain_blocks", indexes = {
        @Index(name = "idx_blocks_complaint", columnList = "complaintId"),
        @Index(name = "idx_blocks_index", columnList = "blockIndex")
})
public class BlockchainBlock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long blockIndex;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, length = 64)
    private String previousHash;

    @Column(nullable = false, length = 64)
    private String blockHash;

    @Column(nullable = false, unique = true)
    private Long complaintId;

    @Column(nullable = false, length = 64)
    private String complaintHash;

    @Column(nullable = false)
    private int nonce;

    @Column(columnDefinition = "TEXT")
    private String blockData;

    public BlockchainBlock() {}

    public BlockchainBlock(Long blockIndex, LocalDateTime timestamp, String previousHash, String blockHash, Long complaintId, String complaintHash, int nonce, String blockData) {
        this.blockIndex = blockIndex;
        this.timestamp = timestamp;
        this.previousHash = previousHash;
        this.blockHash = blockHash;
        this.complaintId = complaintId;
        this.complaintHash = complaintHash;
        this.nonce = nonce;
        this.blockData = blockData;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBlockIndex() { return blockIndex; }
    public void setBlockIndex(Long blockIndex) { this.blockIndex = blockIndex; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }

    public String getBlockHash() { return blockHash; }
    public void setBlockHash(String blockHash) { this.blockHash = blockHash; }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public String getComplaintHash() { return complaintHash; }
    public void setComplaintHash(String complaintHash) { this.complaintHash = complaintHash; }

    public int getNonce() { return nonce; }
    public void setNonce(int nonce) { this.nonce = nonce; }

    public String getBlockData() { return blockData; }
    public void setBlockData(String blockData) { this.blockData = blockData; }
}
