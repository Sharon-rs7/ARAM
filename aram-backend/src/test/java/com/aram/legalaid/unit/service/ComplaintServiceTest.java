package com.aram.legalaid.unit.service;

import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.PriorityLevel;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.ComplaintRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    private User sampleCitizen;
    private Complaint sampleComplaint;

    @BeforeEach
    void setUp() {
        sampleCitizen = new User();
        sampleCitizen.setId(1L);
        sampleCitizen.setName("Ramesh Kumar");
        sampleCitizen.setEmail("ramesh@example.com");

        sampleComplaint = new Complaint();
        sampleComplaint.setId(101L);
        sampleComplaint.setTitle("Unpaid Salary");
        sampleComplaint.setDescription("Employer has not paid salary for 3 months.");
        sampleComplaint.setCategory(ComplaintCategory.LABOUR_DISPUTE);
        sampleComplaint.setPriority(PriorityLevel.HIGH);
        sampleComplaint.setStatus(ComplaintStatus.SUBMITTED);
        sampleComplaint.setUser(sampleCitizen);
    }

    @Test
    @DisplayName("Find Complaint By ID - Existing ID - Returns Complaint")
    void testFindById_ExistingId() {
        when(complaintRepository.findById(101L)).thenReturn(Optional.of(sampleComplaint));

        Optional<Complaint> found = complaintRepository.findById(101L);

        assertTrue(found.isPresent());
        assertEquals(101L, found.get().getId());
        assertEquals("Unpaid Salary", found.get().getTitle());
    }

    @Test
    @DisplayName("Find Complaints By User - Returns List")
    void testFindByUser() {
        when(complaintRepository.findByUserIdOrderByCreatedAtDesc(sampleCitizen.getId())).thenReturn(Arrays.asList(sampleComplaint));

        List<Complaint> list = complaintRepository.findByUserIdOrderByCreatedAtDesc(sampleCitizen.getId());

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(ComplaintCategory.LABOUR_DISPUTE, list.get(0).getCategory());
    }

    @Test
    @DisplayName("Find Complaints By Status - Returns List")
    void testFindByStatus() {
        when(complaintRepository.findByStatus(ComplaintStatus.SUBMITTED)).thenReturn(Arrays.asList(sampleComplaint));

        List<Complaint> list = complaintRepository.findByStatus(ComplaintStatus.SUBMITTED);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(ComplaintStatus.SUBMITTED, list.get(0).getStatus());
    }
}
