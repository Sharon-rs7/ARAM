# ARAM System Environment Variables & Configuration Guide

This guide details all environment variables and properties configurations across ARAM modules.

> [!WARNING]
> Never hardcode real passwords, API secret keys, database passwords, or JWT secrets in the repository source code.
> Always use local environment configurations (`.env`) or Spring profiles and commit only `.env.example` templates.

> [!IMPORTANT]
> The seed details stored inside `DEMO_CREDENTIALS.md` are purely for local development, testing, and mock databases. Under no circumstances should these account configurations, passwords, or emails be reused in staging or production systems.

---

## 💻 1. Frontend Web App Config (`.env`)
Location: `E:\prgt\New folder\aram\.env`

| Variable | Description | Default Dev Value | Staging / Prod Target |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | The REST API gateway URL | `http://localhost:8080/api` | `https://api.aram.ai/api` |
| `VITE_USE_MOCKS` | Toggles front-end simulated mock databases | `false` | `false` |

---

## ☕ 2. Backend Spring Boot Config (`application.properties` / `application.yml`)
Location: `aram-backend/src/main/resources/application.properties`

| Property Key | Description | Dev Value Placeholder | Production Setup |
| :--- | :--- | :--- | :--- |
| `server.port` | HTTP server execution port | `8080` | `8080` |
| `jwt.secret` | Signing secret key for JWT tokens | `placeholder-jwt-signing-secret-key-at-least-256bits` | `${JWT_SECRET_ENV_VAR}` |
| `jwt.expiration` | Token timeout duration (ms) | `86400000` (24 Hours) | `86400000` |
| `spring.datasource.url` | Database connection URL | `jdbc:h2:mem:aramdb` (In-Memory)| `jdbc:mysql://db.aram.ai:3306/aram` |
| `spring.datasource.username`| Database user name | `SA` | `${DB_USER}` |
| `spring.datasource.password`| Database password | (Blank) | `${DB_PASSWORD}` |
| `spring.h2.console.enabled` | Toggles H2 DB console | `true` | `false` |
| `spring.data.mongodb.uri` | Logs MongoDB connection string | `mongodb://localhost:27017/aram` | `${MONGO_URI}` |

---

## 🤖 3. AI Service Pipeline Config
Location: `ai-service/.env`

| Variable | Description | Placeholder Value | Purpose |
| :--- | :--- | :--- | :--- |
| `AI_SERVICE_URL` | FastAPI routing URL | `http://localhost:8000` | Redirects proxy AI classifications |
| `WHISPER_MODE` | Whisper transcription mode | `local` / `api` | Choose local model vs. mock API mode |
| `WHISPER_MODEL_SIZE` | Size of local model weights to load | `base` / `small` / `tiny` | Balance accuracy vs. hardware speed |
| `WHISPER_DEVICE` | Hardware device to run model on | `cpu` / `cuda` | Run on CPU vs. GPU |
| `WHISPER_COMPUTE_TYPE` | Floating point quantization type | `int8` / `float16` | Optimize memory usage |
| `OCR_ENABLED` | Document OCR scan verification toggle| `true` | Runs scanning pipelines |
| `SPEECH_TO_TEXT_ENABLED` | Toggles audio transcribe translation | `true` | Dictates citizen speech complaints |

---

## ✉️ 4. Email & SMS Integrations Config

| Variable / Key | Description | Placeholder Value | Purpose |
| :--- | :--- | :--- | :--- |
| `MAIL_HOST` | Outgoing SMTP mail server | `smtp.mailtrap.io` | Alert emails dispatch |
| `MAIL_PORT` | SMTP port | `587` | Security dispatch |
| `MAIL_USERNAME` | SMTP User login | `placeholder-only` | Authentication |
| `MAIL_PASSWORD` | SMTP Account password | `placeholder-only` | Authentication |
| `SMS_API_KEY` | Third-party SMS gateway key | `placeholder-only` | OTP registration verification SMS |
| `SMS_SENDER_ID` | Approved Sender header ID | `ARAMAI` | Header tags |
