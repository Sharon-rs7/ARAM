# 🏛️ ARAM — Tamil Nadu Public Legal Aid & Grievance Redressal Platform

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Tamil_Nadu_Public_Legal_Aid-1E3A8A?style=for-the-badge&logo=shield" alt="ARAM Platform" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/RAG_Grounding-1%2C306_Statutory_Provisions-EA580C?style=for-the-badge&logo=book" alt="RAG Grounding" />
  <img src="https://img.shields.io/badge/License-MIT-059669?style=for-the-badge" alt="MIT License" />
</p>

---

## 📌 Overview

**ARAM** is an enterprise-grade, multilingual Public Legal Aid & Citizen Grievance Redressal platform engineered for the citizens, legal guides, and district administrations of **Tamil Nadu**.

ARAM bridges the critical gap between citizens facing legal or administrative grievances and the formal justice apparatus by delivering:

1. **Authenticated, Case-Aware Legal AI Copilot**: Dynamic query resolution grounded strictly against 1,306 certified statutory provisions of Indian Law with fail-closed hallucination prevention.
2. **Deterministic 7-Stage Grievance Lifecycle**: Automated classification, OCR document readiness scoring, and milestone tracking from intake to formal redressal.
3. **Statewide 38-District Command Center**: Real-time regional telemetry for District Grievance Redressal Officers and statewide administration for the Super Administrator.
4. **Verified Legal Guide Force**: Dispatch and caseload management for 120+ specialized advocates, dispute mediators, and paralegal volunteers.
5. **Multilingual Speech & Document OCR**: Voice and text support in Tamil (தமிழ்), Hindi (हिंदी), and English with automated evidentiary verification.

---

## 🏗️ System Architecture & Microservice Topology

```text
                               ┌────────────────────────────────────────┐
                               │       REACT 18 + VITE FRONTEND         │
                               │   TailwindCSS • Lucide • Recharts UI   │
                               └───────────────────┬────────────────────┘
                                                   │ HTTPS / WSS
                                                   ▼
                               ┌────────────────────────────────────────┐
                               │       SPRING BOOT 3 CORE BACKEND       │
                               │  Spring Security • JWT Auth • Port 8082 │
                               │  Citizen Context Engine • WebSockets   │
                               └─────────┬────────────────────┬─────────┘
                                         │                    │
                    ┌────────────────────┘                    └────────────────────┐
                    ▼                                                              ▼
┌────────────────────────────────────────┐                       ┌────────────────────────────────────────┐
│        FASTAPI AI MICROSERVICE         │                       │         MYSQL 8.0 & REDIS 7            │
│         Python 3.14 • Port 8000        │                       │  Relational System-of-Record (MySQL)   │
│ ┌────────────────────────────────────┐ │                       │  Distributed Token/Cache Store (Redis) │
│ │  Citizen Case & Context Parser     │ │                       └────────────────────────────────────────┘
│ ├────────────────────────────────────┤ │
│ │  Hybrid RAG (Vector + BM25 + RRF)  │ │
│ ├────────────────────────────────────┤ │
│ │  Legal Grounding & Anti-Hallucinate│ │
│ ├────────────────────────────────────┤ │
│ │  LLM Router (Qwen / Gemini 2.5)    │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

## ⚡ Core Platform Capabilities

### 1. Authenticated Citizen Legal AI Assistant
> **Core Principle:** *Gemini speaks for ARAM; ARAM decides what Gemini is allowed to know and say.*

- **Server-Side Identity Anchor**: Authenticated citizen context is extracted strictly via Spring Security `SecurityContextHolder` (client user parameters are never trusted).
- **Proactive Case Disambiguation**: Proactively retrieves and lists the citizen's active complaints (`ARAM-XX-TN-XXX-XXXXXX`) when asking generic status questions.
- **Dynamic Case Context Binding**: Queries database state in real-time to return title, status, priority, district, assigned legal guide notes, and uploaded document verification statuses.
- **Fail-Closed Legal Grounding Gate**: If no verified statutory section exists in the 1,306-chunk corpus for a query, ARAM outputs a truthful uncertainty response instead of fabricating laws or penalties.
- **Cross-User Privacy Guard**: Queries for unauthorized or non-existent case IDs safely return non-disclosure notices.

```text
Citizen Query ──► JWT Auth ──► CitizenContextTool ──► Dynamic Query Analyzer
                                                               │
   ┌───────────────────────────────────────────────────────────┘
   ▼
Hybrid RAG ──► BM25 + Vector + Jurisdiction Filter ──► Reranker ──► Legal Grounding Gate
                                                                            │
   ┌────────────────────────────────────────────────────────────────────────┘
   ▼
LLM Router (Qwen / Gemini) ──► Grounding Validator ──► Personalized Response (EN/TA/HI)
```

---

### 2. Grievance Submission & Real-Time Case Lifecycle
Every grievance submitted to ARAM follows a deterministic 7-stage lifecycle:

```text
[SUBMITTED] ──► [AI_TRIAGED] ──► [GUIDE_ASSIGNED] ──► [UNDER_INVESTIGATION] ──► [AUTHORITY_RECOMMENDED] ──► [RESOLVED] ──► [CLOSED]
```

- **Sequential Case ID**: `ARAM-{YY}-TN-{DISTRICT_CODE}-{SEQUENTIAL_NUMBER}` (e.g. `ARAM-26-TN-CBE-000037`).
- **Automated AI Triage**: Analyzes description to predict category, priority, and competent authority (DLSA, Labour Commissioner, Sub-Registrar Office, Consumer Forum, 1930 Cyber Cell).
- **OCR Evidence Engine**: Validates document readiness for title deeds, rental agreements, FIRs, and pay slips.
- **Real-Time WebSockets**: Live status updates and bi-directional messaging between Citizen and Assigned Legal Guide.

---

### 3. Statewide 38-District Administration
- **Super Administrator Command Center**:
  - Live 38-district telemetry grid displaying active caseloads, pending reviews, and resolution rates.
  - Onboarding and credential management for District Grievance Redressal Officers.
  - Legal guide force allocation (120+ specialized advocates across Tamil Nadu).
  - Cryptographic audit trail and compliance sweeps.
- **District Grievance Redressal Officers**:
  - District-scoped isolation ensuring administrators only access grievances within their assigned district.
  - Direct dispatch to local Taluk Legal Services Committees (TLSC) and DLSA panels.

---

## 🚀 Repository Structure

```text
ARAM/
├── src/                          # React 18 + Vite Frontend Portal
│   ├── components/               # Reusable UI components (Citizen, Admin, SuperAdmin, Guide)
│   ├── context/                  # AuthContext, NotificationContext, WebSocket contexts
│   ├── pages/                    # Role-based dashboards & grievance management views
│   └── services/                 # Axios API clients & WebSocket connection managers
├── aram-backend/                 # Spring Boot 3 Core Backend Service (Port 8082)
│   ├── src/main/java/            # Controllers, Services, Security, DTOs, and Repositories
│   ├── src/main/resources/       # application.yml, schema.sql
│   └── pom.xml                   # Maven dependencies (Spring Security, JPA, MySQL, Redis)
├── ai-service/                   # FastAPI AI & Hybrid RAG Microservice (Port 8000)
│   ├── app/                      # Chatbot engine, routers, OCR, STT, and classification models
│   ├── datasets/                 # Benchmark & statutory legal datasets
│   ├── models/                   # Pre-compiled vector & BM25 indices (1,306 statutory chunks)
│   └── requirements.txt          # Python dependencies (FastAPI, Uvicorn, LangChain, FAISS)
├── docs/                         # Authoritative Architectural Documentation
│   ├── AI_ARCHITECTURE.md        # AI pipeline, fail-closed grounding, dynamic context binding
│   ├── SYSTEM_WORKFLOW.md        # Grievance lifecycle state machine & district governance
│   ├── API.md                    # REST & WebSocket API specification
│   └── ARAM_Hackathon_Pitch_Deck.pptx # Executive platform presentation
├── scripts/                      # Operational test suites and verification scripts
├── docker-compose.yml            # Multi-container orchestration (Backend, AI, MySQL, Redis)
├── docker-compose.prod.yml       # Production deployment profile
└── .env.example                  # Environment configuration template
```

---

## 🛠️ Local Development & Quick Start

### Prerequisites
- **Node.js**: v18.0+ & npm
- **Java JDK**: 17+ (Temurin / OpenJDK)
- **Python**: 3.10+ (tested on Python 3.14)
- **MySQL**: 8.0+

---

### 1. AI Microservice Setup (FastAPI)
```bash
cd ai-service
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Launch FastAPI server on port 8000
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

### 2. Core Backend Setup (Spring Boot)
```bash
cd aram-backend
cp .env.example .env

# Build and run with MySQL profile on port 8082
./mvnw clean spring-boot:run -Dspring-boot.run.profiles=mysql
```

---

### 3. Frontend Portal Setup (React + Vite)
```bash
# In repository root
npm install
cp .env.example .env

# Launch Vite development server on port 5173
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 🔐 User Roles & Access Hierarchy

| Role | Access Scope | Primary Dashboard |
| :--- | :--- | :--- |
| **Super Administrator** | Statewide Command Center (All 38 Districts, Telemetry, Admins, AI Audit) | `/superadmin/dashboard` |
| **District Redressal Officer** | District Portal, Regional Grievance Triage, and Guide Dispatch | `/admin/dashboard` |
| **Legal Guide / Advocate** | Assigned Grievance Caseload, Document Reviews, and Citizen Chat | `/guide/dashboard` |
| **Citizen / Public User** | Grievance Filing, AI Legal Assistant, Document Tracking, and Inbox | `/citizen/dashboard` |

> Default local test accounts are populated during initial development startup via Spring Boot `DataInitializer.java`. For staging and production deployments, user credentials and administrator access must be provisioned securely via authenticated API or administrative invite.

---

## 🧪 Automated Testing & Verification

Run the comprehensive test suites:

```bash
# Direct AI Microservice Intent & Context Suite (7/7 tests)
python scripts/test_citizen_ai_flows.py

# Live JWT Authenticated End-to-End Chatbot Suite (6/6 tests)
python scratch/test_end_to_end_citizen_chat.py
```

---

## 📚 Documentation Hub

For in-depth technical documentation, refer to:
- [AI Architecture & Legal Grounding](docs/AI_ARCHITECTURE.md)
- [System & Operational Workflows](docs/SYSTEM_WORKFLOW.md)
- [REST & WebSocket API Reference](docs/API.md)

---

## 📄 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
