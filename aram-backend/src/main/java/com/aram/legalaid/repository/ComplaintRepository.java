package com.aram.legalaid.repository;

import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findAllByOrderByCreatedAtDesc();
    List<Complaint> findByUserOrderByCreatedAtDesc(User user);
    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Complaint> findByAssignedHelperOrderByCreatedAtDesc(User assignedHelper);
    List<Complaint> findByAssignedHelperIdOrderByCreatedAtDesc(Long assignedHelperId);
    List<Complaint> findByReferredAdvocateOrderByCreatedAtDesc(User referredAdvocate);
    List<Complaint> findByReferredAdvocateIdOrderByCreatedAtDesc(Long referredAdvocateId);
    List<Complaint> findByAuthorityOrderByCreatedAtDesc(String authority);
    long countByStatus(ComplaintStatus status);
    long countByCategory(ComplaintCategory category);
    List<Complaint> findByStatus(ComplaintStatus status);
    
    // District-based Scoping for Admins
    List<Complaint> findByDistrictOrderByCreatedAtDesc(String district);
    long countByDistrict(String district);
    long countByDistrictAndStatus(String district, ComplaintStatus status);
    long countByDistrictAndCategory(String district, ComplaintCategory category);
    List<Complaint> findByDistrictAndStatus(String district, ComplaintStatus status);

    // Custom string identifier lookup
    java.util.Optional<Complaint> findByComplaintCustomId(String complaintCustomId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(MAX(c.id), 0) + 1 FROM Complaint c")
    Long getNextComplaintSequenceValue();
}
