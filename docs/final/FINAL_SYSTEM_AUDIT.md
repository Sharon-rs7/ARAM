# ARAM AI — FINAL SYSTEM AUDIT & ARCHITECTURAL INVENTORY

**Audit Date**: September 2026  
**Document**: `docs/final/FINAL_SYSTEM_AUDIT.md`  
**Scope**: Full Stack Forensic Audit (Auth Service, Legal Aid Core Backend, AI/RAG Engine, MySQL, MongoDB, Redis, Email, WebSockets, Frontend)  
**Status**: Comprehensive Baseline Audit Completed  

---

## 1. Current System Architecture

ARAM AI operates as a coordinated multi-service platform providing statutory legal triage, evidence verification, and volunteer-guided assistance across Tamil Nadu and Pan-India:

```
                                ┌────────────────────────────────┐
                                │     React 18 + Vite Frontend   │
                                │     http://localhost:5173      │
                                └───────────────┬────────────────┘
                                                │ REST / STOMP WebSocket
                        ┌───────────────────────┼────────────────────────┐
                        ▼                       ▼                        ▼
         ┌────────────────────────────┐ ┌────────────────┐ ┌───────────────────────────┐
         │  Auth Service (Spring 3)   │ │  ARAM Backend  │ │ AI Service (FastAPI 0.111)│
         │   http://localhost:8081    │ │ :8082 (Core)   │ │   http://localhost:8000   │
         └──────────────┬─────────────┘ └───────┬────────┘ └─────────────┬─────────────┘
                        │                       │                        │
                        ▼                       ▼                        ▼
              [MySQL: users/tokens]     [MySQL: aram_db]     [MongoDB: aram_ai_logs]
                                                │                        │
                                                └────────[Redis: 6379]───┘
```

---

## 2. Service Inventory & Endpoints

### A. Auth Microservice (`:8081` - Spring Boot 3)
* **Status**: Running. Shares the same database (`aram_db`) as the core backend.
* **Endpoints**:
  - `POST /api/auth/register` — Citizen/Guide registration with BCrypt hashing and OTP issuance.
  - `POST /api/auth/login` — Issues symmetric HS256 JWT tokens.
  - `POST /api/auth/refresh` — Refresh expired access tokens.
  - `POST /api/auth/forgot-password` — Generates 6-digit password reset OTP.
  - `POST /api/auth/verify-reset-otp` — Validates reset OTP with attempt limits.
  - `POST /api/auth/reset-password` — Updates password hash.
* **Architectural Gap**: The core backend (:8082) also contains a duplicate `AuthController`. The frontend [`.env`](file:///e:/OurAram/My-aram-app/.env) points `VITE_AUTH_SERVICE_BASE_URL` to `http://localhost:8082/api`, leaving :8081 as an idle zombie service during default local execution.

### B. Legal Aid Core Backend (`:8082` - Spring Boot 3)
* **Status**: Running. Primary system of record managing complaints, volunteer matching, real-time messaging, and notifications.
* **Core Endpoints**:
  - `POST /api/complaints` — File grievance docket with AI classification payload.
  - `GET /api/complaints` — Scoped complaint retrieval (Citizen = own, Admin = district/global).
  - `GET /api/complaints/{id}` — Full case detail with timeline, evidence status, and assigned guide.
  - `GET /api/complaints/{id}/timeline` — Complete lifecycle event progression.
  - `POST /api/complaints/{id}/evidence` & `GET /api/complaints/{id}/evidence` — Multipart evidence upload and retrieval.
  - `GET /api/cases/{complaintId}/messages` & `POST /api/cases/{complaintId}/messages` — Citizen $\leftrightarrow$ Guide two-way communication.
  - `PUT /api/cases/messages/{messageId}/read` — Message read receipt tracker.
  - `GET /api/cases/{complaintId}/notes` & `POST /api/volunteer/cases/{complaintId}/notes` — Volunteer private/shared case notes.
  - `GET /api/admin/complaints/{complaintId}/recommended-guides` — AI-powered volunteer matching engine.
  - `POST /api/admin/complaints/{complaintId}/assign-legal-guide` — Commit guide assignment with audit logging.
  - `POST /api/volunteer/cases/{complaintId}/request-documents` — Volunteer initiates formal evidence request.
  - `POST /api/volunteer/cases/{complaintId}/escalate` — Guide escalates case to Regional Admin.
  - `PUT /api/volunteer/cases/{complaintId}/status` — Controlled status transition.
  - `POST /api/complaints/{id}/feedback` — Citizen post-resolution evaluation.
  - `POST /api/volunteer/cases/{id}/self-evaluation` — Post-closure volunteer reflection.
  - `GET /api/super-admin/analytics` & `GET /api/regional-admin/analytics` — Dynamic operational metrics.
  - `WS /ws/updates` — STOMP/WebSocket real-time push for notifications and chat events.

### C. AI Triage & RAG Service (`:8000` - FastAPI)
* **Status**: Running. Powered by Uvicorn, SentenceTransformers, Faster-Whisper, EasyOCR, and Gemini/Local LLM.
* **Endpoints**:
  - `POST /chat/ask` — Conversational intake assistant with intent classifier and language switcher.
  - `POST /complaint/analyze` — Legal taxonomy classification, urgency detection, and authority recommendation.
  - `POST /documents/ocr` — PyTorch EasyOCR and Tesseract text extraction with PII masking.
  - `POST /documents/verify` — Automated evidence verification against statutory requirements.
  - `POST /voice/transcribe` — Multilingual Faster-Whisper speech-to-text supporting `ta`, `en`, and `hi`.
  - `POST /recommend/volunteer` — Multi-factor ranking engine (District, Language, Category, Workload, Elo rating).
  - `POST /ai/case-assistant` — Context-aware copilot synthesizing case facts, evidence, messages, and RAG statutory articles.
  - `GET /health` — Real-time diagnostics for RAG index, vector store, LLM provider, Redis, and MongoDB.

---

## 3. Database Tables & Entity Relationships

### MySQL Core Schema (`aram_db`)
1. **`users`**: System-wide identity store. Supports `CITIZEN`, `HELPER` (`GUIDE`), `ADMIN`, `SUPER_ADMIN`.
2. **`complaints`**: Central grievance record. Tracks `citizen_id`, `assigned_helper_id`, `category`, `status`, `district`, `urgency`, `authority`, and blockchain block index.
3. **`uploaded_documents`**: Uploaded evidence records with original filename, storage path, and verification status.
4. **`document_verification_results`**: Detailed verification metadata including OCR text, confidence score, image quality score, and matched fields.
5. **`case_chat_threads` & `case_messages`**: Threaded communication between citizens, volunteers, and system notifications.
6. **`legal_guide_case_notes`**: Internal caseworker notes with `PRIVATE` or `SHARED` visibility.
7. **`case_document_requests`**: Structured requests from volunteers to citizens for specific missing evidence.
8. **`case_feedbacks`**: Citizen ratings and qualitative reviews following case resolution.
9. **`volunteer_self_evaluations`**: Volunteer post-closure self-reflection (difficulty, time spent, challenges, AI copilot utility).
10. **`guide_assignment_decision_logs`**: Audit trail of AI-recommended vs. admin-selected volunteer assignments.
11. **`audit_logs`**: Immutable security and event log recording actor, action, case ID, and timestamps.
12. **`authorities` & `authority_offices`**: Geocoded directory of competent statutory bodies (Labour Offices, Consumer Forums, Cyber Police, DLSA).
13. **`blockchain_blocks` & `blockchain_locks`**: Proof-of-work tamper-evident audit ledger for case authenticity.

### MongoDB Collections (`aram_ai_logs`)
- `chatbot_logs`: Complete telemetry of conversational turns, prompt tokens, intent routing, and latency.
- `rag_retrieval_logs`: Retrieved statutory chunk IDs, BM25 scores, dense cosine similarity, and grounding validation scores.
- `ocr_logs`: Raw OCR text, bounding boxes, and document classification scores.

---

## 4. AI & RAG Pipeline Specifications

1. **Grounded Legal Knowledge Base**:
   - 1,306 statutory provisions indexed from Indian Central Acts and Tamil Nadu State Enactments.
   - Embeddings: 384-dimensional `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`.
   - Hybrid Search: Dense cosine similarity combined with BM25 keyword scoring.
2. **Relevance Gating & Cross-Domain Isolation**:
   - `legal_gate.py` prevents cross-domain contamination (e.g. Tenancy disputes cannot retrieve Motor Accident provisions).
3. **Multi-Provider LLM Router**:
   - **Primary**: Self-hosted local LLM (vLLM / Ollama)
   - **Secondary**: Google Gemini (3.5 Flash Lite / 1.5 Flash)
   - **Deterministic Fallback**: Pure statutory RAG excerpt synthesis (guarantees zero hallucinated penalties/sections).

---

## 5. Official Email & Notification Infrastructure

* **Sender**: `ouraramsupport@gmail.com`
* **Protocol**: SMTP via Gmail on port 587 with TLS authentication.
* **Transactional Events**:
  - `REGISTRATION_OTP` — Email verification code for new citizens/volunteers.
  - `COMPLAINT_SUBMITTED` — Citizen receipt with custom grievance tracking ID.
  - `GUIDE_ASSIGNED` — Citizen notification of assigned volunteer.
  - `GUIDE_NEW_CASE` — Volunteer alert for new assigned docket.
  - `DOCUMENT_REQUESTED` — Formal request for additional evidence.
  - `CASE_RESOLVED` — Notification of case closure and feedback invitation.
* **Real-time Notifications**: Redis Pub/Sub (`aram_notifications`) bridged to STOMP/WebSocket (`/ws/updates`).

---

## 6. Identified Gaps, Silent Mocks & Remediation Actions

| Component | Identified Drawback / Risk | Remediation Executed |
| :--- | :--- | :--- |
| **OCR Pipeline** | Synthetic fallback in `ocr_engine.py` (lines 97-120) fabricated fake payslips, Aadhaar cards, and FIRs based on filenames. | **REMOVED**. Real OCR output is strictly enforced. Low-quality images return `UNCLEAR` or `REQUIRES_HUMAN_REVIEW` without hallucinating fake data. |
| **Speech-to-Text** | Silent fallback in `speech_to_text.py` defaulted failed transcriptions to *"Unpaid salary since last three months"*. | **REMOVED**. Returns explicit empty text and low-confidence indicator requesting manual text entry. |
| **Blockchain Mining** | `mineBlock()` ran synchronous Proof-of-Work loop holding a pessimistic row lock on `blockchain_locks` during citizen complaint submission. | **DECOUPLED**. Converted to asynchronous background execution (`@Async`), unblocking the HTTP worker thread and DB pool. |
| **Rate Limiter Memory** | `RateLimitingFilter.java` stored IPs in an unbounded `ConcurrentHashMap` without eviction. | **HARDENED**. Added sliding-window TTL cleanup to prevent heap exhaustion. |
| **Volunteer Copilot** | Volunteers lacked an in-case AI copilot to synthesize case facts, evidence, and RAG statutes. | **ADDED**. Implemented `POST /ai/case-assistant` endpoint in AI service and proxied via core backend. |
| **Volunteer Self-Evaluation** | Missing dedicated model, database table, and API for post-closure volunteer self-reflection. | **ADDED**. Created `volunteer_self_evaluations` table via Flyway `V12` and linked to closure flow. |
| **Frontend White Screens** | Zero React `<ErrorBoundary>` components in frontend routes. | **ADDED**. Implemented `<ErrorBoundary>` wrapper around all lazy-loaded routes in `App.jsx`. |
| **Auth API Mismatch** | `authService.js` called `/auth/activate` while backend only exposed `/auth/activate-account`. | **FIXED**. Synchronized endpoint mapping to `/auth/activate-account`. |
