package com.aram.legalaid.dto;

public record AiChatRequest(
    String message,
    String language,
    String userRole,
    Long complaintId
) {}
