# ARAM — Unified API Documentation

**Base URLs**:
- **Auth Microservice**: `http://localhost:8081/api`
- **Legal Aid Core Service**: `http://localhost:8082/api`
- **AI & RAG Service**: `http://localhost:8000`

---

## 1. Authentication Endpoints (`Port 8081`)

### `POST /auth/login`
- **Description**: Authenticate user and issue Bearer JWT access and refresh tokens.
- **Request Body**:
  ```json
  {
    "username": "citizen@gmail.com",
    "password": "Citizen@123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "7f8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    "user": {
      "id": 3,
      "email": "citizen@gmail.com",
      "role": "CITIZEN",
      "district": "Coimbatore"
    }
  }
  ```

### `POST /auth/refresh`
- **Description**: Rotate expired access token using valid refresh token.
- **Request Body**: `{"refreshToken": "7f8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d"}`
- **Response (200 OK)**: `{"accessToken": "...", "refreshToken": "..."}`

---

## 2. Legal Aid Core Endpoints (`Port 8082`)

### `GET /regional-admin/dashboard?district={district}`
- **Auth Required**: `ROLE_ADMIN` (Strictly scoped to user's assigned district).
- **Response (200 OK)**:
  ```json
  {
    "district": "Chennai",
    "totalComplaints": 11,
    "pendingComplaints": 4,
    "inProgressComplaints": 5,
    "resolvedComplaints": 2,
    "activeVolunteers": 6
  }
  ```

### `POST /complaints`
- **Auth Required**: `ROLE_CITIZEN`.
- **Request Body**:
  ```json
  {
    "title": "Unpaid Wages Dispute",
    "description": "Salary unpaid for past 3 months.",
    "district": "Chennai",
    "category": "LABOUR_WAGE",
    "language": "ta"
  }
  ```
- **Response (200 OK)**: `{"id": 1042, "trackingNumber": "ARM-2026-CHE-1042", "status": "SUBMITTED"}`

---

## 3. AI & RAG Inference Endpoints (`Port 8000`)

### `POST /complaint/analyze`
- **Headers**: `x-internal-token: aram-secret-token-2026`
- **Request Body**:
  ```json
  {
    "title": "Land Dispute",
    "description": "Patta transfer delayed by revenue office.",
    "languageHint": "ta",
    "district": "Coimbatore"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "category": "PROPERTY_DISPUTE",
    "categoryConfidence": 0.70,
    "priority": "HIGH",
    "recommendedAuthority": "District Revenue Officer / TLSC",
    "requiredDocuments": ["Aadhaar Card", "Patta Copy", "Sale Deed"],
    "localizedMessage": "உங்கள் நில பட்டா தொடர்பான ஆவணங்களை சமர்ப்பிக்கவும்."
  }
  ```

### `POST /chat/ask`
- **Headers**: `x-internal-token: aram-secret-token-2026`
- **Request Body**:
  ```json
  {
    "message": "What documents are required for consumer dispute filing?",
    "language": "en",
    "userRole": "CITIZEN"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "answer": "Based on the Consumer Protection Act: 1. Purchase Invoice, 2. Warranty Card, 3. Written notice to seller...",
    "sources": ["Consumer_Protection_Act_2019.pdf#Section35"]
  }
  ```
