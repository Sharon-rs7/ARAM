# 📡 ARAM REST & WebSocket API Reference

## Base URLs
- **Spring Boot Core Backend**: `http://localhost:8082/api`
- **FastAPI AI Microservice**: `http://localhost:8000`

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Auth Required | Role | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/auth/register` | No | Public | Register a new citizen account |
| `POST` | `/api/auth/login` | No | Public | Authenticate user and obtain JWT access token |
| `GET` | `/api/auth/me` | Yes | Any | Retrieve authenticated profile details |
| `POST` | `/api/auth/forgot-password` | No | Public | Request password reset OTP |
| `POST` | `/api/auth/reset-password` | No | Public | Reset account password using verified OTP |

---

## 2. Complaint & Grievance Endpoints (`/api/complaints`)

| Method | Endpoint | Auth Required | Role | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/complaints` | Yes | `CITIZEN` | Submit a new grievance |
| `GET` | `/api/complaints/my` | Yes | `CITIZEN` | List all grievances filed by authenticated citizen |
| `GET` | `/api/complaints/{id}` | Yes | Owner / Admin / Guide | Fetch complete grievance dossier by ID |
| `PATCH` | `/api/complaints/{id}/status` | Yes | `ADMIN`, `GUIDE` | Update complaint status (`AI_TRIAGED` -> `RESOLVED`) |
| `POST` | `/api/complaints/{id}/documents` | Yes | Owner | Upload supporting evidentiary documents |

---

## 3. AI Assistant & RAG Endpoints (`/api/chat` & `/api/ai`)

| Method | Endpoint | Auth Required | Role | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/chat/ask` | Optional | Public / `CITIZEN` | Core legal assistant & case status query |
| `POST` | `/api/ai/analyze` | Yes | `CITIZEN`, `ADMIN` | Trigger automated category and priority triage |
| `POST` | `/api/ai/verify-document` | Yes | `CITIZEN`, `GUIDE` | Run OCR document readiness check |
| `POST` | `/api/ai/case-assistant` | Yes | `GUIDE` | Copilot for legal guides drafting action plans |

---

## 4. Regional & Super Admin Endpoints (`/api/regional-admin` & `/api/admin`)

| Method | Endpoint | Auth Required | Role | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/admin/metrics` | Yes | `SUPER_ADMIN` | Statewide KPI metrics across 38 districts |
| `GET` | `/api/regional-admin/districts/summary` | Yes | `ADMIN`, `SUPER_ADMIN` | District-by-district caseload summary |
| `GET` | `/api/regional-admin/regions/{district}` | Yes | `ADMIN`, `SUPER_ADMIN` | District operational telemetry and grievances |
| `POST` | `/api/admin/assign-guide` | Yes | `ADMIN` | Dispatch legal guide to a pending complaint |

---

## 5. Communications & WebSockets (`/ws/updates`)

| Protocol | Endpoint | Purpose |
| :--- | :--- | :--- |
| `WSS / WS` | `/ws/updates` | STOMP WebSocket broker for live case notifications and messages |
| `REST` | `/api/communications/{id}/messages` | Post/fetch case-specific messages between citizen and guide |
