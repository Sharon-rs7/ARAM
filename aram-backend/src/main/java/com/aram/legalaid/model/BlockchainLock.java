package com.aram.legalaid.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "blockchain_locks")
public class BlockchainLock {
    @Id
    private Long id;
    private String lockName;

    public BlockchainLock() {}

    public BlockchainLock(Long id, String lockName) {
        this.id = id;
        this.lockName = lockName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLockName() { return lockName; }
    public void setLockName(String lockName) { this.lockName = lockName; }
}
