# ARAM AI — EMAIL AUTOMATED TEST SUITE
**Accessible Rights & Assistance Management**  
*Testing Procedures for OTP, Invitations, and Email Event Triggers*

---

## 1. Automated Test Cases

| Test Case ID | Target Endpoint | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-MAIL-01** | `POST /api/auth/forgot-password` | Generate password reset OTP | 6-digit OTP created, 5-min expiry stored, response 200 |
| **TC-MAIL-02** | `POST /api/auth/verify-reset-otp` | Validate wrong OTP | Fails with attempts remaining, blocks after 5 tries |
| **TC-MAIL-03** | `POST /api/auth/verify-reset-otp` | Validate correct OTP | Returns success 200 |
| **TC-MAIL-04** | `POST /api/auth/reset-password` | Single-use validation | OTP marked as used, cannot be reused |
| **TC-MAIL-05** | `POST /api/support/contact` | Submit contact form | Persists to MongoDB, dispatches async email, returns 200 |

---

## 2. Test Execution Command

```bash
python scripts/test_email_flows.py
```
