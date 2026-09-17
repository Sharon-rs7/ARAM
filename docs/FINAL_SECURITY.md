# ARAM AI — FINAL SECURITY & PRIVACY SPECIFICATION

## 1. Authentication & Session Security
- **Algorithm**: BCrypt password hashing (work factor 12).
- **Tokens**: Cryptographic JWT access tokens (15-60 min) with refresh token rotation.
- **Role Normalization**: Explicit enum mapping for `CITIZEN`, `HELPER`/`GUIDE`, `REGIONAL_ADMIN`, and `SUPER_ADMIN`.

## 2. Privacy & PII Sanitization
- **Client & Server Sanitization**: RegEx masking of 12-digit Indian Aadhaar numbers (`XXXX-XXXX-1234`), PAN cards, mobile numbers, and bank account numbers prior to sending prompts to external LLMs.
- **Private Storage**: Scanned identity proofs and evidence documents are stored behind authenticated streaming endpoints and never exposed publicly.

## 3. Horizontal Privilege Escalation Prevention
- **District Scoping**: Hard server-side JPA specifications enforce that Regional Admins only query complaints belonging to their assigned district.
- **Internal Microservice Token**: AI Service rejects unauthenticated external requests without `X-Internal-Token`.
