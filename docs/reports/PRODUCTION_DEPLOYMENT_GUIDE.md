# ARAM Legal Aid AI Platform — Production Deployment Guide

This guide describes how to deploy the **ARAM Legal Aid AI Platform** to production using modern cloud infrastructure:
- **Frontend**: [Vercel](https://vercel.com) (React 19 + Vite 8 SPA)
- **Backend API**: [Render](https://render.com) / [Railway](https://railway.app) / AWS ECS (Docker, Spring Boot 3.3.5)
- **AI Microservice**: [Render](https://render.com) / [Railway](https://railway.app) / AWS EC2 (Docker, FastAPI + SentenceTransformers + BM25)
- **Databases**: Managed MySQL 8.0, Redis 7.0, MongoDB Atlas 6.0+

---

## Architecture Overview

```text
                  [ Browser / Mobile Client ]
                               │
               HTTPS / WSS     │
         ┌─────────────────────┼─────────────────────┐
         ▼                                           ▼
   [ Vercel CDN ]                             [ Cloud Backend ]
React 19 + Vite SPA                         Spring Boot (Port 8082)
 (vercel.json rewrites)                              │
                                   ┌─────────────────┼─────────────────┐
                                   ▼                 ▼                 ▼
                              [ MySQL 8.0 ]    [ Redis 7.0 ]     [ MongoDB Atlas ]
                              System-of-Record  PubSub / Cache    AI Audit Logs
                                                     │
                                                     │ HTTP (Internal Token)
                                                     ▼
                                            [ FastAPI AI Service ]
                                                 (Port 8000)
                                            Hybrid RAG + Gemini / Local
```

---

## 1. Frontend Deployment (Vercel)

### Step 1.1: Connect Repository to Vercel
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New Project** and select your GitHub repository: `Sharon-rs7/ARAM`.
3. Set **Framework Preset** to `Vite`.
4. Set **Root Directory** to `./` (or `My-aram-app` if deploying from monorepo root).
5. Build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 1.2: Configure Vercel Environment Variables
Add the following in Vercel **Settings → Environment Variables**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://api.yourdomain.com/api` | Public HTTPS URL of deployed Spring Boot backend |
| `VITE_AUTH_SERVICE_BASE_URL` | `https://api.yourdomain.com/api` | Public HTTPS URL for auth endpoints |
| `VITE_AI_SERVICE_BASE_URL` | `https://ai.yourdomain.com` | Public HTTPS URL for AI telemetry and public AI routes |
| `VITE_WS_URL` | `wss://api.yourdomain.com` | Secure WebSocket URL for real-time notifications |
| `VITE_USE_MOCKS` | `false` | Must be `false` in production |

> [!NOTE]
> The included `vercel.json` automatically configures SPA routing (`/(.*) -> /index.html`) so direct page navigation (e.g. `/citizen/dashboard`, `/login`) works without 404 errors.

---

## 2. Spring Boot Backend Deployment (Render / Railway / AWS ECS)

### Dockerfile
The backend uses a multi-stage Dockerfile located at `aram-backend/Dockerfile`. It compiles using Maven and runs with lightweight Eclipse Temurin 17 JRE.

### Required Environment Variables
Configure these in your backend service dashboard:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `SERVER_PORT` | `8082` | Port exposed by container |
| `SPRING_PROFILES_ACTIVE` | `mysql` | Activates MySQL profile |
| `DB_HOST` | `your-mysql-host.rds.amazonaws.com` | MySQL server hostname |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `aram_db` | Database schema name |
| `DB_USERNAME` | `aram_admin` | Database username |
| `DB_PASSWORD` | `<secure-db-password>` | Database password |
| `DB_USE_SSL` | `true` | Enforces SSL for cloud databases |
| `REDIS_HOST` | `your-redis.upstash.io` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `<secure-redis-password>` | Redis password |
| `SPRING_REDIS_ENABLED`| `true` | Enables distributed WebSocket Pub/Sub |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | `<64-char-secure-secret>` | Secret key for JWT signing |
| `INTERNAL_API_TOKEN` | `<32-char-token>` | Server-to-server secret token |
| `AI_INTERNAL_TOKEN` | `<32-char-token>` | Matches `INTERNAL_API_TOKEN` |
| `APP_ENCRYPTION_KEY` | `<256-bit-key>` | PII AES-GCM encryption key |
| `APP_FRONTEND_URL` | `https://your-app.vercel.app` | Frontend origin for activation links |
| `APP_CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` | Strict CORS allowed origins |
| `AI_SERVICE_URL` | `https://ai.yourdomain.com` | Internal or public URL to AI service |
| `MANAGEMENT_HEALTH_SHOW_DETAILS` | `when_authorized` | Protects system paths from public view |

---

## 3. FastAPI AI Microservice Deployment (Render / Railway / AWS EC2)

### Dockerfile
Located at `ai-service/Dockerfile`. Installs Python 3.10, system libraries for OpenCV/FFmpeg, SentenceTransformers, and BM25 index.

### Required Environment Variables

| Variable | Value | Description |
| :--- | :--- | :--- |
| `PORT` | `8000` | Port exposed by Uvicorn |
| `ENVIRONMENT` | `production` | Enables production security checks |
| `INTERNAL_API_TOKEN` | `<32-char-token>` | Must match Spring Boot's `AI_INTERNAL_TOKEN` |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas URI for audit logging |
| `MONGODB_DATABASE` | `aram_logs` | Log collection database |
| `REDIS_HOST` | `your-redis.upstash.io` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `<secure-redis-password>` | Redis password |
| `GEMINI_API_KEY` | `<google-ai-studio-key>` | API key for Gemini LLM |
| `GEMINI_MODEL` | `gemini-1.5-flash` | LLM model name |
| `DEEPGRAM_API_KEY` | `<deepgram-key>` | Optional: STT speech-to-text key |
| `STT_ENGINE` | `deepgram` or `whisper` | Primary speech recognition engine |

---

## 4. Database Setup Instructions

### 4.1 MySQL 8.0 Setup
1. Provision a MySQL 8.0 instance (AWS RDS, Railway, or Aiven).
2. Create database `aram_db`:
   ```sql
   CREATE DATABASE aram_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Spring Boot Flyway will automatically run migrations `V1` through `V15` on first boot.

### 4.2 Redis Setup
1. Create a free Redis instance on [Upstash](https://upstash.com) or Redis Cloud.
2. Note the endpoint, port (usually 6379), and password.

### 4.3 MongoDB Atlas Setup
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist `0.0.0.0/0` (or your cloud container IP).
3. Copy the SRV connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/aram_logs`.

---

## 5. Post-Deployment Verification Checklist

- [ ] **AI Service Health**: `curl https://ai.yourdomain.com/health` returns `{"status":"healthy","pipelineReady":true}`
- [ ] **Backend Health**: `curl https://api.yourdomain.com/actuator/health` returns `{"status":"UP"}`
- [ ] **Frontend SPA Direct Navigation**: Visit `https://your-app.vercel.app/login` directly in browser — verify no 404.
- [ ] **Citizen Registration**: Register a test account through the UI.
- [ ] **AI Chat Query**: Ask a legal statutory question in the Chatbot — verify grounded response with citations.
- [ ] **Complaint Filing**: File a test grievance and verify AI triage category assignment.
- [ ] **Real-Time WebSocket**: Verify status updates and notification badges connect over `wss://`.
