package com.aram.legalaid.repository;

import com.aram.legalaid.model.VolunteerActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VolunteerActivityRepository extends JpaRepository<VolunteerActivityLog, Long> {
    List<VolunteerActivityLog> findByVolunteerIdOrderByCreatedAtDesc(Long volunteerId);
    List<VolunteerActivityLog> findAllByOrderByCreatedAtDesc();
}
