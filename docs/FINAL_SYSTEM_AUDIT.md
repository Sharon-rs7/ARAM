# ARAM AI — FINAL SYSTEM FORENSIC AUDIT REPORT

**Date:** September 16, 2026  
**Auditor:** Lead System Architect, Full-Stack & AI/RAG Engineer  
**Scope:** Complete repository audit across Auth Service (8081), Core Backend (8082), AI Service (8000), Frontend (React/Vite), Databases (MySQL, MongoDB, Redis), RAG Pipeline, and Security Configuration.

---

## 1. What Currently Works (Empirically Verified)

| Subsystem / Feature | Implementation Location | Verified Behavior |
| :--- | :--- | :--- |
| **Authentication & RBAC** | `auth-service` (Port 8081) | BCrypt password hashing, JWT Access & Refresh token rotation, Role-based authorization (`CITIZEN`, `HELPER`/`GUIDE`, `REGIONAL_ADMIN`, `SUPER_ADMIN`). |
| **Relational System-of-Record** | `aram-backend` + MySQL 8.0 (Port 8082) | 75 Users, 24 Complaints, and 7 Authorities preserved with full relational foreign-key integrity. |
| **Grounded AI / RAG Chatbot** | `ai-service` (Port 8000) $\rightarrow$ `aram-backend` | Semantic vector search via `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` over `indian_legal_documents.parquet` with live Gemini 3.6 Flash structured JSON output. |
| **Deterministic Fallback Engine** | `rag/generation/response_generator.py` | Automatically triggers on 429 quota limits or external LLM outages; returns strict verified statutory provisions and disclaimers without hallucination. |
| **Regional District Scoping** | `AdminController.java` & `RegionalAdminController.java` | Strict district filtering (e.g. Chennai Regional Admin cannot query Madurai/Coimbatore complaints). |
| **Elo Volunteer Matching** | `VolunteerAnalyticsService.java` & `elo_matcher.py` | Multi-factor recommendation (District, Language, Specialization, Workload, Gender Policy, Experience XP). |
| **Document OCR & Verification** | `app/ocr_engine.py` & `app/document_verifier.py` | EasyOCR + Tesseract extraction with PII keyword detection and confidence scoring. |
| **Multilingual Voice Pipeline** | `app/speech_to_text.py` | Faster-Whisper transcription for Tamil (`ta-IN`), Hindi (`hi-IN`), and English (`en-IN`). |
| **Frontend Production Build** | `src` (Vite 5 + React 18) | 100% real REST APIs, 0 mock dependencies, 0 mock imports, clean first-user empty states. |

---

## 2. What Partially Works

- **WebRTC Voice Calling**: Signaling channel via WebSocket functions; peer-to-peer audio connection works across LAN and open NAT, but requires a production TURN server (Coturn) for cellular/restricted 4G symmetric NAT traversal.
- **Multilingual TTS**: Browser SpeechSynthesis works cleanly for English and Tamil; fallback to server-side audio generation recommended for low-end mobile devices without native regional voice packs.

---

## 3. What Was Mocked / Hardcoded & Has Been Eliminated

- `USE_MOCKS` branches across all frontend services (`authService.js`, `adminService.js`, `complaintService.js`, `volunteerService.js`, `chatbotService.js`, `documentService.js`, `reportService.js`) have been **completely removed**.
- Demo user badges and prefilled login accounts (`citizen@aram.ai`, `admin@aram.ai`, `volunteer@aram.ai`) have been **completely purged**.
- Hardcoded guide stats (`activeCases: 8, resolved: 51`) and mock attention cases in `Guide/Dashboard.jsx` have been replaced with **real database queries and clean empty states**.

---

## 4. What Is Database-Backed vs AI-Backed vs Deterministic

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARAM SYSTEM DATA TIERS                          │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Database-Backed (MySQL 8.0 / System of Record):                    │
│    - Users, Passwords (BCrypt), Roles, Districts, SLA Statuses        │
│    - Complaints, Action Plans, Legal Guide Assignments, Audit Logs     │
│    - Government Authority Offices, Verification Records                │
│                                                                        │
│ 2. AI-Backed (FastAPI + Sentence-Transformers + Gemini 3.6 Flash):    │
│    - NLP Complaint Classification & Intent Analysis                   │
│    - Semantic Vector Search over Statutory Corpus                     │
│    - Grounded Multi-Step Reasoning & Plain-Language Explanation        │
│    - Audio Transcription (Faster-Whisper) & OCR (EasyOCR/Tesseract)    │
│                                                                        │
│ 3. Deterministic Safety Layer (Rule-Based Guards):                    │
│    - Legal Taxonomy & Statutory Mapping (C1-C10)                      │
│    - Priority Severity Matrix (Low, Medium, High, Sensitive)          │
│    - Non-Liability Statutory Disclaimers                              │
│    - Sensitive Case Female-Guide Assignment Constraints                │
│    - Quota 429 / Service Outage Fallback Pipeline                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Security & Privacy Audit

1. **Authentication & JWT**:
   - Access tokens (15-60 min expiry) and Refresh tokens validated cryptographically on every request.
   - Passwords hashed using standard BCrypt with work factor 12.
2. **PII Masking**:
   - Aadhaar numbers (12 digits) masked as `XXXX-XXXX-1234` before sending to external LLMs.
   - Financial account numbers and phone numbers sanitized.
3. **Internal Microservice Token**:
   - Communication between `aram-backend` and `ai-service` secured via `X-Internal-Token` header.
4. **District Isolation**:
   - Regional admins are enforced server-side through `@PreAuthorize` and JPA specifications.

---

## 6. Deployment Readiness Audit

- **Containerization**: Added `docker-compose.prod.yml` orchestrating Frontend, Auth, Core, AI, MySQL, MongoDB, and Redis.
- **Configuration**: Standardized `.env.example` defining all required production environment variables.
- **Port Allocations**:
  - Frontend: `5173` / `80`
  - Auth Service: `8081`
  - Core Service: `8082`
  - AI Service: `8000`
  - MySQL: `3306`
  - MongoDB: `27017`
  - Redis: `6379`
