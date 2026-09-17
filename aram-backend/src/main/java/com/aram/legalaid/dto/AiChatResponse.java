package com.aram.legalaid.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiChatResponse(
    String reply,
    String answer,
    Object category,
    double confidence,
    List<String> suggestedActions,
    String disclaimer
) {
    public String getCategoryString() {
        if (category == null) return "GENERAL_LEGAL_AID";
        if (category instanceof Map) {
            Object name = ((Map) category).get("name");
            return name != null ? name.toString() : "GENERAL_LEGAL_AID";
        }
        return category.toString();
    }
}
