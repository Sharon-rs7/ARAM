# ARAM AI — Accessible Rights & Assistance Management

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![RAG Grounding](https://img.shields.io/badge/RAG-Verified_Statutory_Corpus-blue.svg)]()
[![Gemini](https://img.shields.io/badge/Gemini_3.6_Flash-Active-purple.svg)]()

**ARAM AI** is a production-grade, multilingual legal-aid triage and assistance management platform designed for citizens navigating the Indian legal and administrative justice system.

---

## 1. What ARAM Does

ARAM bridges the critical civic gap for citizens who do not know:
- What their grievance is legally classified as.
- Which specific government authority or tribunal they should approach.
- What evidence and documentation they need to collect.
- What their next actionable step should be.
- How to seek human assistance from trained Legal Guides (Volunteers).

---

## 2. Architecture & Microservices

```
                    ┌────────────────────────┐
                    │    React 18 + Vite     │
                    │   (Frontend Portal)    │
                    └───────────┬────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │ :8081               │ :8082               │ :8000
          ▼                     ▼                     ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│   AUTH SERVICE    │ │   CORE BACKEND    │ │    AI SERVICE     │
│  - Spring Boot 3  │ │  - Spring Boot 3  │ │  - FastAPI        │
│  - JWT & RBAC     │ │  - Complaints DB  │ │  - Faster-Whisper │
│  - BCrypt Hash    │ │  - District Scope │ │  - SentenceTrans. │
│  - Refresh Tokens │ │  - WebSockets     │ │  - RAG + Gemini   │
└─────────┬─────────┘ └─────────┬─────────┘ └─────────┬─────────┘
          │                     │                     │
          ▼                     ▼                     ▼
┌───────────────────────────────────────────────────────────────┐
│     MySQL 8.0 (System-of-Record) | Redis 7 | MongoDB 6.0      │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Key Capabilities

1. **Multilingual Voice Intake**: Real-time Faster-Whisper audio transcription supporting **Tamil (`ta-IN`)**, **Hindi (`hi-IN`)**, and **English (`en-IN`)**.
2. **Grounded Legal RAG**: 384-dimensional vector retrieval over 1,306 statutory provisions (`indian_legal_documents.parquet`) combined with Google Gemini 3.6 Flash.
3. **Deterministic Safety Guard**: Automatic fallback ensuring strict statutory grounding with zero hallucinated penalties or invented acts.
4. **Explainable Guide Matching**: Multi-factor ranking (District, Language, Specialization, Workload, and Female-Guide Safety Policy for sensitive domestic violence cases).
5. **District-Scoped Access**: Strict server-side isolation ensuring Regional Admins only manage cases within their jurisdiction.

---

## 4. Quickstart Guide

### Prerequisites
- Docker Engine 24+ & Docker Compose
- Java 17+ & Python 3.10+
- MySQL 8.0, Redis 7, MongoDB 6.0

### Run via Docker Compose
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Start all production containers
docker-compose -f docker-compose.prod.yml up --build -d

# 3. Access Web Application
open http://localhost:80
```

### Verified Test Credentials
- **Super Administrator**: `admin@gmail.com` / `Admin@123`
- **Regional Administrator (Chennai)**: `chennai.admin@gmail.com` / `Admin@123`
- **Legal Guide / Volunteer**: `volunteer@gmail.com` / `Helper@123`
- **Citizen / Public User**: `citizen@gmail.com` / `Citizen@123`

---

## 5. Documentation Directory

- [Final System Audit](docs/FINAL_SYSTEM_AUDIT.md)
- [System Architecture](docs/FINAL_SYSTEM_ARCHITECTURE.md)
- [User Journey & Flow](docs/FINAL_USER_FLOW.md)
- [AI Pipeline Flow](docs/FINAL_AI_FLOW.md)
- [RAG Retrieval Flow](docs/FINAL_RAG_FLOW.md)
- [Legal Guide Matching Engine](docs/FINAL_GUIDE_MATCHING.md)
- [Database Architecture](docs/FINAL_DATABASE_ARCHITECTURE.md)
- [Production Deployment Guide](docs/FINAL_DEPLOYMENT.md)
- [Security & Privacy Audit](docs/FINAL_SECURITY.md)
- [Test & Evaluation Report](docs/FINAL_TEST_REPORT.md)
- [Known Limitations & Future Scope](docs/FINAL_KNOWN_LIMITATIONS.md)

---

## 6. Statutory Disclaimer

*ARAM AI provides preliminary legal-aid triage and informational guidance. It is not a court of law, police authority, or substitute for formal legal representation by a licensed advocate.*
