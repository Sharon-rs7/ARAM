# 🏛️ ARAM — Tamil Nadu Public Legal Aid & Grievance Redressal Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev)
[![RAG Grounding](https://img.shields.io/badge/RAG_Grounding-1%2C306_Statutory_Provisions-orange.svg)]()

**ARAM** is an enterprise-grade, multilingual Public Legal Aid & Citizen Grievance Redressal system built for the citizens and district administrations of Tamil Nadu and India.

ARAM bridges the critical gap between citizens facing legal or administrative grievances and the formal justice apparatus by providing:
1. **Authenticated, Case-Aware Legal AI Copilot**: Dynamic, real-time query resolution grounded strictly against 1,306 certified Indian law provisions with fail-closed hallucination prevention.
2. **End-to-End Grievance Lifecycle Management**: Full tracking from complaint submission, automated category classification, and document verification to assigned legal guide resolution.
3. **38-District Telemetry & Regional Governance**: District-scoped oversight for District Grievance Redressal Officers and statewide analytics for the Super Administrator.
4. **Verified Legal Guide Force**: Dispatch and caseload management for 120+ specialized advocates, dispute mediators, and paralegal volunteers.
5. **Multilingual Voice & Document Verification**: Speech intake in Tamil (தமிழ்), Hindi (हिंदी), and English with automated OCR document readiness scoring.

---

## 🏗️ System Architecture & Microservice Topology

`
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
`

---

## ⚡ Key Workflows & Engine Specifications

### 1. Zero-Hardcode Authenticated Citizen AI Chatbot
> **Core Principle:** *Gemini speaks for ARAM; ARAM decides what Gemini is allowed to know and say.*

- **Server-Side Identity Anchor**: Authenticated citizen context is extracted strictly via Spring Security SecurityContextHolder (never trusted from client parameters).
- **Proactive Case Disambiguation**: Proactively retrieves and lists the citizen's active complaints (ARAM-XX-TN-XXX-XXXXXX) when asking generic status questions.
- **Dynamic Case Context**: Queries database state in real-time to return title, status, priority, district, assigned legal guide notes, and uploaded document verification statuses.
- **Fail-Closed Legal Grounding Gate**: If no verified statutory section exists in the 1,306-chunk corpus for a query, ARAM outputs a truthful uncertainty response instead of fabricating laws or penalties.
- **Cross-User Privacy Guard**: Queries for unauthorized or non-existent case IDs safely return non-disclosure notices without disclosing case existence.

`
Citizen Query ──► JWT Auth ──► CitizenContextTool ──► Dynamic Query Analyzer
                                                              │
   ┌──────────────────────────────────────────────────────────┘
   ▼
Hybrid RAG ──► BM25 + Vector + Jurisdiction Filter ──► Reranker ──► Legal Grounding Gate
                                                                           │
   ┌───────────────────────────────────────────────────────────────────────┘
   ▼
LLM Router (Qwen / Gemini) ──► Grounding Validator ──► Personalized Response (EN/TA/HI)
`

---

### 2. Grievance Submission & Real-Time Case Lifecycle
Every grievance submitted to ARAM goes through a deterministic 7-stage lifecycle:

`
[SUBMITTED] ──► [AI_TRIAGED] ──► [GUIDE_ASSIGNED] ──► [UNDER_INVESTIGATION] ──► [AUTHORITY_RECOMMENDED] ──► [RESOLVED] ──► [CLOSED]
`

- **Custom Case ID Generation**: ARAM-{YY}-TN-{DISTRICT_CODE}-{SEQUENTIAL_NUMBER}
- **Automated Triage**: Predicts category, priority level, and preliminary competent authority (DLSA, Labour Commissioner, Sub-Registrar, Consumer Forum, 1930 Cyber Cell).
- **Document Evidence Engine**: Optical character recognition (OCR) and readiness scoring for title deeds, rental agreements, FIRs, and pay slips.
- **Real-Time WebSockets**: Live status updates and bi-directional messaging between Citizen and Assigned Legal Guide.

---

### 3. Statewide 38-District Administration & Governance
- **Super Administrator Command Center**:
  - Live 38-district telemetry matrix displaying active caseloads, pending reviews, and resolution rates.
  - Onboarding and credential management for District Grievance Redressal Officers.
  - Legal guide force allocation (120+ specialized advocates across Tamil Nadu).
  - Cryptographic audit trail and compliance sweeps.
- **District Grievance Redressal Officers**:
  - District-scoped isolation ensuring administrators only access grievances within their assigned district.
  - Direct dispatch to local Taluk Legal Services Committees (TLSC) and DLSA panels.

---

## 🚀 Microservices & Folder Structure

`
My-aram-app/
├── src/                          # React 18 + Vite Frontend Portal
│   ├── components/               # Reusable UI components (Citizen, Admin, SuperAdmin, Guide)
│   ├── context/                  # AuthContext, NotificationContext, WebSocket contexts
│   ├── pages/                    # Role-based dashboards & grievance management views
│   └── services/                 # Axios API clients & WebSocket connection managers
├── aram-backend/                 # Spring Boot 3 Core Backend Service
│   ├── src/main/java/            # Controllers, Services, Security, DTOs, and Repositories
│   ├── src/main/resources/       # application.properties, application-mysql.properties
│   └── pom.xml                   # Maven dependencies (Spring Security, JPA, MySQL, Redis, JJWT)
├── ai-service/                   # FastAPI AI & Hybrid RAG Microservice
│   ├── app/                      # Chatbot engine, routers, OCR, STT, and classification models
│   ├── llm/                      # Multi-provider LLM router & grounding validation
│   ├── models/                   # Pre-compiled vector & BM25 indices (1,306 statutory chunks)
│   ├── rag/                      # Dense vector search, RRF fusion, and jurisdiction filter
│   └── requirements.txt          # Python dependencies (FastAPI, Uvicorn, Scikit-learn, PyPDF2)
├── scripts/                      # Automated verification and test suites
└── .env.example                  # Environment configuration templates
`

---

## 🛠️ Getting Started & Local Development

### Prerequisites
- **Node.js**: v18.0+ & npm
- **Java JDK**: 17+ (Temurin / OpenJDK)
- **Python**: 3.10+ (tested on Python 3.14)
- **MySQL**: 8.0+

---

### 1. AI Microservice Setup (FastAPI)
`ash
cd ai-service
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Start FastAPI server on port 8000
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
`

---

### 2. Core Backend Setup (Spring Boot)
`ash
cd aram-backend
cp .env.example .env

# Build and run with MySQL profile on port 8082
./mvnw clean spring-boot:run -Dspring-boot.run.profiles=mysql
`

---

### 3. Frontend Portal Setup (React + Vite)
`ash
# In repository root
npm install
cp .env.example .env

# Launch Vite development server on port 5173
npm run dev
`

Visit **http://localhost:5173** in your browser.

---

## 🔐 Verified Seed Accounts & Credentials

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | superadmin@gmail.com | SuperAdmin@123 | Statewide Command Center (All 38 Districts) |
| **District Redressal Officer** | dmin@gmail.com | Admin@123 | District Portal & Regional Triage |
| **Legal Guide / Advocate** | olunteer@gmail.com | Helper@123 | Assigned Grievance Caseload & Chat |
| **Citizen (Multi-Case)** | citizen@gmail.com | Citizen@123 | Citizen Dashboard, Assistant, & History |

---

## 🧪 Automated Testing & Verification

Run the comprehensive test suites:
`ash
# Direct AI Microservice Intent & Context Suite (7/7 tests)
python scripts/test_citizen_ai_flows.py

# Live JWT Authenticated End-to-End Chatbot Suite (6/6 tests)
python scratch/test_end_to_end_citizen_chat.py
`

---

## 📄 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
