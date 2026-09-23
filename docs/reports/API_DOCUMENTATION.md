# ARAM Backend REST API Reference Documentation

This document lists all active API endpoints implemented inside the Spring Boot backend (`com.aram.legalaid.controller`).

---

## 🔐 1. Authentication Module (`/api/auth`)

| Method | Endpoint | Auth Required | Role Required | Request Body | Response Body | Status Codes | Postman Folder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | No | Any | `RegisterRequest` DTO | `AuthResponse` | `200 OK` | `Authentication` |
| **POST** | `/api/auth/login` | No | Any | `LoginRequest` DTO | `AuthResponse` | `200 OK` | `Authentication` |
| **POST** | `/api/auth/refresh` | No | Any | `{"refreshToken": "..."}` | `AuthResponse` | `200 OK` | `Authentication` |
| **POST** | `/api/auth/forgot-password` | No | Any | `ForgotPasswordRequest` | `AuthMessageResponse` | `200 OK` | `Password Reset / OTP` |
| **POST** | `/api/auth/verify-reset-otp` | No | Any | `VerifyOtpRequest` | `AuthMessageResponse` | `200 OK` | `Password Reset / OTP` |
| **POST** | `/api/auth/reset-password` | No | Any | `ResetPasswordRequest` | `AuthMessageResponse` | `200 OK` | `Password Reset / OTP` |

---

## 👤 2. User Profile Module (`/api/users`)

| Method | Endpoint | Auth Required | Role Required | Request Body | Response Body | Status Codes | Postman Folder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/users/me` | Yes | Any | None | `UserResponse` | `200 OK` | `User Profile` |
| **PUT** | `/api/users/me` | Yes | Any | `UserUpdateRequest` | `UserResponse` | `200 OK` | `User Profile` |
| **POST** | `/api/users/me/avatar` | Yes | Any | form-data (`file` multipart) | `UserResponse` | `200 OK` | `User Profile` |
| **PUT** | `/api/users/me/theme` | Yes | Any | `ThemePreferenceRequest` | `UserResponse` | `200 OK` | `User Profile` |

---

## 📝 3. Complaint Management Module (`/api/complaints`)

| Method | Endpoint | Auth Required | Role Required | Request Body | Response Body | Status Codes | Postman Folder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/complaints` | Yes | `CITIZEN` | `ComplaintRequest` | `ComplaintResponse` | `210 Created` | `Citizen Complaints` |
| **GET** | `/api/complaints/my` | Yes | `CITIZEN` | None | `List<ComplaintResponse>` | `200 OK` | `Citizen Complaints` |
| **GET** | `/api/complaints/{id}` | Yes | `CITIZEN`/`HELPER`/`ADMIN` | None | `ComplaintResponse` | `200 OK` | `Complaint Details` |
| **POST** | `/api/complaints/{id}/reanalyze` | Yes | `CITIZEN`/`ADMIN` | None | `AIResultResponse` | `200 OK` | `AI Analysis` |
| **PUT** | `/api/complaints/{id}/status` | Yes | `CITIZEN`/`HELPER`/`ADMIN` | `StatusUpdateRequest` | `ComplaintResponse` | `200 OK` | `Complaint Details` |

---

## 📂 4. Evidence Documents Module (`/api/documents`)

| Method | Endpoint | Auth Required | Role Required | Request Body | Response Body | Status Codes | Postman Folder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/documents/verify-ai` | Yes | Any | form-data (`file`, params) | `AiDocumentVerifyResponse`| `200 OK` | `Documents` |
| **POST** | `/api/documents/upload` | Yes | Any | form-data (`complaintId`, `file`)| `DocumentResponse` | `200 OK` | `Documents` |
| **GET** | `/api/documents/complaint/{complaintId}`| Yes | Any | None | `List<DocumentResponse>` | `200 OK` | `Documents` |
| **PUT** | `/api/documents/{documentId}/verification`| Yes | Any | `DocumentVerificationRequest`| `DocumentResponse` | `200 OK` | `Documents` |

---

## 🤖 5. Artificial Intelligence Module (`/api/ai`)

| Method | Endpoint | Auth Required | Role Required | Request Body | Response Body | Status Codes | Postman Folder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/ai/analyze-complaint` | Yes | Any | `{"complaintText": "...", ...}` | `AiTriageResponse` | `200 OK` | `AI Service Proxy` |
| **POST** | `/api/ai/chat` | Yes | Any | `AiChatRequest` | `AiChatResponse` | `200 OK` | `AI Service Proxy` |
| **POST** | `/api/ai/documents/ocr` | Yes | Any | form-data (`file`) | `Map<String, Object>` | `200 OK` | `AI Service Proxy` |
| **POST** | `/api/ai/documents/verify` | Yes | Any | form-data (`file`, params) | `AiDocumentVerifyResponse`| `200 OK` | `AI Service Proxy` |

---

## 🤝 6. Volunteer / Helper Module (`/api/helper`)

| Method | Endpoint | Auth Required | Role Required | Request Body | Response Body | Status Codes | Postman Folder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/helper/profile` | Yes | `HELPER` | None | `UserResponse` | `200 OK` | `Volunteer / Helper` |
| **PUT** | `/api/helper/profile` | Yes | `HELPER` | `UserUpdateRequest` | `UserResponse` | `200 OK` | `Volunteer / Helper` |
| **POST** | `/api/helper/profile/avatar` | Yes | `HELPER` | form-data (`file`) | `UserResponse` | `200 OK` | `Volunteer / Helper` |
| **GET** | `/api/helper/cases` | Yes | `HELPER` | None | `List<ComplaintResponse>` | `200 OK` | `Volunteer / Helper` |
| **GET** | `/api/helper/cases/{id}` | Yes | `HELPER` | None | `ComplaintResponse` | `200 OK` | `Volunteer / Helper` |
| **PUT** | `/api/helper/cases/{id}/status` | Yes | `HELPER` | `StatusUpdateRequest` | `ComplaintResponse` | `200 OK` | `Volunteer / Helper` |
| **POST** | `/api/helper/cases/{id}/notes` | Yes | `HELPER` | None | `ComplaintResponse` | `200 OK` | `Volunteer / Helper` |

---

## ⚖️ 7. Advocate Module (`/api/advocate`)

| Method | Endpoint | Auth Required | Role Required | Request Body | Response Body | Status Codes | Postman Folder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/advocate/cases` | Yes | `ADVOCATE` | None | `List<ComplaintResponse>` | `200 OK` | `Complaint Details` |
| **GET** | `/api/advocate/cases/{id}` | Yes | `ADVOCATE` | None | `ComplaintResponse` | `200 OK` | `Complaint Details` |
| **POST** | `/api/advocate/cases/{id}/opinion` | Yes | `ADVOCATE` | `{"opinion": "..."}` | `ComplaintResponse` | `200 OK` | `Complaint Details` |

---

## 🏛️ 8. Department Authorities Module (`/api/authorities`)

| Method | Endpoint | Auth Required | Role Required | Request Body | Response Body | Status Codes | Postman Folder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/authorities` | Yes | Any | None | `List<Authority>` | `200 OK` | `Departments / Authorities` |
| **GET** | `/api/authorities/category/{category}`| Yes | Any | None | `List<Authority>` | `200 OK` | `Departments / Authorities` |
| **GET** | `/api/authorities/cases` | Yes | `AUTHORITY` | None | `List<ComplaintResponse>` | `200 OK` | `Departments / Authorities` |
| **GET** | `/api/authorities/cases/{id}` | Yes | `AUTHORITY` | None | `ComplaintResponse` | `200 OK` | `Departments / Authorities` |
| **PUT** | `/api/authorities/cases/{id}/status` | Yes | `AUTHORITY` | `{"status": "..."}` | `ComplaintResponse` | `200 OK` | `Departments / Authorities` |
| **POST** | `/api/authorities/cases/{id}/remarks`| Yes | `AUTHORITY` | `{"remarks": "..."}` | `ComplaintResponse` | `200 OK` | `Departments / Authorities` |

---

## 🔔 9. Notifications Module (`/api/notifications`)

| Method | Endpoint | Auth Required | Role Required | Request Body | Response Body | Status Codes | Postman Folder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/notifications` | Yes | Any | None | `List<NotificationResponse>`| `200 OK` | `Notifications` |
| **GET** | `/api/notifications/unread-count` | Yes | Any | None | `{"count": 0}` | `200 OK` | `Notifications` |
| **PUT** | `/api/notifications/{id}/read` | Yes | Any | None | `NotificationResponse` | `200 OK` | `Notifications` |

---

## 🛠️ 10. Platform Administration Module (`/api/admin`)

| Method | Endpoint | Auth Required | Role Required | Request Body | Response Body | Status Codes | Postman Folder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/admin/dashboard` | Yes | `ADMIN` | None | `AdminDashboardResponse` | `200 OK` | `Admin Dashboard` |
| **GET** | `/api/admin/complaints` | Yes | `ADMIN` | None | `List<ComplaintResponse>` | `200 OK` | `Admin Complaints` |
| **PUT** | `/api/admin/complaints/{id}/status`| Yes | `ADMIN` | `StatusUpdateRequest` | `ComplaintResponse` | `200 OK` | `Admin Complaints` |
| **GET** | `/api/admin/users` | Yes | `ADMIN` | None | `List<UserResponse>` | `200 OK` | `Admin Users` |
| **GET** | `/api/admin/users/{id}` | Yes | `ADMIN` | None | `UserResponse` | `200 OK` | `Admin Users` |
| **PUT** | `/api/admin/users/{id}` | Yes | `ADMIN` | `UserUpdateRequest` | `UserResponse` | `200 OK` | `Admin Users` |
| **DELETE**| `/api/admin/users/{id}` | Yes | `ADMIN` | None | `UserResponse` (Soft Deleted)| `200 OK` | `Admin Users` |
| **GET** | `/api/admin/helpers` | Yes | `ADMIN` | None | `List<UserResponse>` | `200 OK` | `Admin Volunteers` |
| **PUT** | `/api/admin/helpers/{id}/verify` | Yes | `ADMIN` | None | `UserResponse` | `200 OK` | `Admin Volunteers` |
| **PUT** | `/api/admin/helpers/{id}/reject` | Yes | `ADMIN` | None | `UserResponse` | `200 OK` | `Admin Volunteers` |
| **PUT** | `/api/admin/complaints/{id}/assign-helper`| Yes | `ADMIN` | `{"helperId": 1}` | `ComplaintResponse` | `200 OK` | `Admin Complaints` |
| **DELETE**| `/api/admin/complaints/{id}` | Yes | `ADMIN` | None | `ComplaintResponse` | `200 OK` | `Admin Complaints` |
| **GET** | `/api/admin/audit-logs` | Yes | `ADMIN` | None | `List<AuditLog>` | `200 OK` | `Audit Logs` |
| **GET** | `/api/admin/reports` | Yes | `ADMIN` | None | `AdminDashboardResponse` | `200 OK` | `Reports / Export` |
| **GET** | `/api/admin/users/export` | Yes | `ADMIN` | None (Query param: `role`) | Binary Excel Stream | `200 OK` | `Reports / Export` |

---

## 🏥 11. Health Module (`/api/health`)

| Method | Endpoint | Auth Required | Role Required | Request Body | Response Body | Status Codes | Postman Folder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | No | Any | None | `{"status":"ok", "service":"..."}`| `200 OK` | `Health & System` |
