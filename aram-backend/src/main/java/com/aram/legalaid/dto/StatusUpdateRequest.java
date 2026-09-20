package com.aram.legalaid.dto;

import com.aram.legalaid.enums.ComplaintStatus;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull(message = "Status is required")
        ComplaintStatus status,
        @JsonAlias({"notes", "comment"})
        String note
) {}

