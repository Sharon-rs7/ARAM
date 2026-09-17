# ARAM AI — FINAL DATABASE ARCHITECTURE

## 1. System of Record (MySQL 8.0)

| Table Name | Description | Current Row Count |
| :--- | :--- | :--- |
| `users` | User credentials, roles, districts, verification status | 75 |
| `complaints` | Grievance records, categories, priorities, statuses | 24 |
| `authority_offices` | Government departments, addresses, contact details | 7 |
| `case_chat_messages` | Real-time consultation messages between citizen & guide | Live |
| `action_plans` | Step-by-step milestone checklists for grievance resolution | Live |
| `complaint_documents` | File metadata, OCR extracted text, verification statuses | Live |
| `audit_logs` | Immutable security and administrative mutation records | Live |

---

# ARAM AI — FINAL DEPLOYMENT GUIDE

## 1. Production Docker Quickstart

```bash
# 1. Clone & prepare environment
cp .env.example .env

# 2. Build & launch all 7 services in isolated network
docker-compose -f docker-compose.prod.yml up --build -d

# 3. Verify health status
docker-compose -f docker-compose.prod.yml ps
```

---

# ARAM AI — FINAL SECURITY AUDIT REPORT

1. **Authentication**: BCrypt work-factor 12, JWT RSA/HMAC-256 tokens, refresh token rotation.
2. **PII Masking**: RegEx sanitization of 12-digit Aadhaar, PAN, phone numbers, and bank account numbers prior to external LLM processing.
3. **District Authorization**: Hard server-side `@PreAuthorize` JPA checks prevent horizontal privilege escalation.
4. **Internal Microservice Token**: AI Service rejects unauthenticated external calls without `X-Internal-Token`.

---

# ARAM AI — FINAL TEST & EVALUATION REPORT

| Test Category | Executed Suite | Result |
| :--- | :--- | :--- |
| **Authentication & RBAC** | `verify_e2e_reboot.ps1` | **PASS (100%)** |
| **Relational Data Integrity** | `verify_e2e_reboot.ps1` | **PASS (75 Users, 24 Cases)** |
| **Scenario 1: Tamil Wage Dispute** | `verify_scenario_tests.py` | **PASS (100%)** |
| **Scenario 2: Sensitive Case** | `verify_scenario_tests.py` | **PASS (100%)** |
| **Scenario 3: Ambiguous Triage** | `verify_scenario_tests.py` | **PASS (100%)** |
| **Scenario 4: Gemini Outage Fallback** | `verify_scenario_tests.py` | **PASS (100%)** |
| **Frontend Production Build** | `npm run build` | **PASS (0 Errors)** |

---

# ARAM AI — FINAL KNOWN LIMITATIONS

1. **Gemini Free Tier Quota**: 5 req/min rate limits trigger automatic deterministic statutory fallback under burst traffic.
2. **WebRTC NAT Traversal**: Full cellular 4G P2P voice calling requires deploying a dedicated Coturn TURN relay server.
3. **Handwritten Vernacular OCR**: Low-contrast camera photos of handwritten Tamil/Hindi petitions benefit from multimodal vision LLM fine-tuning.
