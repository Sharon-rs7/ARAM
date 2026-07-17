package com.aram.legalaid.controller;

import com.aram.legalaid.dto.ThemePreferenceRequest;
import com.aram.legalaid.dto.UserResponse;
import com.aram.legalaid.dto.UserUpdateRequest;
import com.aram.legalaid.service.MapperService;
import com.aram.legalaid.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final MapperService mapperService;

    public UserController(UserService userService, MapperService mapperService) {
        this.userService = userService;
        this.mapperService = mapperService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(mapperService.toUserResponse(userService.currentUser()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(@Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(mapperService.toUserResponse(userService.updateCurrentUser(request)));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<UserResponse> updateAvatar(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(mapperService.toUserResponse(userService.updateAvatar(file)));
    }

    @PutMapping("/me/theme")
    public ResponseEntity<UserResponse> updateTheme(@Valid @RequestBody ThemePreferenceRequest request) {
        return ResponseEntity.ok(mapperService.toUserResponse(userService.updateTheme(request)));
    }
}
