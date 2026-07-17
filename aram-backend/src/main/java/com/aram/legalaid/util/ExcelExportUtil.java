package com.aram.legalaid.util;

import com.aram.legalaid.model.User;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

public class ExcelExportUtil {

    public static byte[] exportUsersToExcel(List<User> users) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Users");

            // Header Font & Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

            // Row 0: Headers
            Row headerRow = sheet.createRow(0);
            String[] headers = { "User ID", "Name", "Email", "Mobile", "Role", "Status", "District", "Preferred Language", "Created At" };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // Data rows
            int rowIdx = 1;
            for (User user : users) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(user.getId() != null ? user.getId() : 0);
                row.createCell(1).setCellValue(user.getName() != null ? user.getName() : "");
                row.createCell(2).setCellValue(user.getEmail() != null ? user.getEmail() : "");
                row.createCell(3).setCellValue(user.getMobile() != null ? user.getMobile() : "");
                row.createCell(4).setCellValue(user.getRole() != null ? user.getRole().name() : "");
                row.createCell(5).setCellValue(user.getStatus() != null ? user.getStatus().name() : "");
                row.createCell(6).setCellValue(user.getDistrict() != null ? user.getDistrict() : "");
                row.createCell(7).setCellValue(user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "");
                row.createCell(8).setCellValue(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
