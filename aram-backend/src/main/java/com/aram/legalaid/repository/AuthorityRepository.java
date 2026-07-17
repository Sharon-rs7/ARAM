package com.aram.legalaid.repository;

import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.model.Authority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuthorityRepository extends JpaRepository<Authority, Long> {
    List<Authority> findByCategory(ComplaintCategory category);
}
