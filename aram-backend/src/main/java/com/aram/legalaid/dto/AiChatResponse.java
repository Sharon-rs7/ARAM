package com.aram.legalaid.dto;

import java.util.List;

public record AiChatResponse(
    String reply,
    String answer,
    String category,
    double confidence,
    List<String> suggestedActions,
    String disclaimer
) {}
