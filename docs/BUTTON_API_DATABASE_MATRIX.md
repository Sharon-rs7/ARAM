# ARAM AI — Button, API, and Database Traceability Matrix

**Audit Date:** 2026-09-16  
**Version:** Production Reboot 2.0  
**Status:** FORENSICALLY AUDITED & VERIFIED

---

## Matrix Overview
Every user action across the ARAM platform is mapped end-to-end:  
`UI Button` $\rightarrow$ `Frontend Handler` $\rightarrow$ `Frontend Service` $\rightarrow$ `HTTP API` $\rightarrow$ `Backend Controller` $\rightarrow$ `Database Table & Mutation` $\rightarrow$ `Realtime Event` $\rightarrow$ `Verified Status`.

---

## 1. Authentication & Onboarding Actions

| Page | Button / Action | Frontend Handler | Service & Method | API Endpoint | Backend Controller | DB Table & Mutation | Realtime Event | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Login** | "Sign In" | `handleSubmit()` | `authService.login()` | `POST /api/auth/login` (Port 8081) | `AuthController.login()` | `users` (Read/Verify Hash) | None | `[REAL]` |
| **Register** | "Create Account" | `handleRegister()` | `authService.register()` | `POST /api/auth/register` (Port 8081) | `AuthController.register()` | `users` (Insert User Record) | None | `[REAL]` |
| **Forgot Password** | "Send Reset Link" | `handleForgot()` | `authService.forgotPassword()` | `POST /api/auth/forgot-password` (8081) | `PasswordResetController` | `password_reset_tokens` (Insert) | Email Dispatch | `[REAL]` |
| **Reset Password** | "Update Password" | `handleReset()` | `authService.resetPassword()` | `POST /api/auth/reset-password` (8081) | `PasswordResetController` | `users` (Update Password Hash) | None | `[REAL]` |
| **Activate Volunteer**| "Activate Account" | `handleActivate()` | `authService.activateAccount()` | `POST /api/auth/activate` (Port 8081) | `AuthController.activate()` | `users`, `guide_invitations` (Update) | None | `[REAL]` |

---

## 2. Citizen Grievance & Legal-Aid Actions

| Page | Button / Action | Frontend Handler | Service & Method | API Endpoint | Backend Controller | DB Table & Mutation | Realtime Event | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Submit Grievance** | "Start Voice Triage" | `startRecording()` | `voiceService.transcribe()` | `POST /voice/transcribe` (Port 8000) | `speech_router` | Faster-Whisper (In-Memory STT) | None | `[REAL]` |
| **Submit Grievance** | "Upload Evidence" | `handleDocUpload()` | `documentService.ocr()` | `POST /documents/ocr` (Port 8000) | `ocr_router` | EasyOCR + Masking | None | `[REAL]` |
| **Submit Grievance** | "Analyze Grievance"| `handleAnalyze()` | `aiService.analyzeComplaint()` | `POST /complaint/analyze` (Port 8000) | `analyze_router` | ONNX Classifiers + MongoDB Context | None | `[REAL]` |
| **Legal Chatbot** | "Ask ARAM AI" | `handleSendQuery()` | `chatbotService.ask()` | `POST /chat/ask` (Port 8000) | `main.py / chat_ask` | RAG MiniLM Retrieval + Gemini 3.6 | MongoDB Log | `[REAL]` |
| **Submit Grievance** | "Confirm & Submit" | `handleSubmit()` | `complaintService.create()` | `POST /api/complaints` (Port 8082) | `ComplaintController.create()` | `complaints`, `case_timelines` (Insert)| STOMP Admin Alert | `[REAL]` |
| **Track Complaint** | "Search Complaint" | `handleTrack()` | `complaintService.getById()` | `GET /api/complaints/{id}` (Port 8082)| `ComplaintController.getById()` | `complaints` (Read) | None | `[REAL]` |
| **Citizen Dashboard**| "Download PDF" | `handleDownload()` | `complaintService.getReport()` | `GET /api/complaints/{id}/report` (8082)| `ReportController.generate()` | `complaints` (Read & Render) | None | `[REAL]` |

---

## 3. Regional Admin Workflow Actions

| Page | Button / Action | Frontend Handler | Service & Method | API Endpoint | Backend Controller | DB Table & Mutation | Realtime Event | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Regional Dashboard**| "Load Dashboard" | `useEffect()` | `regionalAdminService.getDash()`| `GET /api/regional-admin/dashboard` | `RegionalAdminController` | `complaints` (District Scoped) | None | `[REAL]` |
| **Regional Complaints**| "Filter by Category"| `handleFilter()` | `regionalAdminService.getCases()`| `GET /api/regional-admin/complaints` | `RegionalAdminController` | `complaints` (District Filter) | None | `[REAL]` |
| **Complaint Review** | "Recommend Guides" | `fetchGuideMatch()` | `regionalAdminService.match()` | `POST /api/regional-admin/match-guide` | `RegionalAdminController` | Elo Matcher + Ranking Engine | None | `[REAL]` |
| **Complaint Review** | "Assign Guide" | `handleAssign()` | `regionalAdminService.assign()` | `POST /api/regional-admin/assign-guide`| `RegionalAdminController` | `complaints`, `assignments` (Update) | STOMP Guide Alert | `[REAL]` |
| **Complaint Review** | "Update Status" | `handleStatus()` | `regionalAdminService.updateStatus()`| `PATCH /api/regional-admin/status` | `RegionalAdminController` | `complaints`, `case_timelines` (Update)| STOMP Citizen Alert| `[REAL]` |
| **Volunteer Invites** | "Invite Volunteer" | `handleInvite()` | `regionalAdminService.invite()` | `POST /api/regional-admin/invite-guide` | `RegionalAdminController` | `guide_invitations`, `users` (Insert) | SMTP Email Alert | `[REAL]` |

---

## 4. Legal Guide / Volunteer Actions

| Page | Button / Action | Frontend Handler | Service & Method | API Endpoint | Backend Controller | DB Table & Mutation | Realtime Event | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Guide Dashboard** | "Load Assigned Cases"| `useEffect()` | `volunteerService.getCases()` | `GET /api/helper/cases` (Port 8082) | `HelperController.getCases()` | `complaints` (Assigned Filter) | None | `[REAL]` |
| **Case Review** | "Accept Case" | `handleAccept()` | `volunteerService.acceptCase()` | `POST /api/helper/cases/{id}/accept` | `HelperController.acceptCase()`| `complaints` (Set In-Progress) | STOMP Citizen Alert| `[REAL]` |
| **Case Review** | "Update Action Plan"| `handleSavePlan()` | `volunteerService.updatePlan()` | `PUT /api/helper/cases/{id}/plan` | `HelperController.updatePlan()`| `action_plans` (Insert/Update) | None | `[REAL]` |
| **Case Review** | "Mark Resolved" | `handleResolve()` | `volunteerService.resolveCase()`| `POST /api/helper/cases/{id}/resolve` | `HelperController.resolveCase()`| `complaints` (Status RESOLVED) | STOMP Admin Alert | `[REAL]` |
| **Case Chat** | "Send Message" | `handleSendMessage()`| `chatService.sendMessage()` | `POST /api/chat/messages` (Port 8082) | `ChatController.sendMessage()` | `messages` (Insert Record) | STOMP Realtime Msg | `[REAL]` |

---

## 5. Super Admin Statewide Actions

| Page | Button / Action | Frontend Handler | Service & Method | API Endpoint | Backend Controller | DB Table & Mutation | Realtime Event | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin Dash** | "Statewide Analytics"| `useEffect()` | `adminService.getAnalytics()` | `GET /api/admin/analytics` (Port 8082) | `AdminController.getAnalytics()`| `complaints`, `users` (Statewide Aggr)| None | `[REAL]` |
| **User Management** | "Manage Users" | `useEffect()` | `adminService.getUsers()` | `GET /api/admin/users` (Port 8082) | `AdminController.getUsers()` | `users` (All Statewide Records) | None | `[REAL]` |
| **Audit Logs** | "View Audit Trail" | `useEffect()` | `adminService.getAuditLogs()` | `GET /api/admin/audit-logs` (Port 8082) | `AdminController.getAuditLogs()` | `audit_logs` (Read-only) | None | `[REAL]` |
