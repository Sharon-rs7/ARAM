package com.aram.legalaid.util;

import com.aram.legalaid.enums.ComplaintCategory;

import java.util.List;
import java.util.Map;

public final class DocumentChecklistMapper {
    private DocumentChecklistMapper() {}

    private static final Map<ComplaintCategory, List<String>> DOCUMENTS = Map.of(
            ComplaintCategory.LABOUR_DISPUTE, List.of("Salary Slip", "Employee ID", "Appointment Letter", "Bank Statement if salary transfer is missing"),
            ComplaintCategory.CONSUMER_COMPLAINT, List.of("Invoice / Bill", "Payment Proof", "Product Photos", "Seller Communication Screenshot"),
            ComplaintCategory.CYBER_CRIME, List.of("Transaction Screenshot", "Bank Statement", "UPI ID / Transaction ID", "Mobile Number or Profile Link of Suspect"),
            ComplaintCategory.PROPERTY_CIVIL_DISPUTE, List.of("Patta / Chitta", "Sale Deed", "Property Tax Receipt", "Photos of Disputed Area"),
            ComplaintCategory.WOMEN_SAFETY_DOMESTIC_VIOLENCE, List.of("Any Medical Proof", "Photo Evidence if available", "Witness Details if available", "Previous Complaint Copy if available"),
            ComplaintCategory.CRIMINAL_COMPLAINT, List.of("ID Proof", "Incident Photos if available", "Witness Details", "Previous Complaint Copy if available"),
            ComplaintCategory.GENERAL_LEGAL_AID, List.of("ID Proof", "Complaint Summary", "Relevant Supporting Documents")
    );

    public static List<String> documentsFor(ComplaintCategory category) {
        return DOCUMENTS.getOrDefault(category, DOCUMENTS.get(ComplaintCategory.GENERAL_LEGAL_AID));
    }
}
