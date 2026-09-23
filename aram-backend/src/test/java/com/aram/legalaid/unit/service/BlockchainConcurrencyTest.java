package com.aram.legalaid.unit.service;

import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.model.BlockchainBlock;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.BlockchainBlockRepository;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.service.BlockchainService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("test")
public class BlockchainConcurrencyTest {

    @Autowired
    private BlockchainService blockchainService;

    @Autowired
    private BlockchainBlockRepository blockchainBlockRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    private User sampleCitizen;

    @BeforeEach
    void setUp() {
        sampleCitizen = userRepository.findByEmail("citizen@aram.ai")
                .orElseGet(() -> {
                    User u = new User();
                    u.setName("Citizen User");
                    u.setEmail("citizen@aram.ai");
                    u.setMobile("9999999999");
                    u.setPasswordHash("$2a$10$UnSampleHashForTesting");
                    u.setRole(com.aram.legalaid.enums.Role.CITIZEN);
                    return userRepository.save(u);
                });
    }

    @Test
    @DisplayName("Verify concurrency safety during concurrent complaint block mining")
    void testConcurrentBlockMining() throws InterruptedException, ExecutionException {
        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);

        // Pre-create 20 complaints in database so they have valid IDs
        List<Complaint> complaints = new ArrayList<>();
        for (int i = 0; i < threadCount; i++) {
            Complaint c = new Complaint();
            c.setTitle("Test Complaint " + i + "_" + System.currentTimeMillis());
            c.setDescription("Description for concurrent complaint " + i);
            c.setDistrict("Chennai");
            c.setLanguage("ENGLISH");
            c.setUser(sampleCitizen);
            c.setStatus(ComplaintStatus.SUBMITTED);
            c.setComplaintCustomId("ARAM-26-TN-CHE-" + String.format("%06d", i + 1000));
            c.setCreatedAt(LocalDateTime.now());
            complaints.add(complaintRepository.save(c));
        }

        List<Callable<BlockchainBlock>> tasks = new ArrayList<>();
        List<Exception> exceptions = Collections.synchronizedList(new ArrayList<>());

        for (Complaint complaint : complaints) {
            tasks.add(() -> {
                try {
                    return blockchainService.mineBlock(complaint);
                } catch (Exception e) {
                    exceptions.add(e);
                    throw e;
                }
            });
        }

        // Run concurrently
        List<Future<BlockchainBlock>> futures = executor.invokeAll(tasks);
        executor.shutdown();
        executor.awaitTermination(20, TimeUnit.SECONDS);

        // Assert no errors/exceptions were thrown
        if (!exceptions.isEmpty()) {
            exceptions.get(0).printStackTrace();
        }
        assertTrue(exceptions.isEmpty(), "Concurrency mining threw " + exceptions.size() + " exceptions!");

        // Assert all blocks were mined successfully
        List<BlockchainBlock> minedBlocks = new ArrayList<>();
        for (Future<BlockchainBlock> future : futures) {
            BlockchainBlock block = future.get();
            assertNotNull(block, "Mined block should not be null");
            minedBlocks.add(block);
        }

        assertEquals(threadCount, minedBlocks.size());

        // Verify index uniqueness and blockchain integrity
        List<Long> blockIndexes = new ArrayList<>();
        for (BlockchainBlock block : minedBlocks) {
            blockIndexes.add(block.getBlockIndex());
        }
        
        // Count duplicate block indexes
        long uniqueCount = blockIndexes.stream().distinct().count();
        assertEquals((long) threadCount, uniqueCount, "There are duplicate block indexes!");

        // Verify blockchain integrity validation
        boolean chainValid = blockchainService.verifyFullChain();
        assertTrue(chainValid, "Blockchain chain sequence verification failed!");
    }
}
