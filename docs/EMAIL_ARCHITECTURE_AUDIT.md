# ARAM AI — EMAIL ARCHITECTURE FORENSIC AUDIT
**Accessible Rights & Assistance Management**  
*Single Authoritative Sender Identity: `ouraramsupport@gmail.com`*

---

## 1. Executive Summary & Inventory

An exhaustive audit of email handling across `auth-service`, `aram-backend`, `ai-service`, and `frontend` reveals that:

1. **Single Mail Authority**: `aram-backend` (`com.aram.legalaid.service.EmailService`) is the single centralized authority responsible for all transactional email dispatches.
2. **Official Sender Identity**: All outgoing communications use `ouraramsupport@gmail.com` (`ARAM Legal Assistance`).
3. **No Direct Frontend Emailing**: The React frontend does NOT directly send emails or expose SMTP credentials.
4. **No AI Service Emailing**: The Python AI service does NOT send emails; all notifications route through Spring Boot backend events.

---

## 2. Comprehensive Email Event & Trigger Matrix

| Event Type | Triggering Endpoint / Action | Recipient | Sender Identity | Template Used |
| :--- | :--- | :--- | :--- | :--- |
| **Email Verification OTP** | `POST /api/auth/register` | Citizen / Volunteer | `ouraramsupport@gmail.com` | `EMAIL_VERIFICATION_OTP` |
| **Account Verified** | OTP validation success | Citizen / Volunteer | `ouraramsupport@gmail.com` | `ACCOUNT_VERIFIED` |
| **Password Reset OTP** | `POST /api/auth/forgot-password` | Registered User | `ouraramsupport@gmail.com` | `PASSWORD_RESET_OTP` |
| **Password Changed Alert** | `POST /api/auth/reset-password` | Registered User | `ouraramsupport@gmail.com` | `SECURITY_ALERT` |
| **Guide Account Invitation** | `POST /api/admin/guides/invite` | Legal Guide / Volunteer | `ouraramsupport@gmail.com` | `GUIDE_INVITATION` |
| **Regional Admin Invitation** | `POST /api/admin/invite-admin` | Regional Admin | `ouraramsupport@gmail.com` | `ADMIN_INVITATION` |
| **Complaint Submitted** | `POST /api/complaints/submit` | Filing Citizen | `ouraramsupport@gmail.com` | `COMPLAINT_SUBMITTED` |
| **Guide Assigned to Case** | `POST /api/admin/complaints/{id}/assign` | Filing Citizen | `ouraramsupport@gmail.com` | `GUIDE_ASSIGNED` |
| **New Case Assigned Notice** | Guide Assignment Event | Assigned Legal Guide | `ouraramsupport@gmail.com` | `GUIDE_NEW_CASE` |
| **Contact Support Message** | `POST /api/support/contact` | `ouraramsupport@gmail.com` | `ouraramsupport@gmail.com` | `SECURITY_ALERT` |
| **Blockchain Audit Alert** | Daily Audit Cron / Tamper Trigger | `ouraramsupport@gmail.com` | `ouraramsupport@gmail.com` | `SECURITY_ALERT` |

---

## 3. Security & SMTP Parameters

- **SMTP Server**: `smtp.gmail.com`
- **Port**: `587` (TLS / STARTTLS enabled)
- **Authentication**: Mandates Google 16-character App Password via `SPRING_MAIL_PASSWORD`.
- **Zero Secret Exposure**: Passwords and secrets are strictly abstracted through environment variables; never logged or committed.
- **Asynchronous Execution**: Emails are dispatched asynchronously (`CompletableFuture.runAsync`) to prevent blocking database transactions.
