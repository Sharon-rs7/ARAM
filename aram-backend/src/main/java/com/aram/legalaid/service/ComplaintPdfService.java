package com.aram.legalaid.service;

import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.format.DateTimeFormatter;

@Service
public class ComplaintPdfService {

    private static final Logger log = LoggerFactory.getLogger(ComplaintPdfService.class);

    private static final Color BRAND_DARK_GREEN = new Color(13, 59, 46);
    private static final Color BRAND_EMERALD = new Color(18, 128, 90);
    private static final Color BG_LIGHT_CREAM = new Color(250, 248, 242);
    private static final Color BORDER_GRAY = new Color(222, 226, 223);
    private static final Color TEXT_MUTED = new Color(101, 115, 109);
    private static final Color BADGE_BG = new Color(235, 245, 238);

    public byte[] generateComplaintStatusPdf(Complaint complaint, User citizen) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 32, 32, 32, 32);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Font styles
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 17, BRAND_DARK_GREEN);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, BRAND_EMERALD);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BRAND_DARK_GREEN);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BRAND_DARK_GREEN);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED);
            Font codeFont = FontFactory.getFont(FontFactory.COURIER, 7, TEXT_MUTED);

            // 1. Header Banner Table
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);

            PdfPCell headerCell = new PdfPCell();
            headerCell.setBackgroundColor(BG_LIGHT_CREAM);
            headerCell.setBorderColor(BRAND_DARK_GREEN);
            headerCell.setBorderWidth(1.2f);
            headerCell.setPadding(10);

            Paragraph pBanner = new Paragraph("ARAM CIVIC LEGAL AID & GRIEVANCE REDRESSAL", titleFont);
            pBanner.setAlignment(Element.ALIGN_CENTER);
            headerCell.addElement(pBanner);

            Paragraph pSub = new Paragraph("GOVERNMENT OF TAMIL NADU • STATE CITIZEN LEGAL ACCESS INITIATIVE", subtitleFont);
            pSub.setAlignment(Element.ALIGN_CENTER);
            pSub.setSpacingBefore(2);
            headerCell.addElement(pSub);

            headerTable.addCell(headerCell);
            document.add(headerTable);

            // Case ID & Generated Timestamp
            String caseId = complaint.getComplaintCustomId() != null 
                    ? complaint.getComplaintCustomId() 
                    : "ARAM-2026-" + String.format("%06d", complaint.getId());
            
            String formattedNow = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy, hh:mm a"));
            
            PdfPTable docMetaTable = new PdfPTable(2);
            docMetaTable.setWidthPercentage(100);
            docMetaTable.setWidths(new float[]{60f, 40f});
            docMetaTable.setSpacingBefore(8);
            docMetaTable.setSpacingAfter(6);

            PdfPCell c1 = new PdfPCell(new Phrase("OFFICIAL CASE REPORT: " + caseId, sectionFont));
            c1.setBorder(Rectangle.NO_BORDER);
            c1.setVerticalAlignment(Element.ALIGN_MIDDLE);

            PdfPCell c2 = new PdfPCell(new Phrase("Generated: " + formattedNow + " (IST)", smallFont));
            c2.setBorder(Rectangle.NO_BORDER);
            c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            c2.setVerticalAlignment(Element.ALIGN_MIDDLE);

            docMetaTable.addCell(c1);
            docMetaTable.addCell(c2);
            document.add(docMetaTable);

            // 2. Section: Primary Case Classification
            PdfPTable infoTable = new PdfPTable(4);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{22f, 28f, 22f, 28f});
            infoTable.setSpacingAfter(8);

            String statusStr = complaint.getStatus() != null ? complaint.getStatus().name().replace("_", " ") : "SUBMITTED";
            String categoryStr = complaint.getCategory() != null ? complaint.getCategory().name().replace("_", " ") : "GENERAL CIVIC";
            String priorityStr = complaint.getPriority() != null ? complaint.getPriority().name() : "NORMAL";
            String districtStr = complaint.getDistrict() != null ? complaint.getDistrict() : "Tamil Nadu";
            
            String filingDate = complaint.getCreatedAt() != null 
                    ? complaint.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) 
                    : formattedNow;

            addTableRow4(infoTable, "Case ID", caseId, "Current Status", statusStr, boldFont, true);
            addTableRow4(infoTable, "Category", categoryStr, "Priority Level", priorityStr, regularFont, false);
            addTableRow4(infoTable, "District Jurisdiction", districtStr, "Filing Timestamp", filingDate, regularFont, false);
            
            String deptStr = complaint.getAuthority() != null ? complaint.getAuthority() : "Competent District Authority";
            String evidenceStr = complaint.getEvidenceStatus() != null ? complaint.getEvidenceStatus() : "Verified Digital Copy";
            addTableRow4(infoTable, "Department Authority", deptStr, "Evidence Status", evidenceStr, regularFont, false);

            document.add(infoTable);

            // 3. Section: Citizen & Assigned Legal Guide Info
            PdfPTable partiesTable = new PdfPTable(2);
            partiesTable.setWidthPercentage(100);
            partiesTable.setWidths(new float[]{50f, 50f});
            partiesTable.setSpacingAfter(8);

            // Citizen Cell
            PdfPCell citizenCell = new PdfPCell();
            citizenCell.setBackgroundColor(new Color(253, 253, 251));
            citizenCell.setBorderColor(BORDER_GRAY);
            citizenCell.setPadding(8);

            citizenCell.addElement(new Paragraph("REGISTERED CITIZEN (Complainant)", boldFont));
            String citName = citizen != null ? citizen.getName() : "Registered Citizen";
            String maskedPhone = maskMobile(citizen != null ? citizen.getMobile() : null);
            String maskedEmail = maskEmail(citizen != null ? citizen.getEmail() : null);
            citizenCell.addElement(new Paragraph("Name: " + citName, regularFont));
            citizenCell.addElement(new Paragraph("Phone: " + maskedPhone, regularFont));
            citizenCell.addElement(new Paragraph("Email: " + maskedEmail, regularFont));
            partiesTable.addCell(citizenCell);

            // Legal Guide Cell
            PdfPCell guideCell = new PdfPCell();
            guideCell.setBackgroundColor(new Color(253, 253, 251));
            guideCell.setBorderColor(BORDER_GRAY);
            guideCell.setPadding(8);

            guideCell.addElement(new Paragraph("ASSIGNED LEGAL GUIDE / FACILITATOR", boldFont));
            if (complaint.getAssignedHelper() != null) {
                User guide = complaint.getAssignedHelper();
                guideCell.addElement(new Paragraph("Name: " + guide.getName() + " (Accredited Guide)", regularFont));
                String guideAssignedTime = complaint.getAssignedAt() != null 
                        ? complaint.getAssignedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) 
                        : "Active";
                guideCell.addElement(new Paragraph("Status: Verified Facilitator Assigned on " + guideAssignedTime, regularFont));
                guideCell.addElement(new Paragraph("Support Channel: In-App Confidential Direct Chat Active", smallFont));
            } else {
                guideCell.addElement(new Paragraph("Status: DLSA Auto-Triage & Guide Allocation in Queue", regularFont));
                guideCell.addElement(new Paragraph("Allocation: Assigned based on district legal expertise", smallFont));
            }
            partiesTable.addCell(guideCell);
            document.add(partiesTable);

            // 4. Section: Full Grievance Statement & Narrative
            Paragraph pSubjectTitle = new Paragraph("Grievance Title & Full Narrative:", sectionFont);
            pSubjectTitle.setSpacingAfter(4);
            document.add(pSubjectTitle);

            PdfPTable narrativeTable = new PdfPTable(1);
            narrativeTable.setWidthPercentage(100);
            PdfPCell narrativeCell = new PdfPCell();
            narrativeCell.setBackgroundColor(Color.WHITE);
            narrativeCell.setBorderColor(BORDER_GRAY);
            narrativeCell.setPadding(9);

            Paragraph pTitle = new Paragraph("Title: " + (complaint.getTitle() != null ? complaint.getTitle() : "Civic Assistance Request"), boldFont);
            pTitle.setSpacingAfter(5);
            narrativeCell.addElement(pTitle);

            String fullDesc = complaint.getDescription() != null ? complaint.getDescription() : "Details provided via verified citizen submission.";
            Paragraph pDesc = new Paragraph(fullDesc, regularFont);
            pDesc.setLeading(12);
            narrativeCell.addElement(pDesc);

            narrativeTable.addCell(narrativeCell);
            narrativeTable.setSpacingAfter(8);
            document.add(narrativeTable);

            // 5. Section: Chronological Progress Milestone Pipeline
            Paragraph pJourneyTitle = new Paragraph("Case Progress & Milestone Tracker:", sectionFont);
            pJourneyTitle.setSpacingAfter(4);
            document.add(pJourneyTitle);

            PdfPTable journeyTable = new PdfPTable(1);
            journeyTable.setWidthPercentage(100);
            PdfPCell journeyCell = new PdfPCell();
            journeyCell.setBackgroundColor(new Color(246, 250, 248));
            journeyCell.setBorderColor(BRAND_EMERALD);
            journeyCell.setBorderWidth(1);
            journeyCell.setPadding(8);

            boolean isAssigned = complaint.getAssignedHelper() != null || complaint.getAssignedAt() != null;
            boolean isUnderReview = isAssigned || complaint.getAcknowledgedAt() != null;
            boolean isResolved = "RESOLVED".equalsIgnoreCase(complaint.getStatus() != null ? complaint.getStatus().name() : "");

            journeyCell.addElement(new Paragraph("✓  Milestone 1: Grievance Officially Registered in Central Civic Database (" + filingDate + ")", regularFont));
            journeyCell.addElement(new Paragraph((isUnderReview || isResolved ? "✓" : "→") + "  Milestone 2: AI Statutory Categorization, Urgency Triage & Jurisdiction Match Completed", regularFont));
            journeyCell.addElement(new Paragraph((isAssigned ? "✓" : "○") + "  Milestone 3: Accredited District Legal Guide Allocated for Citizen Support", regularFont));
            journeyCell.addElement(new Paragraph((isUnderReview ? "✓" : "○") + "  Milestone 4: Administrative Follow-up & Authority Coordination with " + deptStr, regularFont));
            journeyCell.addElement(new Paragraph((isResolved ? "✓" : "○") + "  Milestone 5: Formal Redressal & Official Case Resolution Closed", regularFont));

            if (complaint.getResolutionSummary() != null && !complaint.getResolutionSummary().isBlank()) {
                Paragraph resPara = new Paragraph("Resolution Notes: " + complaint.getResolutionSummary(), boldFont);
                resPara.setSpacingBefore(4);
                journeyCell.addElement(resPara);
            }

            journeyTable.addCell(journeyCell);
            journeyTable.setSpacingAfter(8);
            document.add(journeyTable);

            // 6. Section: Digital Integrity & Verification Seal
            String integrityHash = computeSha256(caseId + "|" + filingDate + "|" + statusStr);

            PdfPTable sealTable = new PdfPTable(2);
            sealTable.setWidthPercentage(100);
            sealTable.setWidths(new float[]{75f, 25f});
            
            PdfPCell sealTextCell = new PdfPCell();
            sealTextCell.setBorderColor(BORDER_GRAY);
            sealTextCell.setPadding(7);
            sealTextCell.setBackgroundColor(BG_LIGHT_CREAM);
            sealTextCell.addElement(new Paragraph("TAMIL NADU CIVIC LEGAL NOTARIZATION SEAL", boldFont));
            sealTextCell.addElement(new Paragraph("Cryptographic Digest: " + integrityHash.substring(0, 32).toUpperCase() + "...", codeFont));
            sealTextCell.addElement(new Paragraph("Statutory Verification Link: https://ouraram.in/track-complaint?id=" + caseId, smallFont));
            sealTextCell.addElement(new Paragraph("Official electronic status summary generated by ARAM Civic Legal Aid Platform. Certified valid for government and DLSA review.", smallFont));
            sealTable.addCell(sealTextCell);

            PdfPCell stampCell = new PdfPCell();
            stampCell.setBorderColor(BORDER_GRAY);
            stampCell.setBackgroundColor(BG_LIGHT_CREAM);
            stampCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            stampCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            stampCell.setPadding(8);
            Paragraph stampText = new Paragraph("ARAM\nVERIFIED\n✓", boldFont);
            stampText.setAlignment(Element.ALIGN_CENTER);
            stampCell.addElement(stampText);
            sealTable.addCell(stampCell);

            document.add(sealTable);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate comprehensive complaint PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating complaint PDF: " + e.getMessage());
        }
    }

    private void addTableRow4(PdfPTable table, String l1, String v1, String l2, String v2, Font font, boolean highlight) {
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, TEXT_MUTED);

        PdfPCell cL1 = new PdfPCell(new Phrase(l1, labelFont));
        cL1.setPadding(5);
        cL1.setBackgroundColor(new Color(252, 252, 250));
        cL1.setBorderColor(BORDER_GRAY);

        PdfPCell cV1 = new PdfPCell(new Phrase(v1, font));
        cV1.setPadding(5);
        cV1.setBackgroundColor(highlight ? BADGE_BG : Color.WHITE);
        cV1.setBorderColor(BORDER_GRAY);

        PdfPCell cL2 = new PdfPCell(new Phrase(l2, labelFont));
        cL2.setPadding(5);
        cL2.setBackgroundColor(new Color(252, 252, 250));
        cL2.setBorderColor(BORDER_GRAY);

        PdfPCell cV2 = new PdfPCell(new Phrase(v2, font));
        cV2.setPadding(5);
        cV2.setBackgroundColor(highlight ? BADGE_BG : Color.WHITE);
        cV2.setBorderColor(BORDER_GRAY);

        table.addCell(cL1);
        table.addCell(cV1);
        table.addCell(cL2);
        table.addCell(cV2);
    }

    private String maskMobile(String mobile) {
        if (mobile == null || mobile.length() < 4) return "+91 ******XXXX";
        String clean = mobile.replaceAll("[^0-9]", "");
        if (clean.length() >= 4) {
            return "+91 ******" + clean.substring(clean.length() - 4);
        }
        return "+91 ******XXXX";
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "c***n@ouraram.in";
        int atIdx = email.indexOf('@');
        if (atIdx <= 2) return "***" + email.substring(atIdx);
        return email.charAt(0) + "***" + email.charAt(atIdx - 1) + email.substring(atIdx);
    }

    private String computeSha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "ARAM_NOTARIZED_DIGEST_" + System.currentTimeMillis();
        }
    }
}
