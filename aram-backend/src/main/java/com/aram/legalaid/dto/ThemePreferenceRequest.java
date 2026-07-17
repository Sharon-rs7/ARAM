package com.aram.legalaid.dto;

import com.aram.legalaid.enums.ThemePreference;
import jakarta.validation.constraints.NotNull;

public record ThemePreferenceRequest(
        @NotNull(message = "Theme preference is required")
        ThemePreference themePreference
) {}
