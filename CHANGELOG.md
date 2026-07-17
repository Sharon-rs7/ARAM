# Changelog - ARAM Final Cleanup & Stabilization Pass

All notable changes made during this final stabilization and cleanup phase are documented below.

---

## 🛡️ 1. Security & Configuration Fixes
- **JWT Secret Security:** Updated `application.properties` to read the signing secret from the environment (`${JWT_SECRET:...}`), avoiding hardcoded values in source control.
- **MySQL Configuration:** Secured `application-mysql.properties` database usernames and passwords to utilize system variables `${DB_USER}` and `${DB_PASSWORD}`.
- **Local Seed Data Notice:** Added critical warning alerts to `ENV_KEYS_GUIDE.md` and `DEMO_CREDENTIALS.md` against using demo seed data in staging or production systems.

---

## 📁 2. File Restructuring & Directory Cleanup
- **Archive Folder Creation:** Moved audit, recovery, and connect-fix markdown reports from the root directory into `docs/history/` to declutter the workspace.
- **Leftover Duplicates Removal:** Deleted duplicate code files (like `ProtectedRoute.jsx` and misspelled `Model.jsx`).
- **Python venv Cleanup:** Deleted the local virtual environment `venv/`, all Python `__pycache__` compile folders, and log files (`*.log`) from the root and backend folders to optimize bundle size.
- **Advocate/Authority/Helper Decoupling:** Decoupled stub settings folders (`Advocate/`, `Authority/`, and duplicate `Helper/`) from active code, removing their routes and references from `App.jsx`, `LoginForm.jsx`, and `DEMO_CREDENTIALS.md`.

---

## 📱 3. Mobile PWA & Offline Support
- **Production-Only SW Registration:** Restructured `src/main.jsx` to register the service worker ONLY in production builds (`import.meta.env.PROD`), preventing dev cache pollution.
- **Cache Troubleshooting Docs:** Added PWA site data clearing and service worker unregistration manuals in `README.md` and `LOCAL_MOBILE_RUN_GUIDE.md`.
- **LAN Command Scripts:** Added `"dev:host": "vite --host 0.0.0.0"` and `"preview:host": "vite preview --host 0.0.0.0"` in `package.json` to facilitate LAN testing.

---

## 📱 4. Mobile Responsiveness & Layout drawer
- **Mobile Sidebar Drawer:** Replaced the desktop-only sidebar layout with a toggleable drawer with overlays and backdrops in `DashboardLayout.jsx` and added a hamburger menu trigger in `Topbar.jsx`.
- **Spacing Improvements:** Reduced screen padding on mobile sizes (`p-4` instead of `p-8`) to prevent horizontal clipping on 360px width viewports.
- **Browser Alert Replacement:** Removed browser `alert()` from `InstallAppButton.jsx` and replaced it with a sleek Sonner toast.

---

## 🎨 5. Professional White UI Pass
- **Unified Brand Theme:** Standardized the sidebar navigations (`CitizenSidebar`, `VolunteerSidebar`, `AdminSidebar`) to a clean white default aesthetic with subtle borders and soft blue active states, removing multi-colored role headers.

---

## ⚙️ 6. AI Service Mock Fallback
- **Pre-Release Python Compatibility:** Added dynamic mocks for python libraries (`scipy`, `pandas`, `numpy`, `easyocr`, `joblib`, etc.) in `ai-service/app/main.py`.
- **Graceful Startup:** Confirmed that the Uvicorn web gateway boots successfully on newer environments without C compilation errors.

---

## 📖 7. Technical Guides & Documents
- **Build Guide:** Created `BUILD_LOCAL_RELEASE_GUIDE.md` detailing build triggers, LAN hosting, and offline PWA limits.
