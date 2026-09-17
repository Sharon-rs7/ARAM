package com.aram.legalaid.service;

import com.aram.legalaid.enums.EmailTemplateType;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EmailTemplateService {

    public String buildEmail(EmailTemplateType type, Map<String, String> variables) {
        String userName = variables.getOrDefault("userName", "User");
        String message = variables.getOrDefault("message", "");
        String actionOrOtp = variables.getOrDefault("actionOrOtp", "");
        String importantInfo = variables.getOrDefault("importantInfo", "");

        // Build HTML template content
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n<html>\n<head>\n");
        html.append("  <meta charset=\"utf-8\">\n");
        html.append("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        html.append("  <title>ARAM Legal Assistance</title>\n");
        html.append("</head>\n");
        html.append("<body style=\"margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;\">\n");
        
        // Container
        html.append("<table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #e2e8f0;\">\n");
        
        // Header
        html.append("  <tr>\n");
        html.append("    <td style=\"background-color: #0f172a; padding: 24px; text-align: center;\">\n");
        html.append("      <h1 style=\"margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;\">ARAM</h1>\n");
        html.append("      <p style=\"margin: 4px 0 0 0; color: #94a3b8; font-size: 14px;\">Legal Assistance Platform</p>\n");
        html.append("    </td>\n");
        html.append("  </tr>\n");
        
        // Body Content
        html.append("  <tr>\n");
        html.append("    <td style=\"padding: 32px; color: #334155; font-size: 16px; line-height: 1.6;\">\n");
        html.append("      <p style=\"margin-top: 0;\">Hello ").append(userName).append(",</p>\n");
        html.append("      <p>").append(message).append("</p>\n");
        
        // Dynamic action or OTP code badge
        if (!actionOrOtp.isEmpty()) {
            html.append("      <div style=\"margin: 30px 0; text-align: center;\">\n");
            if (type == EmailTemplateType.EMAIL_VERIFICATION_OTP || type == EmailTemplateType.PASSWORD_RESET_OTP) {
                html.append("        <div style=\"display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 32px; border-radius: 6px; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #0f172a;\">")
                    .append(actionOrOtp).append("</div>\n");
            } else {
                html.append("        <div style=\"display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-decoration: none;\">")
                    .append(actionOrOtp).append("</div>\n");
            }
            html.append("      </div>\n");
        }
        
        // Important safety/system details
        if (!importantInfo.isEmpty()) {
            html.append("      <div style=\"margin: 20px 0; padding: 16px; background-color: #f8fafc; border-left: 4px solid #cbd5e1; font-size: 14px; color: #475569;\">\n");
            html.append("        ").append(importantInfo).append("\n");
            html.append("      </div>\n");
        }
        
        // Security disclaimer
        html.append("      <p style=\"font-size: 13px; color: #64748b; margin-top: 32px;\">\n");
        html.append("        If you did not request this action, please ignore this email or contact ARAM Support.\n");
        html.append("      </p>\n");
        
        // Sign-off
        html.append("      <p style=\"margin: 24px 0 0 0;\">\n");
        html.append("        Regards,<br>\n");
        html.append("        <strong>ARAM Support Team</strong><br>\n");
        html.append("        <a href=\"mailto:ouraramsupport@gmail.com\" style=\"color: #2563eb; text-decoration: none;\">ouraramsupport@gmail.com</a>\n");
        html.append("      </p>\n");
        html.append("    </td>\n");
        html.append("  </tr>\n");
        
        // Footer
        html.append("  <tr>\n");
        html.append("    <td style=\"background-color: #f8fafc; color: #64748b; padding: 24px; text-align: center; font-size: 12px; border-top: 1px solid #e2e8f0;\">\n");
        html.append("      <p style=\"margin: 0 0 8px 0;\">&copy; 2026 ARAM Legal Assistance Platform. All rights reserved.</p>\n");
        html.append("      <p style=\"margin: 0 0 12px 0; color: #94a3b8;\">This is an automated email. Please do not reply directly.</p>\n");
        html.append("      <p style=\"margin: 0;\">\n");
        html.append("        <a href=\"#\" style=\"color: #64748b; text-decoration: underline;\">Privacy Policy</a> | \n");
        html.append("        <a href=\"#\" style=\"color: #64748b; text-decoration: underline;\">Terms of Service</a> | \n");
        html.append("        <a href=\"#\" style=\"color: #64748b; text-decoration: underline;\">Help & Support</a>\n");
        html.append("      </p>\n");
        html.append("    </td>\n");
        html.append("  </tr>\n");
        
        html.append("</table>\n");
        html.append("</body>\n</html>");
        
        return html.toString();
    }
}
