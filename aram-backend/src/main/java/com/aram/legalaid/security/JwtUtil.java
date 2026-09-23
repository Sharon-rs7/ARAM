package com.aram.legalaid.security;

import com.aram.legalaid.enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {
    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.access-token-expiry-minutes}")
    private long accessTokenExpiryMinutes;

    @Value("${app.jwt.refresh-token-expiry-days}")
    private long refreshTokenExpiryDays;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @PostConstruct
    public void validateSecret() {
        boolean isProduction = "prod".equalsIgnoreCase(activeProfile) || "production".equalsIgnoreCase(activeProfile);
        if (isProduction) {
            if (secret == null || secret.trim().length() < 32 || "ARAMLegalAidJwtSecretKeyForDevelopmentOnly2026".equals(secret)) {
                throw new IllegalStateException("CRITICAL SECURITY ERROR: In production, JWT secret key must be configured with a unique, cryptographically strong key of at least 32 characters! Configure JWT_SECRET.");
            }
        } else {
            if (secret == null || secret.trim().length() < 32) {
                secret = "ARAMLegalAidJwtSecretKeyForDevelopmentOnly2026";
            }
            if ("ARAMLegalAidJwtSecretKeyForDevelopmentOnly2026".equals(secret)) {
                System.err.println("==========================================================================");
                System.err.println("WARNING: Running on default JWT secret key! This is insecure for production.");
                System.err.println("Please configure the JWT_SECRET environment variable.");
                System.err.println("==========================================================================");
            }
        }
    }

    public String generateAccessToken(Long userId, String email, Role role) {
        return generateToken(userId, email, role, accessTokenExpiryMinutes, ChronoUnit.MINUTES, "access");
    }

    public String generateRefreshToken(Long userId, String email, Role role) {
        return generateToken(userId, email, role, refreshTokenExpiryDays, ChronoUnit.DAYS, "refresh");
    }

    private String generateToken(Long userId, String email, Role role, long amount, ChronoUnit unit, String tokenType) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("role", role.name())
                .claim("tokenType", tokenType)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plus(amount, unit)))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractTokenType(String token) {
        return extractAllClaims(token).get("tokenType", String.class);
    }

    public boolean isTokenValid(String token, String username) {
        String subject = extractUsername(token);
        return subject.equals(username) && !isExpired(token);
    }

    private boolean isExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public long getAccessTokenExpiryMinutes() {
        return accessTokenExpiryMinutes;
    }
}
