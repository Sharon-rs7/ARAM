package com.aram.legalaid.dto;

import com.aram.legalaid.enums.*;
import java.time.LocalDateTime;

public record ComplaintResponse(
        Long id,
        Long userId,
        String userName,
        String title,
        String description,
        String language,
        String district,
        InputMode inputMode,
        ComplaintCategory category,
        String categoryLabel,
        PriorityLevel priority,
        Integer priorityScore,
        String authority,
        ComplaintStatus status,
        boolean sensitive,
        HelperGender preferredHelperGender,
        IdentityVisibility identityVisibility,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        AIResultResponse aiResult
) {}
