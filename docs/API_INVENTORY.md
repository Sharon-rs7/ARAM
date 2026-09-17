# ARAM AI — API Inventory & Contract Catalog

**Environment Base URLs**:
- **Auth Microservice**: `http://localhost:8081/api`
- **Legal Aid Core Service**: `http://localhost:8082/api`
- **AI & RAG Service**: `http://localhost:8000`

---

## 1. Authentication Microservice APIs (`Port 8081`)

| Method | Endpoint | Authorization | Description | Verified Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new Citizen / Guide account | **WORKING (200 OK)** |
| `POST` | `/auth/login` | Public | Authenticate user & issue Bearer JWT | **WORKING (200 OK)** |
| `POST` | `/auth/refresh` | Public | Rotate expired access token using refresh token | **WORKING (200 OK)** |
| `POST` | `/auth/forgot-password`| Public | Generate & dispatch 6-digit numeric OTP | **WORKING (200 OK)** |
| `POST` | `/auth/verify-otp` | Public | Validate OTP token against database | **WORKING (200 OK)** |
| `POST` | `/auth/reset-password` | Public | Reset password with verified OTP token | **WORKING (200 OK)** |

---

## 2. Legal Aid Core Service APIs (`Port 8082`)

| Method | Endpoint | Authorization | Description | Verified Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/complaints` | `ROLE_CITIZEN` | Submit new complaint with AES-GCM encryption | **WORKING (200 OK)** |
| `GET` | `/complaints/my` | `ROLE_CITIZEN` | Retrieve complaints filed by authenticated user | **WORKING (200 OK)** |
| `GET` | `/complaints/{id}` | Authenticated | Retrieve specific complaint details and history | **WORKING (200 OK)** |
| `GET` | `/regional-admin/dashboard`| `ROLE_ADMIN` | District-scoped triage queue and KPI metrics | **WORKING (200 OK)** |
| `GET` | `/admin/users` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Statewide user management directory | **WORKING (200 OK)** |
| `GET` | `/admin/complaints` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Statewide 38-district complaint registry | **WORKING (200 OK)** |
| `GET` | `/authorities` | Authenticated | Directory of district legal aid authorities | **WORKING (200 OK)** |
| `GET` | `/helper/cases` | `ROLE_HELPER` / `ROLE_GUIDE` | Retrieve cases assigned to authenticated guide | **WORKING (200 OK)** |
| `GET` | `/helper/dashboard` | `ROLE_HELPER` / `ROLE_GUIDE` | Guide workload stats and active cases | **WORKING (200 OK)** |
| `POST` | `/helper/cases/{id}/acknowledge`| `ROLE_HELPER` / `ROLE_GUIDE` | Transition status: `AWAITING_ACKNOWLEDGEMENT` $\rightarrow$ `IN_PROGRESS` | **WORKING (200 OK)** |
| `GET` | `/notifications` | Authenticated | Retrieve user-specific persistent notifications | **WORKING (200 OK)** |

---

## 3. AI & RAG Inference Service APIs (`Port 8000`)

| Method | Endpoint | Headers | Description | Verified Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | None | Verify model readiness and MongoDB connectivity | **WORKING (200 OK)** |
| `POST` | `/complaint/analyze` | `x-internal-token` | ONNX legal classification & document checklist | **WORKING (200 OK)** |
| `POST` | `/chat/ask` | `x-internal-token` | Grounded RAG statutory guidance query | **WORKING (200 OK)** |
| `POST` | `/documents/ocr` | Public / Internal | EasyOCR extraction with Aadhaar/PAN PII redaction | **WORKING (200 OK)** |
| `POST` | `/voice/transcribe` | Public / Internal | Faster-Whisper multilingual speech-to-text | **WORKING (200 OK)** |
