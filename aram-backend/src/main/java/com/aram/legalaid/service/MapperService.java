package com.aram.legalaid.service;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.model.*;
import com.aram.legalaid.util.DelimitedStringUtil;
import org.springframework.stereotype.Service;

@Service
public class MapperService {
    private final BlockchainService blockchainService;

    public MapperService(BlockchainService blockchainService) {
        this.blockchainService = blockchainService;
    }

    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getMobile(), user.getRole(), user.getStatus(),
                user.getGender(), user.getSpecialization(), user.isHelperVerified(), user.getAvatarUrl(), user.getBio(),
                user.getDistrict(), user.getAddress(), user.getPreferredLanguage(), user.getThemePreference(),
                user.getCreatedAt(), user.getUpdatedAt(), user.getLastLogin(),
                user.getLanguagesKnown(), user.getSpecializationCategories(), user.getMaxActiveCases(),
                user.getCurrentActiveCases(), user.getAvailabilityStatus(), user.isWomenSupportTrained(),
                user.isForcePasswordChange(), user.getServiceArea(), user.getSubSpecializations(),
                user.getExperienceLevel(), user.isCanHandleSensitiveCases(),
                user.isVoiceAssistanceEnabled(), user.isSimpleModeEnabled(), user.getSpeechRatePreference(),
                user.isTwoFactorEnabled()
        );
    }

    public AIResultResponse toAIResultResponse(AIResult result) {
        if (result == null) return null;
        java.util.Map<String, Object> caseSummaryMap = null;
        if (result.getCaseSummary() != null && !result.getCaseSummary().trim().isEmpty()) {
            try {
                caseSummaryMap = new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                    result.getCaseSummary(),
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {}
                );
            } catch (Exception e) {
                System.err.println("Failed to deserialize case summary map: " + e.getMessage());
            }
        }
        return new AIResultResponse(
                result.getId(), result.getCategory(), result.getCategory().getDisplayName(), result.getPriority(),
                result.getPriorityScore(), result.getConfidence(), result.getRecommendedAuthority(), result.getReason(),
                DelimitedStringUtil.split(result.getRequiredDocuments()), DelimitedStringUtil.split(result.getNextSteps()),
                result.isManualReviewRequired(), result.getCreatedAt(),
                result.getDetectedLanguage(), result.getTranslatedSummary(),
                result.getSpokenSummaryText(), result.isReadAloudAvailable(),
                result.getComplexity() != null ? result.getComplexity() : "MEDIUM",
                result.getDetectedIssues() != null ? DelimitedStringUtil.split(result.getDetectedIssues()) : java.util.List.of(),
                caseSummaryMap
        );
    }

    public ComplaintResponse toComplaintResponse(Complaint complaint, AIResult aiResult) {
        Long helperId = complaint.getAssignedHelper() != null ? complaint.getAssignedHelper().getId() : null;
        String helperName = complaint.getAssignedHelper() != null ? complaint.getAssignedHelper().getName() : null;
        BlockchainInfoResponse blockchainInfo = blockchainService.getBlockchainInfo(complaint);
        return new ComplaintResponse(
                complaint.getId(), complaint.getComplaintCustomId(), complaint.getComplaintCustomId(), complaint.getUser().getId(), complaint.getUser().getName(), complaint.getTitle(),
                complaint.getDescription(), complaint.getLanguage(), complaint.getDistrict(), complaint.getInputMode(),
                complaint.getCategory(), complaint.getCategory() == null ? null : complaint.getCategory().getDisplayName(),
                complaint.getPriority(), complaint.getPriorityScore(), complaint.getAuthority(), complaint.getStatus(),
                complaint.isSensitive(), complaint.getPreferredHelperGender(), complaint.getIdentityVisibility(),
                complaint.getCreatedAt(), complaint.getUpdatedAt(), toAIResultResponse(aiResult),
                complaint.getOriginalText(), complaint.getOriginalLanguage(), complaint.getNormalizedText(),
                complaint.getTranslatedText(), complaint.isVoiceInputUsed(), complaint.getVoiceTranscriptConfidence(),
                complaint.getPreferredResponseLanguage(), complaint.getLegalOpinion(),
                helperId, helperName, blockchainInfo,
                complaint.isHighRisk(), complaint.isDisclaimerAccepted(), complaint.getDisclaimerAcceptedAt(),
                complaint.getResolutionSummary(), complaint.getReopenReason(),
                complaint.getSafeContactMethod(), complaint.getSafeContactTime(),
                complaint.isGuideRequested()
        );
    }


    public DocumentResponse toDocumentResponse(UploadedDocument document) {
        return new DocumentResponse(
                document.getId(), document.getComplaint().getId(), document.getFileName(), document.getFileType(),
                document.getVerificationStatus(), document.getPredictedDocumentType(), document.getVerificationScore(), document.getUploadedAt()
        );
    }

    public NotificationResponse toNotificationResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(), notification.getMessage(), notification.getType(), notification.getStatus(),
                notification.isReadFlag(), notification.getCreatedAt(), notification.getSentAt()
        );
    }
}
