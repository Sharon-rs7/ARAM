package com.aram.legalaid.repository;

import com.aram.legalaid.model.CaseAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseAppointmentRepository extends JpaRepository<CaseAppointment, Long> {
    List<CaseAppointment> findByComplaintId(Long complaintId);
}
