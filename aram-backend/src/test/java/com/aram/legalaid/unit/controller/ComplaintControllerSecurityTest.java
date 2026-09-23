package com.aram.legalaid.unit.controller;

import com.aram.legalaid.service.ComplaintService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
public class ComplaintControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ComplaintService complaintService;

    @Test
    @DisplayName("Unauthenticated Request - Missing JWT - Returns 4xx Client Error (Access Denied)")
    void testGetComplaints_MissingJwt_Returns4xx() throws Exception {
        mockMvc.perform(get("/api/complaints"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(roles = "CITIZEN")
    @DisplayName("Citizen User Attempting Admin Route - Returns 403 Forbidden")
    void testAdminRoute_CitizenUser_Returns403() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isForbidden());
    }
}
