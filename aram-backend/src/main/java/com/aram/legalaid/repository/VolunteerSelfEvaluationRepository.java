package com.aram.legalaid.repository;

import com.aram.legalaid.model.VolunteerSelfEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerSelfEvaluationRepository extends JpaRepository<VolunteerSelfEvaluation, Long> {
    Optional<VolunteerSelfEvaluation> findByComplaintId(Long complaintId);
    List<VolunteerSelfEvaluation> findByVolunteerId(Long volunteerId);
}
