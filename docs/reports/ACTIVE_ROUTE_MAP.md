# ARAM Active Route Map

This document maps all active routes in `src/App.jsx` to their corresponding component file paths.

---

## Public Routes
| Route Path | Component | File Path |
| :--- | :--- | :--- |
| `/` | `LandingPage` | `src/pages/Landing/LandingPage.jsx` |
| `/terms` | `TermsConditions` | `src/pages/Legal/TermsConditions.jsx` |
| `/terms-conditions` | `TermsConditions` | `src/pages/Legal/TermsConditions.jsx` |
| `/privacy` | `PrivacyPolicy` | `src/pages/Legal/PrivacyPolicy.jsx` |
| `/privacy-policy` | `PrivacyPolicy` | `src/pages/Legal/PrivacyPolicy.jsx` |
| `/disclaimer` | `Disclaimer` | `src/pages/Legal/Disclaimer.jsx` |
| `/cookie-policy` | `CookiePolicy` | `src/pages/Legal/CookiePolicy.jsx` |
| `/unauthorized` | `Unauthorized` | `src/pages/Errors/Unauthorized.jsx` |
| `/server-error` | `ServerError` | `src/pages/Errors/ServerError.jsx` |
| `/login` | `Login` | `src/pages/Auth/Login.jsx` |
| `/register` | `Register` | `src/pages/Auth/Register.jsx` |
| `/forgot-password` | `ForgotPassword` | `src/pages/Auth/ForgotPassword.jsx` |
| `/otp-verification` | `OTPVerification` | `src/pages/Auth/OTPVerification.jsx` |

---

## Citizen Protected Routes (Role: `CITIZEN`)
| Route Path | Component | File Path |
| :--- | :--- | :--- |
| `/citizen/dashboard` | `Dashboard` | `src/pages/Citizen/Dashboard.jsx` |
| `/citizen/submit-complaint`| `SubmitComplaint`| `src/pages/Citizen/SubmitComplaint.jsx` |
| `/citizen/ai-analysis` | `AIAnalysis` | `src/pages/Citizen/AIAnalysis.jsx` |
| `/citizen/ai-analysis/:complaintId`| `AIAnalysis`| `src/pages/Citizen/AIAnalysis.jsx` |
| `/citizen/history` | `ComplaintHistory`| `src/pages/Citizen/ComplaintHistory.jsx` |
| `/citizen/my-complaints` | `ComplaintHistory`| `src/pages/Citizen/ComplaintHistory.jsx` |
| `/citizen/complaint/:id` | `ComplaintDetails`| `src/pages/Citizen/ComplaintDetails.jsx` |
| `/citizen/complaints/:id`| `ComplaintDetails`| `src/pages/Citizen/ComplaintDetails.jsx` |
| `/citizen/notifications` | `Notifications` | `src/pages/Citizen/Notifications.jsx` |
| `/citizen/chatbot` | `Chatbot` | `src/pages/Citizen/Chatbot.jsx` |
| `/citizen/documents` | `CitizenDocuments`| `src/pages/Citizen/CitizenDocuments.jsx` |
| `/citizen/profile` | `Profile` | `src/pages/Citizen/Profile.jsx` |
| `/citizen/settings` | `Settings` | `src/pages/Citizen/Settings.jsx` |

---

## Volunteer Protected Routes (Role: `VOLUNTEER`)
| Route Path | Component | File Path |
| :--- | :--- | :--- |
| `/volunteer/dashboard` | `VolunteerDashboard`| `src/pages/Volunteer/Dashboard.jsx` |
| `/volunteer/assigned-cases`| `AssignedCases` | `src/pages/Volunteer/AssignedCases.jsx` |
| `/volunteer/complaint/:id` | `VolunteerComplaintDetails`| `src/pages/Volunteer/ComplaintDetails.jsx` |
| `/volunteer/case-review` | `CaseReview` | `src/pages/Volunteer/CaseReview.jsx` |
| `/volunteer/case-review/:id`| `CaseReview` | `src/pages/Volunteer/CaseReview.jsx` |
| `/volunteer/profile` | `VolunteerProfile`| `src/pages/Volunteer/Profile.jsx` |
| `/volunteer/settings` | `VolunteerSettings`| `src/pages/Volunteer/Settings.jsx` |

---

## Admin Protected Routes (Role: `ADMIN`)
| Route Path | Component | File Path |
| :--- | :--- | :--- |
| `/admin/dashboard` | `AdminDashboard` | `src/pages/Admin/Dashboard.jsx` |
| `/admin/manage-users` | `ManageUsers` | `src/pages/Admin/ManageUsers.jsx` |
| `/admin/users` | `ManageUsers` | `src/pages/Admin/ManageUsers.jsx` |
| `/admin/manage-complaints` | `ManageComplaints`| `src/pages/Admin/ManageComplaints.jsx` |
| `/admin/complaints` | `ManageComplaints`| `src/pages/Admin/ManageComplaints.jsx` |
| `/admin/complaint/:id` | `AdminComplaintDetails`| `src/pages/Admin/ComplaintDetails.jsx` |
| `/admin/manage-volunteers` | `ManageVolunteers`| `src/pages/Admin/ManageVolunteers.jsx` |
| `/admin/volunteers` | `ManageVolunteers`| `src/pages/Admin/ManageVolunteers.jsx` |
| `/admin/departments` | `Departments` | `src/pages/Admin/Departments.jsx` |
| `/admin/analytics` | `Analytics` | `src/pages/Admin/Analytics.jsx` |
| `/admin/reports` | `Reports` | `src/pages/Admin/Reports.jsx` |
| `/admin/audit-logs` | `AuditLogs` | `src/pages/Admin/AuditLogs.jsx` |
| `/admin/profile` | `AdminProfile` | `src/pages/Admin/Profile.jsx` |
| `/admin/settings` | `AdminSettings` | `src/pages/Admin/Settings.jsx` |

---

## Redirects & Fallbacks
- `/dashboard` -> Redirects to `/citizen/dashboard`
- `/admin` -> Redirects to `/admin/dashboard`
- `/volunteer` -> Redirects to `/volunteer/dashboard`
- `*` -> Renders `NotFound` page (404)
