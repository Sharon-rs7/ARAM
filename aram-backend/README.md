# ARAM Legal Aid Backend

Spring Boot backend for **AI-Based Legal Aid Triage System for Low-Income Citizens**.

## What is included

- JWT register/login/refresh
- Role-based access: CITIZEN, HELPER, ADMIN
- Complaint submission with Tamil/English/Hindi/Tanglish language validation
- Rule-based AI fallback for category, priority, authority, required documents and next steps
- Sensitive complaint, woman helper preference and identity visibility fields
- In-app notification system
- Document upload with validation
- Document verification update endpoint for OCR/CNN AI service callback
- Admin dashboard and complaint management
- H2 database for instant local run
- MySQL profile for real DB
- Optional MongoDB logging for AI/document logs
- Swagger UI

## Run locally

```bash
cd aram-backend
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

Open:

```text
http://localhost:8080/swagger-ui.html
http://localhost:8080/h2-console
```

H2 settings:

```text
JDBC URL: jdbc:h2:mem:aramdb
Username: sa
Password: empty
```

Default admin:

```text
Email: admin@aram.ai
Password: Admin@123
```

## Run with MySQL

Create MySQL or let Spring create DB:

```sql
CREATE DATABASE aram_legal_aid;
```

Edit `src/main/resources/application-mysql.properties` username/password, then run:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=mysql"
```

## Optional MongoDB AI logs

Start MongoDB and set:

```properties
ai.logs.mongodb.enabled=true
spring.data.mongodb.uri=mongodb://localhost:27017/aram_logs
```

MongoDB is optional. If disabled, the backend still works fully.

## Main APIs

### Auth

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/users/me
```

### Complaints

```http
POST /api/complaints
GET  /api/complaints/my
GET  /api/complaints/{id}
POST /api/complaints/{id}/reanalyze
PUT  /api/complaints/{id}/status
```

### Documents

```http
POST /api/documents/upload
GET  /api/documents/complaint/{complaintId}
PUT  /api/documents/{documentId}/verification
```

### Notifications

```http
GET /api/notifications
GET /api/notifications/unread-count
PUT /api/notifications/{id}/read
```

### Admin

```http
GET /api/admin/dashboard
GET /api/admin/complaints
PUT /api/admin/complaints/{id}/status
GET /api/admin/users
```

## Sample register request

```json
{
  "name": "Noyal Ashwin J",
  "email": "noyal@example.com",
  "mobile": "9876543211",
  "password": "Pass1234",
  "role": "CITIZEN"
}
```

## Sample complaint request

```json
{
  "title": "Salary not paid",
  "description": "My employer has not paid my salary for 3 months and is not responding.",
  "language": "ENGLISH",
  "district": "Coimbatore",
  "inputMode": "TEXT",
  "sensitive": false,
  "preferredHelperGender": "ANY",
  "identityVisibility": "VISIBLE"
}
```

## Voice complaint integration

The frontend can call your Python AI service for speech-to-text using Whisper/Faster-Whisper. After transcription, send the converted text to `POST /api/complaints` using:

```json
{
  "inputMode": "VOICE",
  "language": "TAMIL",
  "transcribedText": "En employer 3 months salary kudukala",
  "description": "En employer 3 months salary kudukala"
}
```

## OCR/CNN document verification integration

Flow:

1. Frontend uploads file to `POST /api/documents/upload`.
2. Backend stores metadata with `PENDING` verification.
3. Python OCR/CNN service verifies document.
4. Python service or admin updates result via:

```http
PUT /api/documents/{documentId}/verification
```

Request:

```json
{
  "verificationStatus": "VERIFIED",
  "predictedDocumentType": "SALARY_SLIP",
  "verificationScore": 0.88
}
```

## Notes

This backend has a reliable rule-based AI fallback so it works even before the Python ML service is connected. Later, replace or combine `AIAnalysisService` with FastAPI model calls for multilingual classifier, OCR and document verification.
