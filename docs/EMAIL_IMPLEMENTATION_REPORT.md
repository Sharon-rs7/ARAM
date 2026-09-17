# ARAM AI — CENTRALIZED EMAIL SYSTEM IMPLEMENTATION REPORT
**Accessible Rights & Assistance Management**  
*Official Single Sender Identity: `ouraramsupport@gmail.com`*

---

## 1. Executive Summary

The ARAM AI email subsystem has been unified under a single authoritative implementation inside `aram-backend` (`com.aram.legalaid.service.EmailService`).

### Core Guarantees:
- **Single Sender Identity**: All emails originate strictly from `ouraramsupport@gmail.com`.
- **Zero Frontend Secret Exposure**: No SMTP passwords, tokens, or mail servers are exposed to the React frontend.
- **Asynchronous & Resilient**: Non-blocking delivery via `CompletableFuture.runAsync`.
- **Database Backup**: Contact inquiries are permanently logged in MongoDB (`contact_inquiries`) to prevent message loss.
- **11+ Responsive Templates**: Beautiful, mobile-responsive HTML templates via `EmailTemplateService`.
- **Security Safeguards**: Single-use OTPs with 5-minute expiration, max 5 attempts, and anti-enumeration defenses.

---

## 2. Inventory of Supported Transactional Email Flows

1. **User Registration OTP**: 6-digit verification code.
2. **Account Verified Confirmation**: Welcome greeting upon successful signup.
3. **Password Reset OTP**: Time-limited verification code.
4. **Password Changed Security Alert**: Instant notification upon password update.
5. **Legal Guide Invitation**: Single-use tokenized onboarding link with 7-day validity.
6. **Regional Admin Activation**: Role-based invitation for administrative onboarding.
7. **Complaint Registration Confirmation**: Citizen filing confirmation with tracking ID.
8. **Legal Guide Case Assignment**: Citizen notice when a volunteer is assigned.
9. **Guide New Case Notification**: Case alert to assigned guide (minimal facts in email, directs to dashboard).
10. **Landing Page Contact Form**: Delivers citizen inquiry directly to `ouraramsupport@gmail.com`.
11. **Blockchain Audit Integrity Alert**: Automated alert if ledger tampering is detected.

---

## 3. Environment Variables Configuration

```env
# Central Mail Settings (ouraramsupport@gmail.com)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=ouraramsupport@gmail.com
SPRING_MAIL_PASSWORD=your_16_digit_google_app_password
APP_MAIL_ENABLED=true
APP_MAIL_FROM_NAME=ARAM Legal Assistance
```

---

## 4. Documentation Suite

- 👉 **[EMAIL_ARCHITECTURE_AUDIT.md](file:///E:/OurAram/My-aram-app/docs/EMAIL_ARCHITECTURE_AUDIT.md)**
- 👉 **[EMAIL_ARCHITECTURE.md](file:///E:/OurAram/My-aram-app/docs/EMAIL_ARCHITECTURE.md)**
- 👉 **[EMAIL_TEMPLATES.md](file:///E:/OurAram/My-aram-app/docs/EMAIL_TEMPLATES.md)**
- 👉 **[EMAIL_SECURITY.md](file:///E:/OurAram/My-aram-app/docs/EMAIL_SECURITY.md)**
- 👉 **[EMAIL_DEPLOYMENT.md](file:///E:/OurAram/My-aram-app/docs/EMAIL_DEPLOYMENT.md)**
- 👉 **[EMAIL_TESTING.md](file:///E:/OurAram/My-aram-app/docs/EMAIL_TESTING.md)**
