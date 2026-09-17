package com.auth.dto;

public record AuthMessageResponse(
        String message,
        boolean success
) {}
