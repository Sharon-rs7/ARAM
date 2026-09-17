# ARAM — Master Migration & Execution Plan

**Project**: ARAM — Accessible Rights & Assistance Management  
**Status**: Execution Roadmap  
**Version**: 2.0-PROD  

---

## 1. Migration Phases (Phases 0 to 12)

```
===================================================================================
PHASE 0: Repository Audit & Verification (COMPLETED)
  - Full codebase audit across Frontend, Auth (:8081), Core (:8082), AI (:8000).
  - All REST suites, AI inference endpoints, and Vite production builds passing 100%.

PHASE 1: Database Schema & Canonical Role Normalization (COMPLETED)
  - Verify Flyway migrations V1–V11; confirm 0 orphan records in MySQL aram_db.
  - Enforce centralized HELPER/VOLUNTEER -> GUIDE role mapping in frontend and backend.

PHASE 2: Authentication & Token Security (COMPLETED)
  - Validate JWT issuance, refresh token rotation, and 5-minute OTP password recovery.

PHASE 3: Multilingual Citizen Journey (COMPLETED)
  - Voice/text input -> Faster-Whisper -> RAG guidance -> complaint filing with AES encryption.

PHASE 4: Regional Admin & 38-District Triage (COMPLETED)
  - Live triage queue, SLA risk monitoring, and explainable AI guide matching.
  - Strict 403 Forbidden enforcement on cross-district unauthorized requests.

PHASE 5: Guide Workflow & Real-Time Communication (COMPLETED)
  - Case acknowledgement, milestone tracking, and persistent citizen-guide chat.
  - STOMP WebSocket push alerts + persistent MySQL notifications.

PHASE 6: Super Admin Statewide Command Center (COMPLETED)
  - 38-District interactive performance grid and cryptographic audit log monitoring.

PHASE 7: Full E2E Scenario & Production Verification (COMPLETED)
  - Verified complete Tamil-speaking citizen flow from voice input to guide resolution.
===================================================================================
```

---

## 2. Zero-Downtime Data Safety Strategy

1. **Transactional Integrity**: All transactional entities reside exclusively in MySQL. Flyway migrations enforce strict foreign key constraints without destructive cascade deletes.
2. **Graceful Degradation**: If external AI or speech synthesis services encounter transient latency, the system falls back gracefully to structured taxonomy rules and browser Web Speech APIs without halting core complaint workflows.
3. **Auditability**: Every mutation produces a tamper-evident audit record with SHA-256 hash chaining.
