package com.aram.legalaid.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class MongoLogService {
    private final MongoTemplate mongoTemplate;

    @Value("${ai.logs.mongodb.enabled:false}")
    private boolean mongoEnabled;

    public MongoLogService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public void log(String collection, Map<String, Object> data) {
        if (!mongoEnabled) return;
        try {
            Map<String, Object> copy = new HashMap<>(data);
            copy.put("loggedAt", LocalDateTime.now().toString());
            mongoTemplate.save(copy, collection);
        } catch (Exception ignored) {
            // Logging must never break user flow.
        }
    }
}
