package com.aram.legalaid.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiChatRequest(
    String message,
    String language,
    String userRole,
    Long complaintId,
    String complaintCustomId,
    String conversationId,
    String sessionId,
    CitizenChatContextDTO citizenContext
) {
    public AiChatRequest(String message, String language, String userRole, Long complaintId) {
        this(message, language, userRole, complaintId, null, null, null, null);
    }
}
