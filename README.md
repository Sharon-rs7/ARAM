# ARAM – AI Powered Smart Complaint Management and Legal Aid Triage System

ARAM is an AI-powered legal aid triage, administrative guidance, and real-time complaint management platform designed for low-income citizens, helpers/volunteers, and administrative coordinators.

---

## 📂 1. Project Directory Structure
The project layout is structured as follows:

```text
E:\prgt\New folder\aram/
├── ai-service/               # FastAPI Python AI Classifier & OCR microservice
│   ├── app/                  # Fast API application endpoints & classifiers
│   └── requirements.txt      # Python dependencies
├── aram-backend/             # Core Spring Boot Java REST APIs
│   ├── pom.xml               # Maven configuration
│   └── src/                  # Controllers, services, and repository layers
├── docs/
│   └── history/              # Forensic/audit reports archive
├── postman/                  # Postman collection and local environment JSONs
├── public/                   # Static assets, Manifest, sw.js, and offline.html PWA page
├── src/                      # Frontend client source code (React + Vite)
│   ├── components/           # UI elements & layout wrappers (Topbar, sidebars)
│   ├── context/              # Context providers (AuthContext, ThemeContext)
│   ├── hooks/                # Custom React hooks (usePolling, useOnlineStatus)
│   ├── pages/                # Clean PascalCase dashboard and authentication views
│   │   ├── Admin/            # Admin Panel & Volunteer screen-time analytics
│   │   ├── Advocate/         # Advocate settings and case reviews
│   │   ├── Auth/             # Login, Register, Forgot Password forms
│   │   ├── Authority/        # Department officer panel settings
│   │   ├── Citizen/          # Citizen dashboard and complaint registers
│   │   ├── Errors/           # 404, 401, and 500 error panels
│   │   ├── Landing/          # ARAM Landing page
│   │   ├── Legal/            # Terms of service, privacy guidelines, and policies
│   │   └── Volunteer/        # Helper panels and complaint verification
│   ├── services/             # Axios REST clients (authService, volunteerActivityService)
│   ├── styles/               # CSS brand theme files (global, theme, responsive)
│   └── utils/                # Date formatters and local CSV exports
├── package.json              # NPM dependencies & PWA runner scripts
└── vite.config.js            # Bundler configurations
```

---

## 🛠️ 2. Execution Instructions

### A. Quick Start Desktop Runners (.bat)
Double-click these batch scripts in the project root to start services instantly:
- **`START_BACKEND_LOCAL.bat`:** Starts the Spring Boot Java API server on port `8080`.
- **`START_FRONTEND_LOCAL.bat`:** Starts the frontend client server at `http://localhost:5173`.
- **`START_FRONTEND_MOBILE_HOST.bat`:** Launches the Vite frontend listening on all LAN hosts (`0.0.0.0`) for mobile testing.

### B. Manual Startup Commands
* **Spring Boot API (port `8080`):**
  ```bash
  cd aram-backend
  mvn spring-boot:run
  ```
* **Vite Web Client (port `5173`):**
  ```bash
  npm run dev
  # For mobile LAN testing:
  npm run dev -- --host 0.0.0.0
  ```
* **FastAPI AI Service (port `8000`):**
  ```bash
  cd ai-service
  .\venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
  ```

---

## 📱 3. Mobile PWA & Offline Support
* **Standalone Display:** ARAM is configured as an installable Progressive Web App (PWA).
* **Install Prompts:** Select **"Install ARAM App"** on the landing page or login page footer to install it on your desktop or Android phone home screen.
* **Offline Fallback:** When the network connection fails, the Service Worker (`sw.js`) automatically intercepts navigations to render `public/offline.html`.
* **Clearing Cache & Re-registration (Dev Troubleshooting):**
  - **Desktop Chrome:** Open DevTools (`F12`) → **Application** → **Service Workers** → Click **Unregister**. Go to **Application** → **Storage** → Click **Clear site data**. Reload using `Ctrl + F5`.
  - **Mobile Chrome:** Settings → Site settings → All sites → Find server IP → Tap **Clear & reset**.

---

## 🔗 4. Registered Application Routes
The following routes are declared inside `src/App.jsx`:

### Public Routes
* `/` - Landing Page
* `/login` - Login Portal
* `/register` - User Registration
* `/forgot-password` - Reset Request
* `/otp-verification` - OTP Check
* `/terms` & `/terms-conditions` - Terms of Service
* `/privacy` & `/privacy-policy` - Privacy Guidelines
* `/disclaimer` - Legal Disclaimer
* `/cookie-policy` - Cookie Usage Policy

### Protected Citizen Panel (`allowedRoles={["CITIZEN"]}`)
* `/citizen/dashboard` - Main Citizen Portal
* `/citizen/submit-complaint` - grievance submission form
* `/citizen/ai-analysis` & `/citizen/ai-analysis/:complaintId` - AI feedback summaries
* `/citizen/my-complaints` - Grievance lists
* `/citizen/complaint/:id` - Case status tracker
* `/citizen/notifications` - Alert panels
* `/citizen/chatbot` - Legal assistant AI chat
* `/citizen/documents` - Uploaded proofs manager
* `/citizen/profile` - User profile
* `/citizen/settings` - Preferences panel

### Protected Volunteer/Helper Panel (`allowedRoles={["VOLUNTEER"]}`)
* `/volunteer/dashboard` - Helper active statistics
* `/volunteer/assigned-cases` - Assigned complaints table
* `/volunteer/complaint/:id` - Details page
* `/volunteer/case-review/:id` - Note/Remarks editor
* `/volunteer/profile` - Helper profile
* `/volunteer/settings` - Preferences panel

### Protected Coordinator Admin Panel (`allowedRoles={["ADMIN"]}`)
* `/admin/dashboard` - Main metrics panel
* `/admin/users` - User roles list
* `/admin/complaints` - System complaints list
* `/admin/complaint/:id` - Assignment and status update panel
* `/admin/volunteers` - Helpers verification board
* `/admin/departments` - Routed units list
* `/admin/analytics` - AI triage distributions
* `/admin/reports` - Logs and exports cell
* `/admin/audit-logs` - Platform security logs
* `/admin/volunteer-activity` - Coordinator overview tracking volunteer session time
* `/admin/volunteers/:id/activity` - Detailed session logs for a specific helper
* `/admin/profile` - Admin profile
* `/admin/settings` - Admin settings
