package com.aram.legalaid.dto;

import com.aram.legalaid.enums.ComplaintStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull(message = "Status is required")
        ComplaintStatus status,
        String note,
        com.aram.legalaid.enums.PriorityLevel priority
) {}
