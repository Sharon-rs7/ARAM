package com.aram.legalaid.controller;

import com.aram.legalaid.model.OtpVerification;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.OtpVerificationRepository;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.service.ProfileCompletionService;
import com.aram.legalaid.service.UserService;
import com.aram.legalaid.exception.BadRequestException;
import com.aram.legalaid.exception.ForbiddenException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.aram.legalaid.util.FileUploadValidator;
import com.aram.legalaid.util.UploadCategory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/citizen")
public class CitizenProfileController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final ProfileCompletionService profileCompletionService;
    private final OtpVerificationRepository otpVerificationRepository;
    private final Path profileUploadDir;
    private final FileUploadValidator fileUploadValidator;

    @Autowired
    private com.aram.legalaid.service.EmailService emailService;

    @Autowired
    private com.aram.legalaid.repository.ComplaintRepository complaintRepository;

    @Autowired
    private com.aram.legalaid.service.AIClientService aiClientService;

    @Autowired
    private com.aram.legalaid.service.SmsService smsService;

    public CitizenProfileController(UserService userService, UserRepository userRepository,
                                    ProfileCompletionService profileCompletionService,
                                    OtpVerificationRepository otpVerificationRepository,
                                    @Value("${app.upload.dir:uploads}") String uploadDir,
                                    FileUploadValidator fileUploadValidator) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.profileCompletionService = profileCompletionService;
        this.otpVerificationRepository = otpVerificationRepository;
        this.profileUploadDir = Path.of(uploadDir, "profile");
        this.fileUploadValidator = fileUploadValidator;
    }

    // Dynamic Profile Response payload
    public record ProfileResponse(
            int completionPercentage,
            boolean profileCompleted,
            boolean emailVerified,
            String profilePhotoUrl,
            List<String> missingFields,
            String name,
            String email,
            String mobile,
            LocalDate dateOfBirth,
            String gender,
            String address,
            String district,
            String state,
            String pincode
    ) {}

    private ProfileResponse buildProfileResponse(User user, ProfileCompletionService.CompletionState state) {
        return new ProfileResponse(
                state.getCompletionPercentage(),
                state.isProfileCompleted(),
                state.isEmailVerified(),
                state.getProfilePhotoUrl(),
                state.getMissingFields(),
                user.getName(),
                user.getEmail(),
                user.getMobile(),
                user.getDateOfBirth(),
                user.getGender(),
                user.getAddress(),
                user.getDistrict(),
                user.getState(),
                user.getPincode()
        );
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile() {
        User user = userService.currentUser();
        ProfileCompletionService.CompletionState state = profileCompletionService.recalculateAndSave(user);
        return ResponseEntity.ok(buildProfileResponse(user, state));
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<ProfileResponse> updateProfile(@RequestBody Map<String, Object> body) {
        User user = userService.currentUser();

        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("gender")) user.setGender((String) body.get("gender"));
        if (body.containsKey("address")) user.setAddress((String) body.get("address"));
        if (body.containsKey("district")) user.setDistrict((String) body.get("district"));
        if (body.containsKey("state")) user.setState((String) body.get("state"));
        if (body.containsKey("pincode")) user.setPincode((String) body.get("pincode"));

        if (body.containsKey("dateOfBirth") && body.get("dateOfBirth") != null) {
            user.setDateOfBirth(LocalDate.parse((String) body.get("dateOfBirth")));
        }

        if (body.containsKey("mobile") && body.get("mobile") != null) {
            String mobile = (String) body.get("mobile");
            if (!mobile.equals(user.getMobile())) {
                if (userRepository.existsByMobile(mobile)) {
                    throw new BadRequestException("Mobile number already registered by another user.");
                }
                user.setMobile(mobile);
            }
        }

        if (body.containsKey("email") && body.get("email") != null) {
            String email = ((String) body.get("email")).trim().toLowerCase();
            if (!email.equals(user.getEmail())) {
                if (userRepository.existsByEmail(email)) {
                    throw new BadRequestException("Email already registered by another user.");
                }
                user.setEmail(email);
                user.setEmailVerified(false); // Invalidate verification on email change
            }
        }

        userRepository.save(user);
        ProfileCompletionService.CompletionState state = profileCompletionService.recalculateAndSave(user);
        if (state.isProfileCompleted() && user.isEmailVerified()) {
            emailService.sendAccountVerifiedEmail(user.getEmail(), user.getName());
        }
        return ResponseEntity.ok(buildProfileResponse(user, state));
    }

    @PostMapping("/profile/photo")
    @Transactional
    public ResponseEntity<ProfileResponse> uploadPhoto(@RequestParam("file") MultipartFile file) {
        User user = userService.currentUser();
        String storedName = fileUploadValidator.validateAndGenerateSafeName(file, UploadCategory.IMAGE);

        try {
            Path targetPath = fileUploadValidator.getSafeUploadPath(storedName, "profile");
            Files.createDirectories(targetPath.getParent());
            Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            user.setAvatarUrl("/uploads/profile/" + storedName);
            userRepository.save(user);

            ProfileCompletionService.CompletionState state = profileCompletionService.recalculateAndSave(user);
            if (state.isProfileCompleted() && user.isEmailVerified()) {
                emailService.sendAccountVerifiedEmail(user.getEmail(), user.getName());
            }
            return ResponseEntity.ok(buildProfileResponse(user, state));
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload profile photo.");
        }
    }

    @DeleteMapping("/profile/photo")
    @Transactional
    public ResponseEntity<ProfileResponse> deletePhoto() {
        User user = userService.currentUser();
        user.setAvatarUrl(null);
        userRepository.save(user);

        ProfileCompletionService.CompletionState state = profileCompletionService.recalculateAndSave(user);
        return ResponseEntity.ok(buildProfileResponse(user, state));
    }

    @GetMapping("/profile/completion")
    public ResponseEntity<Map<String, Object>> getCompletion() {
        User user = userService.currentUser();
        ProfileCompletionService.CompletionState state = profileCompletionService.recalculateAndSave(user);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("completionPercentage", state.getCompletionPercentage());
        response.put("profileCompleted", state.isProfileCompleted());
        response.put("emailVerified", state.isEmailVerified());
        response.put("profilePhotoUrl", state.getProfilePhotoUrl());
        response.put("missingFields", state.getMissingFields());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/profile/email/send-otp")
    @Transactional
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> body) {
        User user = userService.currentUser();
        String email = body.get("email");
        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("Email is required.");
        }
        email = email.trim().toLowerCase();

        // 1. Rate Limit Resend Check (60 seconds)
        long recentCount = otpVerificationRepository.countOtpsSentSince(user.getId(), LocalDateTime.now().minusSeconds(60));
        if (recentCount > 0) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("success", false, "message", "Please wait at least 60 seconds before requesting a new OTP."));
        }

        // 2. Generate 6-digit secure random OTP
        SecureRandom random = new SecureRandom();
        int otpVal = 100000 + random.nextInt(900000);
        String otp = String.valueOf(otpVal);
        String otpHash = hashSha256(otp);

        // 3. Save OTP in repository
        OtpVerification verification = new OtpVerification();
        verification.setUser(user);
        verification.setEmail(email);
        verification.setOtpHash(otpHash);
        verification.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otpVerificationRepository.save(verification);

        // 4. Send Email
        // 4. Send Email via central EmailService (asynchronously)
        emailService.sendOtpEmail(email, user.getName(), otp);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Verification email sent successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/profile/email/verify-otp")
    @Transactional
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> body) {
        User user = userService.currentUser();
        String email = body.get("email");
        String otp = body.get("otp");
        if (email == null || otp == null || email.trim().isEmpty() || otp.trim().isEmpty()) {
            throw new BadRequestException("Email and OTP are required.");
        }
        email = email.trim().toLowerCase();
        otp = otp.trim();

        // Find active OTPs
        List<OtpVerification> activeOtps = otpVerificationRepository.findActiveOtps(user.getId(), email, LocalDateTime.now());
        if (activeOtps.isEmpty()) {
            throw new BadRequestException("OTP expired or invalid. Please request a new code.");
        }

        // Sort descending by creation date to get the newest
        activeOtps.sort((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()));
        OtpVerification activeOtp = activeOtps.get(0);

        // Check attempt count
        if (activeOtp.getAttemptCount() >= 3) {
            activeOtp.setVerifiedAt(LocalDateTime.now()); // Invalidate OTP
            otpVerificationRepository.save(activeOtp);
            throw new BadRequestException("Too many failed attempts. This OTP has been invalidated. Please request a new code.");
        }

        String inputHash = hashSha256(otp);
        if (activeOtp.getOtpHash().equals(inputHash)) {
            // Verify Successful
            activeOtp.setVerifiedAt(LocalDateTime.now());
            otpVerificationRepository.save(activeOtp);

            user.setEmail(email);
            user.setEmailVerified(true);
            userRepository.save(user);

            ProfileCompletionService.CompletionState state = profileCompletionService.recalculateAndSave(user);
            if (state.isProfileCompleted() && user.isEmailVerified()) {
                emailService.sendAccountVerifiedEmail(user.getEmail(), user.getName());
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Email verified successfully."));
        } else {
            // Increment failed attempt count
            activeOtp.setAttemptCount(activeOtp.getAttemptCount() + 1);
            otpVerificationRepository.save(activeOtp);
            throw new BadRequestException("Invalid OTP code. Remaining attempts: " + (3 - activeOtp.getAttemptCount()));
        }
    }

    @PostMapping("/profile/mobile/send-otp")
    @Transactional
    public ResponseEntity<Map<String, Object>> sendMobileOtp(@RequestBody Map<String, String> body) {
        User user = userService.currentUser();
        String mobile = body.get("mobile");
        if (mobile == null || mobile.trim().isEmpty()) {
            throw new BadRequestException("Mobile number is required.");
        }
        mobile = mobile.trim();
        if (!mobile.matches("^[6-9]\\d{9}$")) {
            throw new BadRequestException("Mobile number must be a valid 10-digit number.");
        }

        // 1. Rate Limit Resend Check (60 seconds)
        long recentCount = otpVerificationRepository.countOtpsSentSince(user.getId(), LocalDateTime.now().minusSeconds(60));
        if (recentCount > 0) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("success", false, "message", "Please wait at least 60 seconds before requesting a new OTP."));
        }

        // 2. Generate 6-digit secure random OTP
        SecureRandom random = new SecureRandom();
        int otpVal = 100000 + random.nextInt(900000);
        String otp = String.valueOf(otpVal);
        String otpHash = hashSha256(otp);

        // 3. Save OTP in repository using "mobile:NUMBER" pattern
        OtpVerification verification = new OtpVerification();
        verification.setUser(user);
        verification.setEmail("mobile:" + mobile);
        verification.setOtpHash(otpHash);
        verification.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otpVerificationRepository.save(verification);

        // 4. Send SMS
        smsService.sendOtpSms(mobile, otp);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Verification SMS sent successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/profile/mobile/verify-otp")
    @Transactional
    public ResponseEntity<Map<String, Object>> verifyMobileOtp(@RequestBody Map<String, String> body) {
        User user = userService.currentUser();
        String mobile = body.get("mobile");
        String otp = body.get("otp");
        if (mobile == null || otp == null || mobile.trim().isEmpty() || otp.trim().isEmpty()) {
            throw new BadRequestException("Mobile number and OTP are required.");
        }
        mobile = mobile.trim();
        otp = otp.trim();

        // Find active OTPs
        List<OtpVerification> activeOtps = otpVerificationRepository.findActiveOtps(user.getId(), "mobile:" + mobile, LocalDateTime.now());
        if (activeOtps.isEmpty()) {
            throw new BadRequestException("OTP expired or invalid. Please request a new code.");
        }

        // Sort descending by creation date to get the newest
        activeOtps.sort((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()));
        OtpVerification activeOtp = activeOtps.get(0);

        // Check attempt count
        if (activeOtp.getAttemptCount() >= 3) {
            activeOtp.setVerifiedAt(LocalDateTime.now()); // Invalidate OTP
            otpVerificationRepository.save(activeOtp);
            throw new BadRequestException("Too many failed attempts. This OTP has been invalidated. Please request a new code.");
        }

        String inputHash = hashSha256(otp);
        if (activeOtp.getOtpHash().equals(inputHash)) {
            // Verify Successful
            activeOtp.setVerifiedAt(LocalDateTime.now());
            otpVerificationRepository.save(activeOtp);

            // Check if mobile already exists for another user
            if (userRepository.existsByMobile(mobile) && !mobile.equals(user.getMobile())) {
                throw new BadRequestException("Mobile number already registered by another user.");
            }

            user.setMobile(mobile);
            userRepository.save(user);

            profileCompletionService.recalculateAndSave(user);

            return ResponseEntity.ok(Map.of("success", true, "message", "Mobile number verified successfully."));
        } else {
            // Increment failed attempt count
            activeOtp.setAttemptCount(activeOtp.getAttemptCount() + 1);
            otpVerificationRepository.save(activeOtp);
            throw new BadRequestException("Invalid OTP code. Remaining attempts: " + (3 - activeOtp.getAttemptCount()));
        }
    }

    private String hashSha256(String data) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 Hashing failed", e);
        }
    }

    @PostMapping("/complaints/{id}/guide-request")
    @Transactional
    public ResponseEntity<Map<String, Object>> saveGuideRequestDecision(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        User user = userService.currentUser();
        com.aram.legalaid.model.Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new com.aram.legalaid.exception.ResourceNotFoundException("Complaint not found"));

        if (!complaint.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not authorized to update this complaint");
        }

        Boolean guideRequested = body.get("guideRequested");
        if (guideRequested == null) {
            throw new BadRequestException("guideRequested boolean value is required");
        }

        complaint.setGuideRequested(guideRequested);
        complaintRepository.save(complaint);

        // Send Email notification to Admins if Guide requested
        if (guideRequested) {
            try {
                List<User> admins = userRepository.findByRole(com.aram.legalaid.enums.Role.ADMIN);
                for (User admin : admins) {
                    emailService.sendAdminNewRequestEmail(
                        admin.getEmail(),
                        admin.getName(),
                        complaint.getComplaintCustomId(),
                        complaint.getDistrict(),
                        complaint.getUser().getState(),
                        complaint.getLanguage() != null ? complaint.getLanguage() : "ENGLISH",
                        complaint.getCategory() != null ? complaint.getCategory().name() : "GENERAL"
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to dispatch admin guide request emails: " + e.getMessage());
            }
        }

        // Sync to MongoDB case context
        try {
            aiClientService.syncComplaint(
                complaint.getComplaintCustomId(),
                complaint.getStatus().name(),
                null,
                null,
                "Guide request preference saved: " + guideRequested,
                guideRequested
            );
        } catch (Exception e) {
            System.err.println("Failed to sync guide request to FastAPI: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("success", true, "guideRequested", guideRequested));
    }
}
