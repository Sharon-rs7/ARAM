package com.aram.legalaid.util;

import com.aram.legalaid.enums.ComplaintCategory;

import java.util.List;
import java.util.Map;

public final class NextStepMapper {
    private NextStepMapper() {}

    private static final Map<ComplaintCategory, List<String>> NEXT_STEPS = Map.of(
            ComplaintCategory.LABOUR_DISPUTE, List.of("Collect salary and employment proof", "Visit or contact the local Labour Office", "Submit complaint with documents", "Keep acknowledgement copy for tracking"),
            ComplaintCategory.CONSUMER_COMPLAINT, List.of("Keep invoice and payment proof ready", "Contact seller/customer support once", "File complaint with Consumer Forum if unresolved", "Track complaint status"),
            ComplaintCategory.CYBER_CRIME, List.of("Save all screenshots and transaction IDs", "Inform bank immediately if money loss occurred", "Report to Cyber Crime Cell / Portal", "Keep cyber complaint acknowledgement number"),
            ComplaintCategory.PROPERTY_CIVIL_DISPUTE, List.of("Collect ownership/property documents", "Take photos of disputed area if safe", "Approach Revenue Office or Civil Court guidance", "Avoid direct confrontation"),
            ComplaintCategory.WOMEN_SAFETY_DOMESTIC_VIOLENCE, List.of("Move to a safe place if there is immediate risk", "Contact Police or Women Help Cell", "Keep evidence safely if available", "Request privacy mode and woman helper support"),
            ComplaintCategory.CRIMINAL_COMPLAINT, List.of("Ensure personal safety first", "Collect incident details and evidence", "Approach nearest Police Station", "Keep FIR/CSR acknowledgement copy"),
            ComplaintCategory.GENERAL_LEGAL_AID, List.of("Prepare a short summary of the issue", "Collect relevant documents", "Contact legal aid services", "Follow recommended authority guidance")
    );

    public static List<String> nextStepsFor(ComplaintCategory category) {
        return NEXT_STEPS.getOrDefault(category, NEXT_STEPS.get(ComplaintCategory.GENERAL_LEGAL_AID));
    }
}
