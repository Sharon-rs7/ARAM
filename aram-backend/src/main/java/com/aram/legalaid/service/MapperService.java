package com.aram.legalaid.service;

import com.aram.legalaid.dto.*;
import com.aram.legalaid.model.*;
import com.aram.legalaid.util.DelimitedStringUtil;
import org.springframework.stereotype.Service;

@Service
public class MapperService {
    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getMobile(), user.getRole(), user.getStatus(),
                user.getGender(), user.getSpecialization(), user.isHelperVerified(), user.getAvatarUrl(), user.getBio(),
                user.getDistrict(), user.getAddress(), user.getPreferredLanguage(), user.getThemePreference(),
                user.getCreatedAt(), user.getUpdatedAt(), user.getLastLogin()
        );
    }

    public AIResultResponse toAIResultResponse(AIResult result) {
        if (result == null) return null;
        return new AIResultResponse(
                result.getId(), result.getCategory(), result.getCategory().getDisplayName(), result.getPriority(),
                result.getPriorityScore(), result.getConfidence(), result.getRecommendedAuthority(), result.getReason(),
                DelimitedStringUtil.split(result.getRequiredDocuments()), DelimitedStringUtil.split(result.getNextSteps()),
                result.isManualReviewRequired(), result.getCreatedAt()
        );
    }

    public ComplaintResponse toComplaintResponse(Complaint complaint, AIResult aiResult) {
        return new ComplaintResponse(
                complaint.getId(), complaint.getUser().getId(), complaint.getUser().getName(), complaint.getTitle(),
                complaint.getDescription(), complaint.getLanguage(), complaint.getDistrict(), complaint.getInputMode(),
                complaint.getCategory(), complaint.getCategory() == null ? null : complaint.getCategory().getDisplayName(),
                complaint.getPriority(), complaint.getPriorityScore(), complaint.getAuthority(), complaint.getStatus(),
                complaint.isSensitive(), complaint.getPreferredHelperGender(), complaint.getIdentityVisibility(),
                complaint.getCreatedAt(), complaint.getUpdatedAt(), toAIResultResponse(aiResult)
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
