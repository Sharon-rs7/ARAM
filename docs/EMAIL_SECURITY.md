# ARAM AI — EMAIL SECURITY & PII SAFEGUARDS
**Accessible Rights & Assistance Management**  
*Security Standards, Rate-Limiting, and Token Protection*

---

## 1. Security Safeguards

1. **No Sensitive Complaint Body in Emails**:
   - Notifications to citizens and guides include ONLY `complaintId`, `category`, `district`, and `status`.
   - Raw complaint narratives, victim descriptions, and sensitive evidence files are **NEVER** embedded into email bodies. Users are instructed to log in to the authenticated platform.
2. **Account Enumeration Defense**:
   - The `/api/auth/forgot-password` endpoint returns the same generic message (`"If the email is registered, a password reset OTP has been sent."`) regardless of whether the email exists in the database.
3. **OTP Security**:
   - 6-digit cryptographically generated OTPs.
   - Expiration window: **5 minutes**.
   - Attempt limit: Max 5 attempts before a **10-minute cooldown block**.
   - Single-use validation (`used = true` immediately upon verification).
4. **Invitation Token Lifecycle**:
   - Onboarding links for Legal Guides use secure UUID tokens with a 7-day expiration window.
   - Tokens are single-use and invalidated immediately upon account password setup.
5. **Credential Protection**:
   - Zero hardcoded SMTP passwords.
   - `SPRING_MAIL_PASSWORD` environment variable required for production execution.
