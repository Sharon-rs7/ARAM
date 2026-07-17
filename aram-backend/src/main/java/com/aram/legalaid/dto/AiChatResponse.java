package com.aram.legalaid.dto;

import java.util.List;

public record AiChatResponse(
    String reply,
    String category,
    double confidence,
    List<String> suggestedActions,
    String disclaimer
) {}
