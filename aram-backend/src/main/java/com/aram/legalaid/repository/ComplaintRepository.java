package com.aram.legalaid.repository;

import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserOrderByCreatedAtDesc(User user);
    List<Complaint> findByAssignedHelperOrderByCreatedAtDesc(User assignedHelper);
    List<Complaint> findByReferredAdvocateOrderByCreatedAtDesc(User referredAdvocate);
    List<Complaint> findByAuthorityOrderByCreatedAtDesc(String authority);
    long countByStatus(ComplaintStatus status);
    long countByCategory(ComplaintCategory category);
    List<Complaint> findByStatus(ComplaintStatus status);
}
