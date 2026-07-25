package com.aram.legalaid.service;

import com.aram.legalaid.dto.BlockchainInfoResponse;
import com.aram.legalaid.model.BlockchainBlock;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.repository.BlockchainBlockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class BlockchainService {
    private final BlockchainBlockRepository blockchainBlockRepository;

    public BlockchainService(BlockchainBlockRepository blockchainBlockRepository) {
        this.blockchainBlockRepository = blockchainBlockRepository;
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException("SHA-256 algorithm not found", ex);
        }
    }

    public String calculateComplaintHash(Complaint complaint) {
        if (complaint == null) return "";
        String userEmail = complaint.getUser() != null ? complaint.getUser().getEmail() : "anonymous";
        String createdAtStr = "";
        if (complaint.getCreatedAt() != null) {
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            createdAtStr = complaint.getCreatedAt().format(formatter);
        }
        String rawData = complaint.getTitle() + "|" + complaint.getDescription() + "|" + userEmail + "|" + createdAtStr;
        return sha256(rawData);
    }

    @Transactional
    public BlockchainBlock mineBlock(Complaint complaint) {
        if (complaint == null || complaint.getId() == null) {
            return null;
        }

        Optional<BlockchainBlock> existing = blockchainBlockRepository.findByComplaintId(complaint.getId());
        if (existing.isPresent()) {
            return existing.get();
        }

        Optional<BlockchainBlock> latestOpt = blockchainBlockRepository.findFirstByOrderByBlockIndexDesc();
        long nextIndex = 0;
        String previousHash = "0000000000000000000000000000000000000000000000000000000000000000";
        if (latestOpt.isPresent()) {
            nextIndex = latestOpt.get().getBlockIndex() + 1;
            previousHash = latestOpt.get().getBlockHash();
        }

        String complaintHash = calculateComplaintHash(complaint);
        LocalDateTime blockTimestamp = LocalDateTime.now();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String timestampStr = blockTimestamp.format(formatter);

        int nonce = 0;
        String blockHash = "";
        String baseData = nextIndex + "|" + timestampStr + "|" + previousHash + "|" + complaint.getId() + "|" + complaintHash + "|";
        while (true) {
            String dataToHash = baseData + nonce;
            blockHash = sha256(dataToHash);
            if (blockHash.startsWith("00")) {
                break;
            }
            nonce++;
        }

        BlockchainBlock block = new BlockchainBlock(nextIndex, blockTimestamp, previousHash, blockHash, complaint.getId(), complaintHash, nonce, baseData + nonce);
        return blockchainBlockRepository.save(block);
    }

    public BlockchainInfoResponse getBlockchainInfo(Complaint complaint) {
        if (complaint == null || complaint.getId() == null) {
            return null;
        }

        Optional<BlockchainBlock> blockOpt = blockchainBlockRepository.findByComplaintId(complaint.getId());
        if (blockOpt.isEmpty()) {
            return null;
        }

        BlockchainBlock block = blockOpt.get();
        
        String expectedComplaintHash = calculateComplaintHash(complaint);
        boolean hashMatches = expectedComplaintHash.equals(block.getComplaintHash());

        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String timestampStr = block.getTimestamp().format(formatter);
        String baseData = block.getBlockIndex() + "|" + timestampStr + "|" + block.getPreviousHash() + "|" + block.getComplaintId() + "|" + block.getComplaintHash() + "|";
        String expectedBlockHash = sha256(baseData + block.getNonce());
        boolean blockHashMatches = expectedBlockHash.equals(block.getBlockHash());

        boolean verified = hashMatches && blockHashMatches;

        return new BlockchainInfoResponse(
                verified,
                block.getBlockIndex(),
                block.getBlockHash(),
                block.getPreviousHash(),
                block.getTimestamp(),
                block.getComplaintHash(),
                block.getNonce()
        );
    }

    public boolean verifyFullChain() {
        java.util.List<BlockchainBlock> blocks = blockchainBlockRepository.findAll();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (int i = 1; i < blocks.size(); i++) {
            BlockchainBlock current = blocks.get(i);
            BlockchainBlock previous = blocks.get(i - 1);
            if (!current.getPreviousHash().equals(previous.getBlockHash())) {
                return false;
            }
            String timestampStr = current.getTimestamp().format(formatter);
            String baseData = current.getBlockIndex() + "|" + timestampStr + "|" + current.getPreviousHash() + "|" + current.getComplaintId() + "|" + current.getComplaintHash() + "|";
            if (!sha256(baseData + current.getNonce()).equals(current.getBlockHash())) {
                return false;
            }
        }
        return true;
    }
}
