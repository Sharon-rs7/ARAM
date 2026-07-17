package com.aram.legalaid.service;

import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.model.Authority;
import com.aram.legalaid.repository.AuthorityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthorityService {
    private final AuthorityRepository authorityRepository;

    public AuthorityService(AuthorityRepository authorityRepository) {
        this.authorityRepository = authorityRepository;
    }

    public List<Authority> all() {
        return authorityRepository.findAll();
    }

    public List<Authority> byCategory(ComplaintCategory category) {
        return authorityRepository.findByCategory(category);
    }
}
