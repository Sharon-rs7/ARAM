package com.aram.legalaid.service;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.UserStatus;
import com.aram.legalaid.exception.BadRequestException;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MapperService mapperService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, MapperService mapperService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.mapperService = mapperService;
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

    private AuthResponse issueTokens(User user) {
        String access = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refresh = jwtUtil.generateRefreshToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(access, refresh, "Bearer", jwtUtil.getAccessTokenExpiryMinutes(), mapperService.toUserResponse(user));
    }
}
