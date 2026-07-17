package com.aram.legalaid.util;

import com.aram.legalaid.enums.ComplaintCategory;

import java.util.Map;

public final class AuthorityMapper {
    private AuthorityMapper() {}

    private static final Map<ComplaintCategory, String> AUTHORITY = Map.of(
            ComplaintCategory.LABOUR_DISPUTE, "Labour Office",
            ComplaintCategory.CONSUMER_COMPLAINT, "Consumer Disputes Redressal Commission",
            ComplaintCategory.CYBER_CRIME, "Cyber Crime Cell",
            ComplaintCategory.PROPERTY_CIVIL_DISPUTE, "Civil Court / Revenue Office",
            ComplaintCategory.WOMEN_SAFETY_DOMESTIC_VIOLENCE, "Police Station / Women Help Cell",
            ComplaintCategory.CRIMINAL_COMPLAINT, "Police Station",
            ComplaintCategory.GENERAL_LEGAL_AID, "District Legal Services Authority"
    );

    public static String authorityFor(ComplaintCategory category) {
        return AUTHORITY.getOrDefault(category, "District Legal Services Authority");
    }
}
