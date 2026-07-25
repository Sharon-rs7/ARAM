# Security, Privacy & User Trust Audit

This report reviews the data storage, visibility filters, and protection rules across ARAM.

## 1. Security Checklist

| Check | Rating | Description |
| :--- | :--- | :--- |
| **Password Storage** | **SAFE** | BCrypt hashed. |
| **JWT Storage** | **SAFE** | Managed in secure HTTP header/context memory. |
| **LocalStorage Rules** | **SAFE** | No complaints, chats, or document files are stored in localStorage. |
| **Access Isolation** | **SAFE** | Handled in controllers; helpers only view assigned complaints. |
| **Sensitive Case Shielding** | **SAFE** | Restricts PII for hidden visibility complaints. |
| **Override Reason Logs** | **SAFE** | Required for non-female/untrained helper assignments on sensitive cases. |
| **Field-level Encryption** | **PARTIAL** | Symmetric JPA encryption exists, but rotatable KMS keys are pending. |

---

## 2. Privacy Masking rules
- **HIDDEN:** Legal Guide sees citizen name as `Protected Identity`.
- **PARTIAL:** Legal Guide sees only location (e.g. *Citizen from Coimbatore*) and preferred language.
- **VISIBLE:** Standard public name fields are displayed.
