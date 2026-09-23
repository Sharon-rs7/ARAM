package com.aram.legalaid.unit.controller;

import com.aram.legalaid.model.User;
import com.aram.legalaid.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
public class CitizenProfileControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    @WithMockUser(username = "test-unique-citizen-123@aram.ai", roles = "CITIZEN")
    @DisplayName("GET /api/citizen/profile/completion - Success")
    void testGetCompletion_Success() throws Exception {
        User citizen = new User();
        citizen.setName("ARAM Citizen");
        citizen.setEmail("test-unique-citizen-123@aram.ai");
        citizen.setMobile("9000000001");
        citizen.setRole(com.aram.legalaid.enums.Role.CITIZEN);
        citizen.setEmailVerified(false);
        citizen.setPasswordHash("dummy");

        when(userService.currentUser()).thenReturn(citizen);

        mockMvc.perform(get("/api/citizen/profile/completion"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileCompleted").value(false))
                .andExpect(jsonPath("$.emailVerified").value(false));
    }
}
