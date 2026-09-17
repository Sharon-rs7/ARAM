# ARAM AI — FINAL SYSTEM ARCHITECTURE

## 1. High-Level Architectural Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (React 18 + Vite)                     │
│  - Citizen Web / Mobile Portal                                              │
│  - Legal Guide (Volunteer) Workspace                                        │
│  - Regional Administrator Control Center                                    │
│  - Super Administrator Statewide Operations                                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / WSS
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DISTRIBUTED MICROSERVICES TIER                        │
│                                                                             │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────┐ │
│  │   AUTH SERVICE (:8081) │  │  CORE BACKEND (:8082)  │  │ AI SVC (:8000) │ │
│  │  - Spring Security 6   │  │  - Spring Boot 3.3.5   │  │ - FastAPI      │ │
│  │  - BCrypt + JWT Auth   │  │  - Complaint Lifecycle │  │ - Gemini 3.6 F │ │
│  │  - Refresh Rotation    │  │  - District Scoping    │  │ - FasterWhisper│ │
│  │  - Password Reset / OTP│  │  - WebSocket / STOMP   │  │ - EasyOCR/Tess │ │
│  │  - User Management     │  │  - Email Dispatcher    │  │ - RAG Engine   │ │
│  └───────────┬────────────┘  └───────────┬────────────┘  └───────┬────────┘ │
└──────────────┼───────────────────────────┼───────────────────────┼──────────┘
               │                           │                       │
               ▼                           ▼                       ▼
┌───────────────────────────┐ ┌───────────────────────────┐ ┌────────────────┐
│   MySQL 8.0 (Relational)  │ │   Redis 7 (Distributed)   │ │ MongoDB 6.0    │
│  - System-of-Record       │ │  - Token Blacklist        │ │ - AI Telemetry │
│  - 75 Users, 24 Cases     │ │  - Session Caching        │ │ - Audit Logs   │
│  - Foreign Key Integrity  │ │  - Reliable Job Queues    │ │ - Case Context │
└───────────────────────────┘ └───────────────────────────┘ └────────────────┘
```

## 2. Service Responsibilities & Contracts

### Auth Service (Port 8081)
- Issues cryptographic JWT tokens with RSA/HMAC signing.
- Normalizes role assertions (`CITIZEN`, `HELPER`/`GUIDE`, `REGIONAL_ADMIN`, `SUPER_ADMIN`).
- Implements secure OTP generation and account activation tokens (no plaintext secrets in email).

### Core Legal Aid Backend Service (Port 8082)
- Enforces district scoping: Regional Admins only query complaints belonging to their assigned district.
- Manages full state machine for complaints (`SUBMITTED` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `HELPER_ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`).
- Orchestrates real-time WebSocket communication and asynchronous job callbacks.

### AI & RAG Service (Port 8000)
- Multi-model pipeline: ONNX classifiers, SentenceTransformers (`paraphrase-multilingual-MiniLM-L12-v2`), Faster-Whisper, EasyOCR, and Gemini 3.6 Flash.
- Grounded RAG retrieval over 1,306 statutory chunks with deterministic statutory fallback.
