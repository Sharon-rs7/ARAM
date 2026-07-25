package com.aram.legalaid.controller;

import com.aram.legalaid.model.Authority;
import com.aram.legalaid.model.LegalCategory;
import com.aram.legalaid.model.LegalProblemTemplate;
import com.aram.legalaid.repository.AuthorityRepository;
import com.aram.legalaid.repository.LegalCategoryRepository;
import com.aram.legalaid.repository.LegalProblemTemplateRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/master")
public class MasterController {
    private final LegalCategoryRepository legalCategoryRepository;
    private final LegalProblemTemplateRepository legalProblemTemplateRepository;
    private final AuthorityRepository authorityRepository;

    public MasterController(
            LegalCategoryRepository legalCategoryRepository,
            LegalProblemTemplateRepository legalProblemTemplateRepository,
            AuthorityRepository authorityRepository) {
        this.legalCategoryRepository = legalCategoryRepository;
        this.legalProblemTemplateRepository = legalProblemTemplateRepository;
        this.authorityRepository = authorityRepository;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<LegalCategory>> getCategories() {
        return ResponseEntity.ok(legalCategoryRepository.findAll());
    }

    @GetMapping("/problem-templates")
    public ResponseEntity<List<LegalProblemTemplate>> getProblemTemplates() {
        return ResponseEntity.ok(legalProblemTemplateRepository.findAll());
    }

    @GetMapping("/authorities")
    public ResponseEntity<List<Authority>> getAuthorities() {
        return ResponseEntity.ok(authorityRepository.findAll());
    }

    @GetMapping("/priorities")
    public ResponseEntity<List<Map<String, String>>> getPriorities() {
        List<Map<String, String>> priorities = new ArrayList<>();
        priorities.add(Map.of("code", "LOW", "name", "Standard Guidance"));
        priorities.add(Map.of("code", "MEDIUM", "name", "Priority Review"));
        priorities.add(Map.of("code", "HIGH", "name", "Urgent Intervention"));
        priorities.add(Map.of("code", "CRITICAL", "name", "Urgent Intervention"));
        return ResponseEntity.ok(priorities);
    }

    @GetMapping("/document-rules")
    public ResponseEntity<Map<String, List<String>>> getDocumentRules() {
        Map<String, List<String>> rules = legalProblemTemplateRepository.findAll().stream()
            .collect(Collectors.toMap(
                LegalProblemTemplate::getCategory,
                t -> Arrays.asList(t.getRequiredDocuments().split(",")),
                (existing, replacement) -> existing
            ));
        return ResponseEntity.ok(rules);
    }
}
