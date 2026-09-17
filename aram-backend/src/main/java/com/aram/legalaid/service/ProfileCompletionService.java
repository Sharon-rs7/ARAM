package com.aram.legalaid.service;

import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.enums.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProfileCompletionService {

    private final UserRepository userRepository;

    public ProfileCompletionService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public static class CompletionState {
        private final int completionPercentage;
        private final boolean profileCompleted;
        private final boolean emailVerified;
        private final String profilePhotoUrl;
        private final List<String> missingFields;

        public CompletionState(int completionPercentage, boolean profileCompleted, boolean emailVerified, String profilePhotoUrl, List<String> missingFields) {
            this.completionPercentage = completionPercentage;
            this.profileCompleted = profileCompleted;
            this.emailVerified = emailVerified;
            this.profilePhotoUrl = profilePhotoUrl;
            this.missingFields = missingFields;
        }

        public int getCompletionPercentage() { return completionPercentage; }
        public boolean isProfileCompleted() { return profileCompleted; }
        public boolean isEmailVerified() { return emailVerified; }
        public String getProfilePhotoUrl() { return profilePhotoUrl; }
        public List<String> getMissingFields() { return missingFields; }
    }

    @Transactional
    public CompletionState recalculateAndSave(User user) {
        List<String> missing = new ArrayList<>();
        int metCount = 0;
        int totalFields = 11;

        // 1. Name
        if (user.getName() != null && !user.getName().trim().isEmpty()) {
            metCount++;
        } else {
            missing.add("name");
        }

        // 2. Email
        if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
            metCount++;
        } else {
            missing.add("email");
        }

        // 3. Mobile
        if (user.getMobile() != null && !user.getMobile().trim().isEmpty()) {
            metCount++;
        } else {
            missing.add("mobile");
        }

        // 4. District
        if (user.getDistrict() != null && !user.getDistrict().trim().isEmpty()) {
            metCount++;
        } else {
            missing.add("district");
        }

        if (user.getRole() == Role.CITIZEN) {
            totalFields = 4;
            int percentage = (metCount * 100) / totalFields;
            boolean completed = (metCount == totalFields);
            user.setProfileCompletionPercentage(percentage);
            user.setProfileCompleted(completed);
            userRepository.save(user);
            return new CompletionState(percentage, completed, user.isEmailVerified(), user.getAvatarUrl(), missing);
        }

        // 5. Date of birth
        if (user.getDateOfBirth() != null) {
            metCount++;
        } else {
            missing.add("dateOfBirth");
        }

        // 6. Gender
        if (user.getGender() != null && !user.getGender().trim().isEmpty()) {
            metCount++;
        } else {
            missing.add("gender");
        }

        // 7. Address
        if (user.getAddress() != null && !user.getAddress().trim().isEmpty()) {
            metCount++;
        } else {
            missing.add("address");
        }

        // 8. State
        if (user.getState() != null && !user.getState().trim().isEmpty()) {
            metCount++;
        } else {
            missing.add("state");
        }

        // 9. Pincode
        if (user.getPincode() != null && !user.getPincode().trim().isEmpty()) {
            metCount++;
        } else {
            missing.add("pincode");
        }

        // 10. Profile photo (avatarUrl)
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().trim().isEmpty()) {
            metCount++;
        } else {
            missing.add("profilePhoto");
        }

        // 11. Email OTP verification
        if (user.isEmailVerified()) {
            metCount++;
        } else {
            missing.add("emailVerified");
        }

        int percentage = (metCount * 100) / totalFields;
        boolean completed = (metCount == totalFields);

        user.setProfileCompletionPercentage(percentage);
        user.setProfileCompleted(completed);
        userRepository.save(user);

        return new CompletionState(
                percentage,
                completed,
                user.isEmailVerified(),
                user.getAvatarUrl(),
                missing
        );
    }
}
