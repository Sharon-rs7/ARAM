package com.aram.legalaid.repository;

import com.aram.legalaid.model.VolunteerMatchingTrainingSample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VolunteerMatchingTrainingSampleRepository extends JpaRepository<VolunteerMatchingTrainingSample, Long> {
    boolean existsByRowHash(String rowHash);
}
