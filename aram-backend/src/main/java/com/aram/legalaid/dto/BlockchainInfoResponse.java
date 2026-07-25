package com.aram.legalaid.dto;

import java.time.LocalDateTime;

public record BlockchainInfoResponse(
        boolean verified,
        Long blockIndex,
        String blockHash,
        String previousHash,
        LocalDateTime timestamp,
        String complaintHash,
        int nonce
) {}
