package com.aram.legalaid.enums;

public enum ComplaintCategory {
    LABOUR_DISPUTE("Labour Dispute"),
    CONSUMER_COMPLAINT("Consumer Complaint"),
    CYBER_CRIME("Cyber Crime"),
    PROPERTY_CIVIL_DISPUTE("Property / Civil Dispute"),
    WOMEN_SAFETY_DOMESTIC_VIOLENCE("Women Safety / Domestic Violence"),
    CRIMINAL_COMPLAINT("Criminal Complaint"),
    GENERAL_LEGAL_AID("General Legal Aid");

    private final String displayName;

    ComplaintCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
