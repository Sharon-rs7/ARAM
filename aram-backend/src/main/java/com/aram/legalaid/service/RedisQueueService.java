package com.aram.legalaid.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class RedisQueueService {
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private static final String QUEUE_KEY = "aram_jobs_queue";

    public RedisQueueService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public void enqueueJob(String jobId, Long complaintId, Long userId, String taskType, String fileReference, String requestMetadata) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("jobId", jobId);
            message.put("complaintId", complaintId != null ? complaintId.toString() : "");
            message.put("userId", userId != null ? userId.toString() : "");
            message.put("taskType", taskType);
            message.put("fileReference", fileReference != null ? fileReference : "");
            message.put("priority", 1);
            message.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

            Map<String, Object> metadataMap = new HashMap<>();
            if (requestMetadata != null && !requestMetadata.isEmpty()) {
                try {
                    metadataMap = objectMapper.readValue(requestMetadata, Map.class);
                } catch (Exception parseEx) {
                    System.err.println("[REDIS QUEUE] Metadata parsing warning: " + parseEx.getMessage());
                }
            }
            message.put("requestMetadata", metadataMap);

            String jsonPayload = objectMapper.writeValueAsString(message);
            redisTemplate.opsForList().leftPush(QUEUE_KEY, jsonPayload);
            System.out.println("[REDIS QUEUE] Successfully enqueued job: " + jobId + " of type " + taskType);
        } catch (Exception e) {
            System.err.println("[REDIS QUEUE ERROR] Failed to enqueue job " + jobId + ": " + e.getMessage());
        }
    }
}
