# ARAM Frontend Service to Backend REST Endpoint Map

This document maps all React frontend API client functions (`src/services/*.js`) directly to their corresponding backend controller endpoints.

---

## 🔐 1. Authentication Services (`src/services/authService.js`)

| React Client Function | HTTP Method | Target API Endpoint | Backend Controller Exists? | Postman Request Name | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `authService.register(payload)` | **POST** | `/api/auth/register` | Yes (`AuthController`) | `Register User` | Active |
| `authService.login(payload)` | **POST** | `/api/auth/login` | Yes (`AuthController`) | `Login - Citizen` / `Volunteer` / `Admin` | Active |
| `authService.forgotPassword(email)` | **POST** | `/api/auth/forgot-password` | Yes (`AuthController`) | `Forgot Password` | Active |
| `authService.verifyOtp(email, otp)` | **POST** | `/api/auth/verify-reset-otp` | Yes (`AuthController`) | `Verify OTP` | Active |
| `authService.resetPassword(payload)`| **POST** | `/api/auth/reset-password` | Yes (`AuthController`) | `Reset Password` | Active |
| `authService.refresh(token)` | **POST** | `/api/auth/refresh` | Yes (`AuthController`) | `Token Refresh` | Active |

---

## 👤 2. User Profile Services (`src/services/userService.js`)

| React Client Function | HTTP Method | Target API Endpoint | Backend Controller Exists? | Postman Request Name | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `userService.getProfile()` | **GET** | `/api/users/me` | Yes (`UserController`) | `Get Current Profile` | Active |
| `userService.updateProfile(data)` | **PUT** | `/api/users/me` | Yes (`UserController`) | `Update Profile` | Active |
| `userService.updateAvatar(file)` | **POST** | `/api/users/me/avatar` | Yes (`UserController`) | `Upload Avatar` | Active |
| `userService.updateTheme(pref)` | **PUT** | `/api/users/me/theme` | Yes (`UserController`) | `Update Theme Preference` | Active |

---

## 📝 3. Complaint Management Services (`src/services/complaintService.js`)

| React Client Function | HTTP Method | Target API Endpoint | Backend Controller Exists? | Postman Request Name | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `complaintService.submitComplaint(data)` | **POST**| `/api/complaints` | Yes (`ComplaintController`)| `Submit Complaint` | Active |
| `complaintService.getMyComplaints()` | **GET** | `/api/complaints/my` | Yes (`ComplaintController`)| `Get My Complaints` | Active |
| `complaintService.getComplaintById(id)` | **GET** | `/api/complaints/{id}` | Yes (`ComplaintController`)| `Get Complaint Details` | Active |
| `complaintService.reAnalyzeComplaint(id)`| **POST**| `/api/complaints/{id}/reanalyze` | Yes (`ComplaintController`)| `Reanalyze Case` | Active |
| `complaintService.updateComplaintStatus(id, req)`| **PUT**| `/api/complaints/{id}/status` | Yes (`ComplaintController`)| `Update Complaint Status` | Active |

---

## 📂 4. Document Evidence Services (`src/services/documentService.js`)

| React Client Function | HTTP Method | Target API Endpoint | Backend Controller Exists? | Postman Request Name | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `documentService.uploadDocument(complaintId, file)`| **POST**| `/api/documents/upload` | Yes (`DocumentController`)| `Upload Evidence Document` | Active |
| `documentService.getDocumentsByComplaint(complaintId)`| **GET**| `/api/documents/complaint/{complaintId}`| Yes (`DocumentController`)| `Get Complaint Documents` | Active |
| `documentService.verifyDocument(documentId, request)`| **PUT**| `/api/documents/{documentId}/verification`| Yes (`DocumentController`)| `Update Doc Verification` | Active |
| `documentService.verifyAI(file, expectedType, category)`| **POST**| `/api/documents/verify-ai` | Yes (`DocumentController`)| `Verify Document AI` | Active |

---

## 🔔 5. Notification Services (`src/services/notificationService.js`)

| React Client Function | HTTP Method | Target API Endpoint | Backend Controller Exists? | Postman Request Name | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `notificationService.getNotifications()` | **GET** | `/api/notifications` | Yes (`NotificationController`)| `Get My Notifications` | Active |
| `notificationService.getUnreadCount()` | **GET** | `/api/notifications/unread-count` | Yes (`NotificationController`)| `Get Unread Notification Count`| Active |
| `notificationService.markAsRead(id)` | **PUT** | `/api/notifications/{id}/read` | Yes (`NotificationController`)| `Mark Notification Read` | Active |

---

## 🤝 6. Volunteer / Helper Services (`src/services/volunteerService.js`)

| React Client Function | HTTP Method | Target API Endpoint | Backend Controller Exists? | Postman Request Name | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `volunteerService.getAssignedCases()` | **GET** | `/api/helper/cases` | Yes (`HelperController`)| `Get Helper Cases` | Active |
| `volunteerService.getCaseDetails(id)` | **GET** | `/api/helper/cases/{id}` | Yes (`HelperController`)| `Get Helper Case Details` | Active |
| `volunteerService.updateCaseStatus(id, req)`| **PUT**| `/api/helper/cases/{id}/status` | Yes (`HelperController`)| `Update Case Status` | Active |
| `volunteerService.addCaseNote(id)` | **POST** | `/api/helper/cases/{id}/notes` | Yes (`HelperController`)| `Add Helper Case Note` | Active |
| `volunteerService.getProfile()` | **GET** | `/api/helper/profile` | Yes (`HelperController`)| `Get Helper Profile` | Active |
| `volunteerService.updateProfile(data)` | **PUT** | `/api/helper/profile` | Yes (`HelperController`)| `Update Helper Profile` | Active |

---

## 🤖 7. Artificial Intelligence Services (`src/services/aiService.js` / Proxy)

| React Client Function | HTTP Method | Target API Endpoint | Backend Controller Exists? | Postman Request Name | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `aiService.analyzeComplaintText(payload)`| **POST** | `/api/ai/analyze-complaint` | Yes (`AIProxyController`) | `Analyze Complaint Text` | Active |
| `aiService.askChatbot(payload)` | **POST** | `/api/ai/chat` | Yes (`AIProxyController`) | `Chat with Assistant` | Active |
| `aiService.ocrDocument(file)` | **POST** | `/api/ai/documents/ocr` | Yes (`AIProxyController`) | `OCR Extract Document` | Active |
| `aiService.verifyDocument(file, params)`| **POST**| `/api/ai/documents/verify` | Yes (`AIProxyController`) | `Verify Document Details` | Active |

---

## 🛠️ 8. Platform Administration Services (`src/services/adminService.js`)

| React Client Function | HTTP Method | Target API Endpoint | Backend Controller Exists? | Postman Request Name | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `adminService.getDashboardStats()` | **GET** | `/api/admin/dashboard` | Yes (`AdminController`) | `Get Admin Dashboard` | Active |
| `adminService.getUsers()` | **GET** | `/api/admin/users` | Yes (`AdminController`) | `Get Admin Users` | Active |
| `adminService.getUserById(id)` | **GET** | `/api/admin/users/{id}` | Yes (`AdminController`) | `Get Admin User Details` | Active |
| `adminService.updateUser(id, data)` | **PUT** | `/api/admin/users/{id}` | Yes (`AdminController`) | `Update Admin User` | Active |
| `adminService.deleteUser(id)` | **DELETE**| `/api/admin/users/{id}` | Yes (`AdminController`) | `Soft Delete User` | Active |
| `adminService.getVolunteers()` | **GET** | `/api/admin/helpers` | Yes (`AdminController`) | `Get Admin Helpers List` | Active |
| `adminService.approveVolunteer(id)` | **PUT** | `/api/admin/helpers/{id}/verify` | Yes (`AdminController`) | `Verify Helper Profile` | Active |
| `adminService.rejectVolunteer(id)` | **PUT** | `/api/admin/helpers/{id}/reject` | Yes (`AdminController`) | `Reject Helper Profile` | Active |
| `adminService.assignVolunteer(caseId, helperId)`| **PUT**| `/api/admin/complaints/{caseId}/assign-helper`| Yes (`AdminController`)| `Assign Helper to Complaint`| Active |
| `adminService.deleteComplaint(caseId)` | **DELETE**| `/api/admin/complaints/{caseId}` | Yes (`AdminController`)| `Soft Delete Complaint` | Active |
| `adminService.getAuditLogs()` | **GET** | `/api/admin/audit-logs` | Yes (`AdminController`)| `Get System Audit Logs` | Active |
| `adminService.getReportStats()` | **GET** | `/api/admin/reports` | Yes (`AdminController`)| `Get Reports Statistics` | Active |
| `adminService.exportExcelReport(role)` | **GET** | `/api/admin/users/export` | Yes (`AdminController`)| `Export Users List Excel` | Active |
