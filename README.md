# ARAM – AI Powered Legal Aid Triage and Complaint Management System
This is a student academic project designed to provide multilingual legal aid triage, administrative routing, and grievance tracking for citizens, volunteers, and admin coordinators.

---

## 🛠️ 1. Project Setup & Run Instructions

### A. Quick Start Desktop Runners (.bat)
Double-click these batch scripts in the project root to start the servers instantly:
* **`START_FRONTEND_LOCAL.bat`:** Launches the Vite frontend at `http://localhost:5173`.
* **`START_BACKEND_LOCAL.bat`:** Starts the Spring Boot backend server on port `8080`.
* **`START_FRONTEND_MOBILE_HOST.bat`:** Launches the frontend on LAN (`0.0.0.0`) for mobile testing.

### B. Manual Startup Commands
* **Vite React Frontend:**
  ```bash
  npm install
  npm run dev
  ```
  Runs at: `http://localhost:5173`

* **Spring Boot Java Backend:**
  ```bash
  cd aram-backend
  mvn spring-boot:run
  ```
  Runs at: `http://localhost:8080` (API endpoint: `/api`)  
  Swagger Docs: `http://localhost:8080/swagger-ui/index.html`  
  H2 Database Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:aramdb`, User: `sa`, Password: leave blank)

* **FastAPI Python AI Service:**
  ```bash
  cd ai-service
  venv\Scripts\activate
  uvicorn app.main:app --host 127.0.0.1 --port 8000
  ```
  Runs at: `http://localhost:8000`

---

## 🔑 2. Demo User Credentials
You can log in to the system using these pre-seeded development accounts:

| Role | Email Address | Password | Portal Dashboard |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@aram.ai` | `Admin@123` | `/admin/dashboard` |
| **Citizen** | `citizen@aram.ai` | `Citizen@123` | `/citizen/dashboard` |
| **Volunteer / Helper** | `volunteer@aram.ai` | `Helper@123` | `/volunteer/dashboard` |

---

## 📂 3. Project Directory Structure
```text
aram/
├── src/                      # React Frontend source code
│   ├── components/           # UI elements & layout wrappers
│   ├── pages/                # Pages (Admin, Citizen, Volunteer, Legal, Auth)
│   ├── routes/               # Route guards (ProtectedRoute, PublicRoute)
│   └── services/             # Axios REST clients
├── aram-backend/             # Spring Boot REST microservice
│   ├── src/main/java         # Controllers, services, and models
│   └── src/main/resources    # Configuration settings and seeded data templates
├── ai-service/               # FastAPI Python AI microservice
│   ├── app/                  # Classifiers and OCR engines
│   └── training/             # Training scripts and datasets
├── public/                   # Static assets & Service Worker offline page
├── postman/                  # Postman API test collection files
├── package.json              # NPM dependencies
└── vite.config.js            # Vite configurations
```

---

## 📱 4. Progressive Web App (PWA) Offline Support
* ARAM is configured as an installable PWA.
* When offline, the browser service worker automatically routes the user to a custom `offline.html` page.
* To reset local worker state during development, open Chrome DevTools (F12) → **Application** → **Service Workers** → click **Unregister**, then clear site data.

---

## 👥 5. Project Developers & Credits
This project was co-created by:
* **Mr. Noyal Ashwin J** (noyalashwin0704@gmail.com | +91 6381276381)
* **Mr. Sharon R** (+91 8220355021)

---

## 👥 6. User-Facing Role Labels
User-facing role labels in the UI have been updated for a professional and accessible experience:
- **Public User** (internally `CITIZEN` / `Citizen`)
- **Legal Guide** (internally `HELPER` / `VOLUNTEER` / `Volunteer`)
- **Admin** (internally `ADMIN` / `Admin`)

> [!NOTE]
> Internal backend enums, database role values, JWT keys, and API/routing paths remain unchanged (`/citizen`, `/volunteer`, `/admin`) for stability.

