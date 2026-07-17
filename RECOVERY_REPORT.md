# ARAM Forensic Recovery Audit Report

This report presents a complete forensic audit of the ARAM workspace locations, file markers, modification histories, and active routing trees after the system restart.

---

## 1. Project Locations Audit

We verified the status of all folders on this machine:

### A. Active Project Base (`E:\prgt\New folder\aram`)
- **Exists:** True
- **Last Modified:** 07/02/2026 14:25:28 (Very recent)
- **Has package.json:** True
- **Has src/App.jsx:** True
- **Has vite.config.js:** False (Bundles correctly using package default settings)
- **Has aram-backend:** True
- **Has node_modules:** True
- **Has dist:** True (Fresh build created successfully)

### B. Active Backend (`E:\prgt\New folder\aram\aram-backend`)
- **Exists:** True
- **Last Modified:** 07/02/2026 12:23:04
- **Has pom.xml / Java Src:** True
- **Has target build directory:** True

### C. Donor Teammate Project (`E:\prgt\Full stack\aram-app`)
- **Exists:** True
- **Last Modified:** 07/02/2026 11:46:28
- **Has package.json:** True
- **Has src/App.jsx:** True
- **Has vite.config.js:** True
- **Has node_modules:** True
- **Has dist:** True
- *(Note: The user query listed E:\prgt\New folder\Full stack\aram-app, which does not exist. The donor folder is located at E:\prgt\Full stack\aram-app).*

### D. Duplicate/Accidental Locations
- **`E:\prgt\aram`**
  - **Exists:** True (Original old project base)
  - **Last Modified:** 07/02/2026 13:33:35
  - **Has package.json:** True
  - **Has src/App.jsx:** True
  - **Has vite.config.js:** False
  - **Has aram-backend:** True
  - **Has node_modules:** True
  - **Has dist:** False
- **`E:\prgt\New folder\aram-app`:** Exists: False
- **`E:\prgt\New folder\aram\aram-app`:** Exists: False
- **`E:\prgt\New folder\aram\aid`:** Exists: False
- **`E:\prgt\New folder\Full stack`:** Exists: False

---

## 2. Targeted Search Findings
We ran a targeted search for specific UI and system markers across all source directories:

1. **`ARAM TEST ACTIVE`**
   - **Matches Found:** None. (0 occurrences found in any files across all projects).
2. **`DEMO MODE ACTIVE`**
   - **Match:** `E:\prgt\New folder\aram\src\components\Sidebar.jsx` (Line 67)
3. **`VITE_USE_MOCKS`**
   - **Match:** `E:\prgt\New folder\aram\src\services\api.js` (Line 5)
   - **Match:** `E:\prgt\Full stack\aram-app\src\services\api.js` (Line 4)
4. **`SettingsCenter`**
   - **Matches:** Found in `E:\prgt\New folder\aram\src\components\SettingsCenter.jsx` and settings routes (`CitizenSettings.jsx`, `AdminSettings.jsx`, etc.).
5. **`CookiePolicy` / `PrivacyPolicy` / `TermsConditions`**
   - **Matches:** Found in active files inside `E:\prgt\New folder\aram\src\pages\legal\` and in routes in `App.jsx`.
   - **Matches:** Found in teammate project `E:\prgt\Full stack\aram-app\src\pages\Legal\`.
6. **`preliminary complaint guidance`**
   - **Match:** `E:\prgt\New folder\aram\src\pages\legal\Disclaimer.jsx` (Line 20)
   - **Match:** `E:\prgt\New folder\aram\src\pages\LandingPage.jsx` (Line 109)
7. **`Identity visibility`**
   - **Match:** `E:\prgt\New folder\aram\src\components\SettingsCenter.jsx` (Line 542)
   - **Match:** `E:\prgt\New folder\aram\src\pages\legal\PrivacyPolicy.jsx` (Line 31)

---

## 3. Recently Modified Files (Last 3 Days)

### A. Recent Files in `E:\prgt\New folder\aram`
- `src/App.jsx` (UI/Route changes)
- `src/pages/LandingPage.jsx` (FAQ, Category layout updates)
- `src/pages/Profile.jsx` (Citizen/Helper validators addition)
- `src/components/SettingsCenter.jsx` (Multi-role settings configurations)
- `src/components/Sidebar.jsx` (Vite port clashing indicators)
- `src/services/api.js` (Conditional mock switching)
- `src/services/api.mock.js` (Stateful local mock endpoints)
- `README.md` (Running instructions)
- `.env` & `.env.example` (Mock mode configurations)

### B. Recent Files in `E:\prgt\Full stack\aram-app`
- `src/pages/Landing/LandingPage.jsx` (Donor home template)
- `src/pages/Citizen/Settings.jsx` (Settings forms reference)
- `src/pages/Citizen/Profile.jsx` (Profile layouts reference)
- `src/services/authService.js` (Teammate mock database seeds)
- `src/App.jsx` (Donor route configurations)

---

## 4. Git Status Audit
- **`E:\prgt\New folder\aram`:** Not a git repository (fatal: not a git repository).
- **`E:\prgt\Full stack\aram-app`:** Not a git repository.
- **`E:\prgt\aram`:** Not a git repository.

---

## 5. Active Route Tree in `E:\prgt\New folder\aram`

```text
src/main.jsx
└── src/App.jsx
    ├── Public Routes
    │   ├── / ─────────────────────────► src/pages/LandingPage.jsx
    │   ├── /login ────────────────────► src/pages/Login.jsx
    │   ├── /register ─────────────────► src/pages/Register.jsx
    │   ├── /forgot-password ──────────► src/pages/auth/ForgotPassword.jsx
    │   ├── /reset-password ───────────► src/pages/auth/ResetPassword.jsx
    │   ├── /terms ────────────────────► src/pages/legal/TermsConditions.jsx
    │   ├── /privacy ──────────────────► src/pages/legal/PrivacyPolicy.jsx
    │   ├── /disclaimer ───────────────► src/pages/legal/Disclaimer.jsx
    │   ├── /cookies ──────────────────► src/pages/legal/CookiePolicy.jsx
    │   └── /not-authorized ───────────► src/pages/errors/Unauthorized.jsx
    │
    ├── Citizen Protected Routes (CitizenLayout)
    │   ├── /dashboard ────────────────► src/pages/CitizenDashboard.jsx
    │   ├── /dashboard/submit-complaint► src/pages/SubmitComplaint.jsx
    │   ├── /dashboard/my-complaints ──► src/pages/MyComplaints.jsx
    │   ├── /dashboard/complaints/:id ─► src/pages/ComplaintDetails.jsx
    │   ├── /dashboard/profile ────────► src/pages/Profile.jsx
    │   ├── /dashboard/settings ───────► src/pages/citizen/CitizenSettings.jsx
    │   └── /dashboard/ai-chat ────────► src/pages/citizen/AiChat.jsx
    │
    ├── Volunteer/Helper Routes (HelperLayout)
    │   ├── /helper ───────────────────► src/pages/HelperDashboard.jsx
    │   ├── /helper/assigned-cases ────► src/pages/AssignedCases.jsx
    │   ├── /helper/profile ───────────► src/pages/Profile.jsx
    │   └── /helper/settings ──────────► src/pages/helper/HelperSettings.jsx
    │
    └── Admin Routes (AdminLayout)
        ├── /admin ────────────────────► src/pages/AdminDashboard.jsx
        ├── /admin/users ──────────────► src/pages/UserManagement.jsx
        ├── /admin/complaints ─────────► src/pages/ComplaintManagement.jsx
        ├── /admin/audit-logs ─────────► src/pages/AuditLogs.jsx
        └── /admin/settings ───────────► src/pages/admin/AdminSettings.jsx
```

---

## 6. Compare Old Project vs Donor Project

| Page Category | Old File Path (`E:\prgt\New folder\aram\src`) | Donor File Path (`E:\prgt\Full stack\aram-app\src`) | Donor Useful? | Copy Directly? | Needs Adaptation? | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Landing Page** | `pages/LandingPage.jsx` | `pages/Landing/LandingPage.jsx` | **Yes** | No | Yes | Donor uses Tailwind CSS; needs adaptation into old project custom CSS grids and variables. |
| **Login / Register** | `pages/Login.jsx` | `pages/Auth/Login.jsx` | **No** | No | No | Old project already has fully integrated backend authentication endpoints. |
| **Settings** | `components/SettingsCenter.jsx` | `pages/Citizen/Settings.jsx` | **Yes** | No | Yes | Donor split settings across files; we consolidated settings into one responsive card panel. |
| **Profile** | `pages/Profile.jsx` | `pages/Citizen/Profile.jsx` | **Yes** | No | Yes | Adapt field constraints (mobile, bio length, avatar size) to keep backend integration safe. |
| **Legal Pages** | `pages/legal/*` | `pages/Legal/*` | **Yes** | No | Yes | Preserve structural details, and map with custom layouts. |
| **Sidebar** | `components/Sidebar.jsx` | `components/dashboard/Sidebar.jsx` | **Yes** | No | Yes | Keep old project layout structure; only add indicators like Demo Mode badge. |

---

## 7. Active Ports & Process Mapping
- **Port 5173:** Active (PID 7580, Node.js). Serves the updated frontend in `E:\prgt\New folder\aram`.
- **Port 8080:** Active (PID 24072, Java). Serves the Spring Boot backend in `E:\prgt\New folder\aram\aram-backend`.
- **Port 5174 / 5175 / 5176:** Free (Zombie processes successfully terminated).

---

## 8. Overwrite / Deletion Safety Map
- **Full stack/aram-app:** **KEEP FOR NOW** (Important UI reference donor).
- **E:\prgt\aram (Original):** **KEEP FOR NOW** (Original reference backup).
- **old unused NotAuthorized.jsx:** **SAFE TO DELETE** (Replaced by Unauthorized.jsx in errors folder).
- **dist / target folder:** **SAFE TO DELETE** (Safely auto-regenerated during npm build/maven compile).

---

## 9. Recommended Recovery Action Plan
1. **Frontend Active Project:** Keep `E:\prgt\New folder\aram` as the active working project because it contains all the merged pages, error sub-routes, and settings validation logic.
2. **Launch Dev URL:** Open **http://localhost:5173/**. Since clashing processes on 5174/5175 have been cleared, it will correctly load the updated project layout.
3. **Mock Mode switch:** Set `VITE_USE_MOCKS=true` in `.env` if you wish to run the app as a pure in-memory demo without running the local databases.
