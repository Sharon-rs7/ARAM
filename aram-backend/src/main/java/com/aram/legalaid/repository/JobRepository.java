package com.aram.legalaid.repository;

import com.aram.legalaid.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, String> {
    Optional<Job> findById(String id);
    Optional<Job> findByFileReferenceAndTaskType(String fileReference, String taskType);
}
