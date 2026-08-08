package com.auth.service;

import com.auth.dto.UserResponse;
import com.auth.entity.AppUser;
import org.springframework.stereotype.Service;

@Service
public class MapperService {
    public UserResponse toUserResponse(AppUser user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getMobile(), user.getRole(), user.getStatus(),
                user.getGender(), user.getSpecialization(), user.isHelperVerified(), user.getAvatarUrl(),
                user.getBio(), user.getDistrict(), user.getAddress(), user.getPreferredLanguage(), user.getThemePreference(),
                user.getCreatedAt(), user.getUpdatedAt(), user.getLastLogin(), user.getLanguagesKnown(), user.getSpecializationCategories(),
                user.getMaxActiveCases(), user.getCurrentActiveCases(), user.getAvailabilityStatus(), user.isWomenSupportTrained(),
                user.isForcePasswordChange(), user.getServiceArea(), user.getSubSpecializations(), user.getExperienceLevel(),
                user.isCanHandleSensitiveCases(), user.isVoiceAssistanceEnabled(), user.isSimpleModeEnabled(), user.getSpeechRatePreference(),
                user.isTwoFactorEnabled(),
                user.getId() != null ? String.format("CIT-2026-%06d", user.getId()) : null
        );
    }
}
