package com.aram.legalaid.unit.service;

import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.service.ProfileCompletionService;
import com.aram.legalaid.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class ProfileCompletionServiceTest {

    private UserRepository userRepository;
    private ProfileCompletionService profileCompletionService;
    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        profileCompletionService = new ProfileCompletionService(userRepository);
        
        testUser = new User();
        testUser.setId(1L);
        testUser.setRole(Role.HELPER);
    }

    @Test
    @DisplayName("Empty Profile - Returns 0 percent and lists missing fields")
    void testRecalculate_EmptyProfile() {
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProfileCompletionService.CompletionState state = profileCompletionService.recalculateAndSave(testUser);

        assertEquals(0, state.getCompletionPercentage());
        assertFalse(state.isProfileCompleted());
        assertFalse(state.isEmailVerified());
        assertNull(state.getProfilePhotoUrl());
        assertEquals(11, state.getMissingFields().size());
        assertTrue(state.getMissingFields().contains("name"));
        assertTrue(state.getMissingFields().contains("emailVerified"));
    }

    @Test
    @DisplayName("Fully Completed Profile - Returns 100 percent")
    void testRecalculate_FullyCompletedProfile() {
        testUser.setName("Rajesh Kumar");
        testUser.setEmail("rajesh@gmail.com");
        testUser.setMobile("9876543210");
        testUser.setDateOfBirth(LocalDate.of(1995, 5, 15));
        testUser.setGender("MALE");
        testUser.setAddress("123 Main St");
        testUser.setDistrict("Chennai");
        testUser.setState("Tamil Nadu");
        testUser.setPincode("600001");
        testUser.setAvatarUrl("/uploads/profile/photo.jpg");
        testUser.setEmailVerified(true);

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProfileCompletionService.CompletionState state = profileCompletionService.recalculateAndSave(testUser);

        assertEquals(100, state.getCompletionPercentage());
        assertTrue(state.isProfileCompleted());
        assertTrue(state.getMissingFields().isEmpty());
        assertTrue(testUser.isProfileCompleted());
    }
}
