package com.aram.legalaid.dto;

import java.util.List;

public record CitizenChatContextDTO(
    UserSummary user,
    List<CaseSummary> activeCases,
    List<CaseSummary> recentCases,
    CaseSummary targetedCase,
    String matchedCaseId
) {
    public record UserSummary(
        Long userId,
        String name,
        String district,
        String state,
        String preferredLanguage,
        String role
    ) {}

    public record CaseSummary(
        Long id,
        String complaintCustomId,
        String title,
        String category,
        String status,
        String priority,
        String district,
        String authority,
        String createdAt,
        String assignedGuideName,
        String assignedGuideSpecialization,
        String descriptionSummary,
        List<DocumentSummary> documents,
        List<MessageSummary> citizenVisibleUpdates
    ) {}

    public record DocumentSummary(
        Long id,
        String documentType,
        String fileName,
        String verificationStatus,
        String uploadedAt
    ) {}

    public record MessageSummary(
        String senderRole,
        String messageType,
        String messageText,
        String sentAt
    ) {}
}