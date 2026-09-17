package com.auth.service;

import com.auth.dto.ThemePreferenceRequest;
import com.auth.dto.UserUpdateRequest;
import com.auth.entity.AppUser;
import com.auth.entity.Role;
import com.auth.entity.ThemePreference;
import com.auth.exception.BadRequestException;
import com.auth.exception.ResourceNotFoundException;
import com.auth.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {
    private final AppUserRepository userRepository;
    private final Path profileUploadDir;

    public UserService(AppUserRepository userRepository, @Value("${app.upload.dir:uploads}") String uploadDir) {
        this.userRepository = userRepository;
        this.profileUploadDir = Path.of(uploadDir, "profile");
    }

    public AppUser currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Authenticated user not found");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public AppUser getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public List<AppUser> getAdmins() {
        return userRepository.findByRole(Role.ADMIN);
    }

    public AppUser updateCurrentUser(UserUpdateRequest request) {
        AppUser user = currentUser();
        if (request.name() != null) user.setName(request.name());
        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) throw new BadRequestException("Email already exists");
            user.setEmail(request.email());
        }
        if (request.mobile() != null && !request.mobile().equals(user.getMobile())) {
            if (userRepository.existsByMobile(request.mobile())) throw new BadRequestException("Mobile number already exists");
            user.setMobile(request.mobile());
        }
        if (request.bio() != null) user.setBio(request.bio());
        if (request.district() != null) user.setDistrict(request.district());
        if (request.address() != null) user.setAddress(request.address());
        if (request.preferredLanguage() != null) user.setPreferredLanguage(request.preferredLanguage());
        if (request.gender() != null) user.setGender(request.gender());
        if (request.specialization() != null) user.setSpecialization(request.specialization());
        if (request.voiceAssistanceEnabled() != null) user.setVoiceAssistanceEnabled(request.voiceAssistanceEnabled());
        if (request.simpleModeEnabled() != null) user.setSimpleModeEnabled(request.simpleModeEnabled());
        if (request.speechRatePreference() != null) user.setSpeechRatePreference(request.speechRatePreference());
        return userRepository.save(user);
    }

    public AppUser updateTheme(ThemePreferenceRequest request) {
        AppUser user = currentUser();
        user.setThemePreference(request.themePreference() == null ? ThemePreference.SYSTEM : request.themePreference());
        return userRepository.save(user);
    }

    public AppUser updateAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BadRequestException("Avatar file is required");
        if (file.getSize() > 2L * 1024L * 1024L) throw new BadRequestException("Avatar must be 2MB or less");
        Set<String> allowed = Set.of("image/jpeg", "image/png", "image/webp");
        if (!allowed.contains(file.getContentType())) throw new BadRequestException("Avatar must be JPG, PNG, or WEBP");

        try {
            Files.createDirectories(profileUploadDir);
            String original = file.getOriginalFilename() == null ? "avatar" : file.getOriginalFilename();
            String extension = original.contains(".") ? original.substring(original.lastIndexOf(".")) : ".jpg";
            String storedName = UUID.randomUUID() + extension;
            Path target = profileUploadDir.resolve(storedName);
            file.transferTo(target);
            AppUser user = currentUser();
            user.setAvatarUrl("/uploads/profile/" + storedName);
            return userRepository.save(user);
        } catch (IOException ex) {
            throw new BadRequestException("Unable to save avatar");
        }
    }
}
