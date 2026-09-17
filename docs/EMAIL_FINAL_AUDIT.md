# ARAM AI — FINAL EMAIL SYSTEM AUDIT
**Accessible Rights & Assistance Management**  
*Single Official Transactional Sender Identity: `ouraramsupport@gmail.com`*

---

## 1. Audit Findings & Centralized Architecture

| Dimension | Initial State | Final Hardened State |
| :--- | :--- | :--- |
| **Sender Identity** | Mixed configurations / fallback strings | **Single Official Identity**: `ouraramsupport@gmail.com` (`ARAM Legal Assistance`) |
| **Email Service Ownership** | Decentralized logging stubs | **Centralized Authority**: `com.aram.legalaid.service.EmailService` in `aram-backend` |
| **Transactional Flows** | Partial (Auth & Reset only) | **Complete 14 Flows** (Registration, Reset, Guide Invite, Admin Invite, Complaints, Statuses, Resolutions, Security, Inquiries) |
| **Template Engine** | Fragmented string builders | **Unified HTML Builder**: `EmailTemplateService` (Responsive branded templates) |
| **Resilience & Backup** | Async only; lost on SMTP error | **MongoDB `contact_inquiries` Backup** + Asynchronous Thread Pool + Redis Queue integration |
| **Secret Management** | Potential exposure risk | **100% Environment Isolated** (`SPRING_MAIL_PASSWORD`), zero keys in frontend or git |

---

## 2. Complete 14-Event Transactional Email Matrix

| # | Event Description | Triggering Component | Target Recipient | Template Enum |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Citizen Registration OTP** | `POST /api/auth/register` | Registering Citizen | `EMAIL_VERIFICATION_OTP` |
| 2 | **Account Verified Welcome** | OTP Verification Success | Verified Citizen | `ACCOUNT_VERIFIED` |
| 3 | **Legal Guide Invitation** | `POST /api/admin/guides/invite` | Legal Guide / Volunteer | `GUIDE_INVITATION` |
| 4 | **Regional Admin Invitation** | `POST /api/admin/invite-admin` | Regional Admin | `ADMIN_INVITATION` |
| 5 | **Password Reset OTP** | `POST /api/auth/forgot-password` | Account Email | `PASSWORD_RESET_OTP` |
| 6 | **Password Changed Alert** | `POST /api/auth/reset-password` | Account Email | `SECURITY_ALERT` |
| 7 | **Complaint Registered** | `POST /api/complaints/submit` | Filing Citizen | `COMPLAINT_SUBMITTED` |
| 8 | **Complaint Status Update** | Complaint Workflow Mutation | Filing Citizen | `COMPLAINT_STATUS_UPDATED` |
| 9 | **Guide Assigned to Citizen** | Admin Assigns Volunteer | Filing Citizen | `GUIDE_ASSIGNED` |
| 10 | **New Case Notice to Guide** | Guide Assignment Event | Assigned Legal Guide | `GUIDE_NEW_CASE` |
| 11 | **Case Resolved Summary** | Case Status $\rightarrow$ RESOLVED | Filing Citizen | `CASE_RESOLVED` |
| 12 | **High-Risk Escalation** | AI Priority $\ge$ HIGH / DV Case | Regional Admin / DLSA | `ESCALATION_ALERT` |
| 13 | **Contact / Support Inquiries** | Landing Page Contact Form | `ouraramsupport@gmail.com` | `SECURITY_ALERT` |
| 14 | **Blockchain Audit Alert** | Ledger Tamper Detected | `ouraramsupport@gmail.com` | `SECURITY_ALERT` |
