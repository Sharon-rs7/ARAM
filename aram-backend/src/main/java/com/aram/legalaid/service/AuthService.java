package com.aram.legalaid.service;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.UserStatus;
import com.aram.legalaid.exception.BadRequestException;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.repository.GuideInvitationRepository;
import com.aram.legalaid.model.GuideInvitation;
import com.aram.legalaid.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MapperService mapperService;
    private final GuideInvitationRepository guideInvitationRepository;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, 
                       MapperService mapperService, GuideInvitationRepository guideInvitationRepository,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.mapperService = mapperService;
        this.guideInvitationRepository = guideInvitationRepository;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }
        if (userRepository.existsByMobile(request.mobile())) {
            throw new BadRequestException("Mobile number is already registered");
        }
        Role role = request.role() == null ? Role.CITIZEN : request.role();
        if (role == Role.ADMIN) {
            throw new BadRequestException("Admin registration is not allowed from public API");
        }
        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setMobile(request.mobile());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setGender(request.gender());
        user.setSpecialization(request.specialization());
        User saved = userRepository.save(user);
        return issueTokens(saved);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String username = request.username().trim().toLowerCase();
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByMobile(username))
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Account is not active");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        if (request == null || request.email() == null || request.email().trim().isEmpty()) {
            throw new BadRequestException("Google email is required");
        }
        String email = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            String name = request.name() != null && !request.name().trim().isEmpty()
                    ? request.name().trim()
                    : email.split("@")[0].replace(".", " ");
            user.setName(name);
            user.setEmail(email);
            // Generate valid 10-digit Indian mobile placeholder if not supplied
            long randSuffix = 10000000L + (long) (Math.random() * 89999999L);
            user.setMobile("9" + String.valueOf(randSuffix));
            user.setPasswordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            user.setRole(Role.CITIZEN);
            user.setStatus(UserStatus.ACTIVE);
            user.setEmailVerified(true);
            user.setDistrict("Coimbatore");
            user.setState("Tamil Nadu");
            user.setProfileCompleted(true);
            user.setProfileCompletionPercentage(100);
            if (request.avatarUrl() != null && !request.avatarUrl().trim().isEmpty()) {
                user.setAvatarUrl(request.avatarUrl().trim());
            }
            user = userRepository.save(user);
        } else {
            if (user.getStatus() != UserStatus.ACTIVE) {
                throw new BadRequestException("Account is not active");
            }
            user.setEmailVerified(true);
            if (request.avatarUrl() != null && !request.avatarUrl().trim().isEmpty() && (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty())) {
                user.setAvatarUrl(request.avatarUrl().trim());
            }
            if (user.getDistrict() == null || user.getDistrict().trim().isEmpty()) {
                user.setDistrict("Coimbatore");
            }
        }

        user.setLastLogin(LocalDateTime.now());
        user = userRepository.save(user);
        return issueTokens(user);
    }

    public AuthResponse refresh(String refreshToken) {
        if (!"refresh".equals(jwtUtil.extractTokenType(refreshToken))) {
            throw new BadRequestException("Invalid refresh token");
        }
        String email = jwtUtil.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new BadRequestException("Invalid refresh token"));
        if (!jwtUtil.isTokenValid(refreshToken, email)) {
            throw new BadRequestException("Expired refresh token");
        }
        return issueTokens(user);
    }

    @Transactional
    public AuthMessageResponse acceptInvitation(AcceptInvitationRequest request) {
        GuideInvitation invitation = guideInvitationRepository.findByToken(request.token())
                .orElseThrow(() -> new BadRequestException("Invalid or expired invitation token"));
        
        if (invitation.isUsed()) {
            throw new BadRequestException("This invitation token has already been used");
        }
        
        if (LocalDateTime.now().isAfter(invitation.getExpiryTime())) {
            throw new BadRequestException("This invitation link has expired");
        }
        
        User user = userRepository.findByEmail(invitation.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("User profile not found for invitation"));
        
        String roleName = "Legal Guide";
        if (user.getRole() == Role.ADMIN) {
            roleName = "Regional Administrator";
            // Check if there is already another active admin for this district
            List<User> activeAdmins = userRepository.findByRoleAndDistrict(Role.ADMIN, user.getDistrict());
            boolean hasActiveAdmin = activeAdmins.stream()
                    .anyMatch(u -> u.getStatus() == UserStatus.ACTIVE && !u.getId().equals(user.getId()));
            if (hasActiveAdmin) {
                throw new BadRequestException("This district already has an active Regional Admin.");
            }
        }

        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        
        invitation.setUsed(true);
        guideInvitationRepository.save(invitation);

        try {
            emailService.sendAccountActivatedEmail(user.getEmail(), user.getName(), roleName);
        } catch (Exception e) {
            System.err.println("Failed to send activation email: " + e.getMessage());
        }
        
        return new AuthMessageResponse("Invitation accepted. Account activated successfully.", true);
    }

    private AuthResponse issueTokens(User user) {
        String access = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refresh = jwtUtil.generateRefreshToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(access, refresh, "Bearer", jwtUtil.getAccessTokenExpiryMinutes(), mapperService.toUserResponse(user));
    }
}
