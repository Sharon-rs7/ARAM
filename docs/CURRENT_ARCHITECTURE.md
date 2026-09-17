# ARAM AI — Current Architecture Forensic Audit

**Project Name**: ARAM AI — Accessible Rights & Assistance Management  
**Audit Date**: September 16, 2026  
**Status**: Verified & Operational  

---

## 1. System Topology & Microservice Boundaries

```mermaid
graph TD
    Client["React 19 + Vite Frontend / PWA (Port 5173)"]

    subgraph "Edge / Ingress Layer"
        AxiosRouter["Axios Unified Dynamic Router (/api/auth -> 8081, /api -> 8082, /api/ai -> 8000)"]
    end

    subgraph "Microservices Layer"
        AuthSvc["Auth Service (Spring Boot 3.3.5 - Port 8081)<br/><code>com.auth.*</code><br/>JWT Issuing, OTP Verification, Canonical Roles"]
        CoreSvc["Legal Aid Core Service (Spring Boot 3.3.5 - Port 8082)<br/><code>com.aram.legalaid.*</code><br/>Complaints Lifecycle, District Triage, Guide Assignment, STOMP WS"]
        AISvc["AI & RAG Inference Service (FastAPI - Port 8000)<br/><code>Faster-Whisper, ONNX Classifier, MiniLM Embeddings, RAG Engine</code>"]
    end

    subgraph "Persistence & Caching Tier"
        MySQL[("MySQL 8.0 (aram_db:3306)<br/>Authoritative Relational Source of Truth")]
        MongoDB[("MongoDB 7.0 (aram_logs:27017)<br/>Inference Telemetry, Vector Embeddings")]
        Redis[("Redis 7.0 (Port 6379)<br/>Async Queue: aram:jobs:queue, Stats Cache")]
    end

    subgraph "External Integrations"
        SMTP["Google Workspace SMTP (ouraramsupport@gmail.com:587)"]
        SpeechAPI["Browser Native Web Speech API (ta-IN, hi-IN, en-IN TTS)"]
        LLMGateway["Server-Side LLM Gateway (Gemini API / Local Model)"]
    end

    Client --> AxiosRouter
    AxiosRouter -->|/api/auth/*| AuthSvc
    AxiosRouter -->|/api/*| CoreSvc
    AxiosRouter -->|/api/ai/*, /ws/ai/*| AISvc

    AuthSvc -->|Users, OTP Tokens, Refresh Tokens| MySQL
    CoreSvc -->|Complaints, Action Plans, Audit Chains, Notifications| MySQL
    CoreSvc -->|Async Queue & Regional Cache| Redis
    CoreSvc -->|HTTP REST Client Ingestion| AISvc
    CoreSvc -->|JavaMailSender STARTTLS| SMTP

    AISvc -->|Telemetry, Spectrograms, Embedding Chunks| MongoDB
    AISvc -->|Grounded Generation| LLMGateway
    Client -->|Local Voice Synthesis| SpeechAPI
```

---

## 2. Microservice Service Allocations

1. **Frontend Web & PWA (Port 5173)**: React 19, TypeScript/JSX, Vite 8, Tailwind v4, Lucide icons.
2. **Auth Service (Port 8081)**: Spring Boot 3.3.5, Spring Security, JJWT (HS256), BCrypt hashing.
3. **Legal Aid Core Service (Port 8082)**: Spring Boot 3.3.5, Spring Data JPA, Flyway migrations, AES-GCM-256 field encryption.
4. **AI & RAG Service (Port 8000)**: FastAPI, Faster-Whisper, ONNX Runtime, SentenceTransformers MiniLM, EasyOCR.
5. **MySQL 8.0 (Port 3306)**: Authoritative transactional database (`aram_db`).
6. **MongoDB 7.0 (Port 27017)**: High-throughput telemetry & inference logs (`aram_logs`).
7. **Redis 7.0 (Port 6379)**: Asynchronous task queues (`aram:jobs:queue`) and 60s regional metrics cache.
8. **Email System**: Google Workspace SMTP (`ouraramsupport@gmail.com:587`).
