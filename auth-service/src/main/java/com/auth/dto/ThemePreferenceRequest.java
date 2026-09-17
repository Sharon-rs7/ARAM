package com.auth.dto;

import com.auth.entity.ThemePreference;
import jakarta.validation.constraints.NotNull;

public record ThemePreferenceRequest(
        @NotNull(message = "Theme preference is required")
        ThemePreference themePreference
) {}
