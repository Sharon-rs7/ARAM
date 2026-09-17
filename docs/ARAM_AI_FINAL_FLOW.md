# ARAM AI — COMPLETE END-TO-END AI LIFECYCLE FLOW
**Accessible Rights & Assistance Management**  
*Citizen $\rightarrow$ Speech/Text $\rightarrow$ RAG $\rightarrow$ Gemini $\rightarrow$ Validation $\rightarrow$ Database $\rightarrow$ Admin $\rightarrow$ Guide Resolution*

---

## 1. The 14-Stage Unified Workflow

```
[1] CITIZEN INTAKE
    ├── Voice Microphone (Tamil/Hindi/English) OR
    ├── Text Query OR
    └── Document Upload (JPG/PNG/PDF)
         │
         ▼
[2] INGESTION & TRANSCRIPTION
    ├── Faster-Whisper Local STT (< 1.2s)
    └── EasyOCR / Tesseract Text & Field Extraction
         │
         ▼
[3] LANGUAGE & SCRIPT DETECTION
    ├── Unicode regex & FastText classifier
    └── Preserves session language throughout lifecycle ('ta', 'hi', 'en')
         │
         ▼
[4] PII DETECTION & MASKING
    └── Strips Aadhaar, bank numbers, phone numbers prior to LLM calls
         │
         ▼
[5] COMPLAINT CLASSIFICATION
    └── Multi-label classifier (10 legal domains) with Unicode script support
         │
         ▼
[6] EXPLAINABLE PRIORITY ENGINE
    └── Calculates Score (0-100) & Status (LOW, MEDIUM, HIGH, CRITICAL)
         │
         ▼
[7] VECTOR RAG RETRIEVAL
    └── 384d MiniLM search against 1,306 statutory chunks in ChromaDB/PKL
         │
         ▼
[8] GROUNDED LLM GENERATION / STATUTORY FALLBACK
    ├── Gemini 1.5 Flash structured synthesis (if quota available) OR
    └── Deterministic statutory fallback (if 429 quota or network outage)
         │
         ▼
[9] ANTI-HALLUCINATION & SAFETY VALIDATION
    ├── Validates chunk IDs (discards invented sections/penalties)
    └── Emergency Guard: triggers 112/181 hotline for crisis inputs
         │
         ▼
[10] STRUCTURED LOCALIZED RENDER
    └── Outputs simplified cards: Understanding, Law, Docs, Authority, Next Steps
         │
         ▼
[11] CITIZEN CONFIRMATION & DB WRITE
    └── Writes real complaint row to MySQL (Generates tracking ID `ARAM-YYYY-XXXX`)
         │
         ▼
[12] REGIONAL DISTRICT ROUTING
    └── Scopes complaint visibility to Regional Admin of the specific district
         │
         ▼
[13] ELO-BASED LEGAL GUIDE MATCHING
    └── Ranks guides by domain expertise, distance, rating, and active workload
         │
         ▼
[14] LIVE WEBSOCKET MEDIATION & RESOLUTION
    └── STOMP WebSocket chat, status timeline updates, and immutable audit logging
```

---

## 2. Verified Acceptance Criteria Matrix

| Criterion | Requirement | Verified Status |
| :--- | :--- | :---: |
| **RAG Knowledge Base** | 1,306 verified chunks, 384d MiniLM embeddings | **PASS** |
| **Multilingual Support** | Tamil (`ta`), Hindi (`hi`), English (`en`) script continuity | **PASS** |
| **Grounded Gemini 1.5** | Constrained prompt with JSON schema validation | **PASS** |
| **Deterministic Fallback** | Intercepts 429 errors; outputs verified statutory advice | **PASS** |
| **Anti-Hallucination Guard** | Intercepts fabricated prison terms or fake sections | **PASS** |
| **STT & OCR Engines** | Faster-Whisper + EasyOCR operational | **PASS** |
| **Database Preservation** | 75 Users, 24 Complaints, 7 Authorities intact | **PASS** |
| **Production Build** | Vite production build compiled with 0 errors in 2.6s | **PASS** |
| **Docker Packaging** | `docker-compose.prod.yml` ready with 7 containers | **PASS** |
