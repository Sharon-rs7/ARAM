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
import java.time.format.DateTimeFormatter;

@Service
public class ComplaintPdfService {

    private static final Logger log = LoggerFactory.getLogger(ComplaintPdfService.class);

    private static final Color BRAND_DARK_GREEN = new Color(13, 59, 46);
    private static final Color BRAND_EMERALD = new Color(18, 128, 90);
    private static final Color BG_LIGHT_CREAM = new Color(250, 248, 242);
    private static final Color BORDER_GRAY = new Color(222, 226, 223);
    private static final Color TEXT_MUTED = new Color(101, 115, 109);

    public byte[] generateComplaintStatusPdf(Complaint complaint, User citizen) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Font styles
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BRAND_DARK_GREEN);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BRAND_EMERALD);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BRAND_DARK_GREEN);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BRAND_DARK_GREEN);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED);

            // Header Banner Table
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);

            PdfPCell headerCell = new PdfPCell();
            headerCell.setBackgroundColor(BG_LIGHT_CREAM);
            headerCell.setBorderColor(BORDER_GRAY);
            headerCell.setBorderWidth(1);
            headerCell.setPadding(12);

            Paragraph pBanner = new Paragraph("ARAM CIVIC LEGAL AID & JUSTICE", titleFont);
            pBanner.setAlignment(Element.ALIGN_CENTER);
            headerCell.addElement(pBanner);

            Paragraph pSub = new Paragraph("GOVERNMENT OF TAMIL NADU • CITIZEN LEGAL ACCESS INITIATIVE", subtitleFont);
            pSub.setAlignment(Element.ALIGN_CENTER);
            pSub.setSpacingBefore(3);
            headerCell.addElement(pSub);

            headerTable.addCell(headerCell);
            document.add(headerTable);

            document.add(new Paragraph(" "));

            // Document Title & Timestamp
            String formattedDate = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy, hh:mm a"));
            Paragraph reportTitle = new Paragraph("OFFICIAL COMPLAINT STATUS REPORT", sectionFont);
            Paragraph timestampPara = new Paragraph("Generated on: " + formattedDate + " (IST)", smallFont);
            timestampPara.setSpacingAfter(10);
            document.add(reportTitle);
            document.add(timestampPara);

            // Case Overview Table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{35f, 65f});
            infoTable.setSpacingBefore(5);

            String caseId = complaint.getComplaintCustomId() != null 
                    ? complaint.getComplaintCustomId() 
                    : "ARAM-2026-" + String.format("%06d", complaint.getId());

            addTableRow(infoTable, "Complaint Case ID", caseId, boldFont, true);
            addTableRow(infoTable, "Registered Citizen", citizen != null ? citizen.getName() : "Registered Citizen", regularFont, false);
            addTableRow(infoTable, "District & Jurisdiction", (complaint.getDistrict() != null ? complaint.getDistrict() : "Tamil Nadu") + " • Legal Services Authority", regularFont, false);
            addTableRow(infoTable, "Legal Domain / Category", complaint.getCategory() != null ? complaint.getCategory().name().replace("_", " ") : "GENERAL GRIEVANCE", regularFont, false);
            addTableRow(infoTable, "Current Case Status", complaint.getStatus() != null ? complaint.getStatus().name().replace("_", " ") : "SUBMITTED", boldFont, true);
            
            String helperName = complaint.getAssignedHelper() != null 
                    ? complaint.getAssignedHelper().getName() + " (Accredited Guide)" 
                    : "Pending DLSA Coordinator Assignment";
            addTableRow(infoTable, "Assigned Legal Guide", helperName, regularFont, false);

            String filingDate = complaint.getCreatedAt() != null 
                    ? complaint.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) 
                    : formattedDate;
            addTableRow(infoTable, "Filing Date", filingDate, regularFont, false);

            document.add(infoTable);

            document.add(new Paragraph(" "));

            // Grievance Title & Summary Section
            Paragraph pSubjectTitle = new Paragraph("Grievance Subject:", boldFont);
            Paragraph pSubjectDesc = new Paragraph(complaint.getTitle() != null ? complaint.getTitle() : "Legal Assistance Grievance", regularFont);
            pSubjectDesc.setSpacingAfter(10);
            document.add(pSubjectTitle);
            document.add(pSubjectDesc);

            // Lifecycle Journey Box
            PdfPTable journeyTable = new PdfPTable(1);
            journeyTable.setWidthPercentage(100);

            PdfPCell journeyCell = new PdfPCell();
            journeyCell.setBackgroundColor(new Color(245, 248, 246));
            journeyCell.setBorderColor(BRAND_EMERALD);
            journeyCell.setBorderWidth(1);
            journeyCell.setPadding(10);

            Paragraph pJourneyTitle = new Paragraph("ARAM Case Journey & Next Actions:", boldFont);
            journeyCell.addElement(pJourneyTitle);

            String statusStr = complaint.getStatus() != null ? complaint.getStatus().name() : "SUBMITTED";
            boolean isAssigned = complaint.getAssignedHelper() != null;
            boolean isResolved = "RESOLVED".equalsIgnoreCase(statusStr);

            Paragraph step1 = new Paragraph("✓ 1. Grievance Formally Registered in Central Civic Database", regularFont);
            Paragraph step2 = new Paragraph((isAssigned || isResolved ? "✓" : "→") + " 2. AI Statutory Triage & Document Verification Completed", regularFont);
            Paragraph step3 = new Paragraph((isAssigned ? "✓" : "○") + " 3. Dedicated Legal Guide Assigned for District Assistance", regularFont);
            Paragraph step4 = new Paragraph((isResolved ? "✓" : "○") + " 4. Official Resolution by Competent Authority / DLSA", regularFont);

            journeyCell.addElement(step1);
            journeyCell.addElement(step2);
            journeyCell.addElement(step3);
            journeyCell.addElement(step4);

            journeyTable.addCell(journeyCell);
            document.add(journeyTable);

            document.add(new Paragraph(" "));

            // Privacy & Authentication Footer
            Paragraph footerTitle = new Paragraph("Data Privacy & Verification Notice", boldFont);
            Paragraph footerBody = new Paragraph(
                    "This official status summary was generated via ARAM Civic Legal Aid & Justice System. " +
                    "To protect citizen privacy, confidential identity documents and biometric numbers are omitted. " +
                    "For live tracking and case chat, visit: https://ouraram.in/track-complaint",
                    smallFont
            );
            document.add(footerTitle);
            document.add(footerBody);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate complaint PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating complaint PDF: " + e.getMessage());
        }
    }

    private void addTableRow(PdfPTable table, String label, String value, Font font, boolean highlight) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, TEXT_MUTED)));
        labelCell.setPadding(7);
        labelCell.setBackgroundColor(new Color(252, 252, 250));
        labelCell.setBorderColor(BORDER_GRAY);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setPadding(7);
        if (highlight) {
            valueCell.setBackgroundColor(new Color(235, 245, 238));
        } else {
            valueCell.setBackgroundColor(Color.WHITE);
        }
        valueCell.setBorderColor(BORDER_GRAY);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }
}
