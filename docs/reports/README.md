# ARAM Legal Aid AI Platform

ARAM is an AI-powered legal aid triage and administrative guidance platform designed to assist low-income citizens. The system automatically classifies grievances, predicts case urgency, recommends the correct government departments/judicial forums, and lists required documents and next steps.

---

## 1. Project Directory Structure
The consolidated project layout resides entirely in this repository:
```text
aram/
├── src/                      # Frontend source code (React + Vite)
│   ├── components/           # UI elements (including SettingsCenter)
│   ├── pages/                # Role dashboards and landing pages
│   │   ├── legal/            # Legal pages (Terms, Privacy, Cookies, Disclaimer)
│   │   └── errors/           # Error pages (NotFound, ServerError, Unauthorized)
│   └── services/             # API services (conditional Mock Mode enabled)
├── public/                   # Static media assets and manifest files
├── package.json              # NPM dependencies and script build config
├── vite.config.js            # Bundler configurations
├── .env / .env.example       # API base URLs and mock environment flags
└── aram-backend/             # Spring Boot core API backend
    ├── pom.xml               # Maven configuration
    └── src/                  # Java controllers, repositories and services
```

---

## 2. Environment Configurations
Rename `.env.example` to `.env` in the root frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCKS=false
```

> [!NOTE]
> **Mock Mode Note:** When `VITE_USE_MOCKS` is set to `true`, the application operates in in-memory stateful demo mode using `localStorage` caching. This mode is completely separated inside `src/services/api.mock.js` and does not pollute production endpoints. A high-visibility `DEMO MODE ACTIVE` badge is displayed in the sidebar navigation.

---

## 3. Running the Project

### Core Backend (Spring Boot):
Navigate to the backend folder and compile/run via Maven:
```bash
cd aram-backend
mvn spring-boot:run
```
The backend API exposes endpoints at `http://localhost:8080/api`.

### Frontend Web (Vite + React):
Navigate to the root directory and install dependencies, compile, and run in dev mode:
```bash
# Install packages
npm install

# Run in Development mode
npm run dev

# Compile Production bundle
npm run build
```
The frontend dev server runs at: `http://localhost:5173`.

---

## 4. Key UI Polish & Security Updates
- **Theme Color Integrity:** Preserved original ARAM theme colors utilizing CSS custom variables.
- **Enhanced Profile Validations:** Name lengths (2-60 chars), 10-digit mobile check, required locations, bio constraints (max 300 chars), and avatar type/size boundaries.
- **Comprehensive Settings:** Integrated account validations, light/dark preference persistence, specific status/AI notification selectors, password confirmation check, accessibility scaling options, and legal documents.
- **Legal/Error Routing:** Added terms of service, privacy guidelines, cookie policy, disclaimers, 404 page not found fallbacks, 403 access denied redirects, and 500 server error notices.
