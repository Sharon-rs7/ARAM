# ARAM AI — Production Reboot & UI/Data Cleanup Audit

**Audit Date:** 2026-09-16  
**System:** ARAM AI (Accessible Rights & Assistance Management)  
**Status:** COMPLETE AUDIT PRIOR TO REBOOT CLEANUP

---

## Executive Summary
This audit provides a comprehensive component-by-component inventory of the ARAM AI monorepo. It establishes strict safety boundaries ensuring zero data loss in MySQL/MongoDB, complete preservation of real backend microservices and RAG pipelines, while identifying all mock/demo artifacts to be removed or replaced.

---

## Component Classification Matrix

### Category A: KEEP (Real, Required, Working Core Architecture)
1. **Auth Service (`auth-service/`, Port 8081)**:
   - Spring Boot 3.3.5, JJWT token generation/validation, BCrypt password hashing.
   - User entity management with roles: `ADMIN`, `REGIONAL_ADMIN`, `GUIDE`, `CITIZEN`.
2. **Legal Aid Core Backend (`aram-backend/`, Port 8082)**:
   - Spring Boot 3.3.5, JPA Hibernate, Flyway Migrations (V1–V11).
   - MySQL database integration, AES-GCM-256 sensitive field encryption.
   - District-scoped Regional Admin dashboards, Complaint CRUD, Legal Guide assignment.
   - STOMP WebSocket broker (`/ws`) and Redis Pub/Sub notification listeners.
3. **AI & RAG Service (`ai-service/`, Port 8000)**:
   - FastAPI microservice, ONNX classifiers, SentenceTransformers `MiniLM-L12-v2`.
   - Faster-Whisper (INT8 CPU) voice transcription pipeline.
   - EasyOCR engine with Aadhaar/PAN regex maskers.
   - Centralized Gemini Client (`gemini-3.6-flash`) with structured JSON schema validation.
   - Grounded RAG index with 1,306 Indian statutory chunks (`chatbot_retriever.pkl`).
4. **Data Stores**:
   - MySQL 8.x relational database (`aram_db`).
   - MongoDB telemetry and audit logs (`aram_logs`).
   - Redis cache and session broker (Port 6379).

---

### Category B: MODIFY (Useful Components Requiring Redesign/Improvement)
1. **Frontend Empty States**:
   - Redesign Citizen, Guide, and Admin dashboards to render genuine empty states (0 complaints, 0 notifications, 0 assigned cases) when a newly registered user logs in.
2. **Frontend Service Layer (`src/services/`)**:
   - Modify `authService.js`, `complaintService.js`, `userService.js`, `volunteerService.js`, `notificationService.js`, and `adminService.js` to eliminate all `USE_MOCKS` branching and exclusively route calls to live microservices.
3. **Public Complaint Tracking (`src/pages/citizen/TrackComplaint.jsx`)**:
   - Modify to perform strict server-side lookups against `/api/complaints/public/track` rather than falling back to mock arrays.
4. **UI Styling & Usability**:
   - Streamline citizen onboarding flow: Language Selection $\rightarrow$ Registration $\rightarrow$ Real Dashboard $\rightarrow$ Text/Voice Submission.

---

### Category C: REMOVE (Unwanted Demo, Mock, or Hardcoded Artifacts)
1. **Mock Data Folder (`src/data/mock/`)**:
   - Hardcoded arrays: `mockUsers.js`, `mockComplaints.js`, `mockNotifications.js`, `mockVolunteers.js`, `mockAdminData.js`.
2. **Demo UI Banners & Test Switches**:
   - Remove demo credentials displays (e.g. "Demo: Citizen@123", "Demo: Admin@123").
   - Remove quick test login buttons or pre-filled credential shortcuts in login/register forms.
   - Remove `DemoHealthPanel.jsx` if rendering simulated mock status.
3. **Static Simulated Statistics**:
   - Remove hardcoded chart numbers or simulated counts in admin/citizen overview pages.

---

### Category D: REPLACE (Technically Weak Implementations)
1. **Mock Authentication Fallbacks**:
   - Replace fake token generators (e.g. `demo-access-token-jwt-...`) with real Spring Security authentication errors and user feedback.
2. **Client-Side Data Filtering**:
   - Replace client-side mock filtering with backend REST API pagination and query parameters.
3. **Local Storage Fallback Mock Stores**:
   - Replace local storage mock user mutations with real backend REST updates.

---

### Category E: PROTECT (Real Data & Invariants That Must NOT Be Touched)
1. **MySQL Relational Data**:
   - Protect 75 existing user records in `users`.
   - Protect 24 existing complaint records in `complaints`.
   - Protect all statutory authority records in `authorities`.
   - Protect all foreign keys, action plans, and audit history.
   - **STRICT PROHIBITION**: Zero `DROP TABLE`, `TRUNCATE`, or mass deletions.
2. **RAG Knowledge Base**:
   - Protect `models/chatbot_retriever.pkl` (1,306 verified legal chunks).
   - Protect `models/legal_rag_metadata.json`.
3. **ML Classifier Models**:
   - Protect ONNX models (`category_model.onnx`, `priority_model.onnx`, `authority_model.onnx`, `volunteer_ranking_model.onnx`).
4. **Security & Field Encryption**:
   - Protect AES-GCM-256 field encryption keys in Spring Boot configurations.

---

## Clean Reboot Architecture & First-Time User Journey

```
[1] New Citizen Landing
    │
    ▼
[2] Language Selection (English / தமிழ் / हिंदी)
    │
    ▼
[3] Real Authentication (Register ──> Login ──> JWT Session on Port 8081)
    │
    ▼
[4] Clean Real Dashboard (0 Complaints ──> Genuine Empty State with Call-to-Action)
    │
    ▼
[5] Multilingual Case Submission (Voice / Text / OCR Evidence)
    │
    ▼
[6] Real-time AI/RAG Triage (ONNX Category + Grounded Statute + Gemini 3.6 Explanation)
    │
    ▼
[7] Persistence & District Routing (MySQL ──> Regional Admin Scoped Inbox)
    │
    ▼
[8] Guide Matching & Progress (Elo Ranking ──> Admin Assignment ──> STOMP Live Updates)
```
