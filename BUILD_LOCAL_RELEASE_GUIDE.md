# ARAM – Local Release & Production Build Guide

This guide explains how to compile the ARAM application for local releases, host it for LAN testing (mobile/other devices), and install it as a standalone PWA.

---

## 🏗️ 1. Compiling & Building the Application

### A. Frontend Web Application (React + Vite)
Compile the React source files into optimized production assets (`dist/` folder):
```bash
# Clean install dependencies (if new)
npm install

# Compile production bundle
npm run build
```

To run a local production preview (Vite mini-server serving compiled assets):
```bash
# Preview on localhost:4173
npm run preview

# Preview on all LAN interfaces (for phone/tablet access)
npm run preview:host
```

### B. Core Backend API (Spring Boot Java)
Compile and build the Spring Boot microservice to create target executable classes:
```bash
cd aram-backend
mvn clean compile
```

To run the Spring Boot server (listens on `http://localhost:8080`):
```bash
mvn spring-boot:run
```

---

## 📲 2. Hosting & Android Phone Access (LAN)

To view the production preview on physical devices (such as an Android phone) on the same Wi-Fi connection:

1. **Get Laptop IP:**
   - Run `ipconfig` in Command Prompt.
   - Find your Wi-Fi IPv4 address (e.g. `192.168.1.15`).
2. **Start Servers:**
   - Backend: Run `mvn spring-boot:run` in `aram-backend`.
   - Frontend: Run `npm run preview:host` or `npm run dev:host` in the project root.
3. **Connect Mobile Device:**
   - Verify phone and laptop are on the **same Wi-Fi**.
   - Open Android Chrome and navigate to: `http://<LAPTOP_IP>:4173` (or `:5173` if running dev:host).

---

## 📦 3. PWA Installation Steps

The ARAM platform is fully configured as an installable Progressive Web App (PWA).
1. **Trigger Install:**
   - In Chrome, look for the **Install Icon** in the URL address bar or select the **Install ARAM App** button on the landing page footer.
   - On Android Chrome, tap the three dots menu and select **"Add to Home screen"**.
2. **Standalone Mode:**
   - Once installed, ARAM launches in a dedicated window without standard browser navigation bars, behaving like a native application.

---

## 🌐 4. Offline Limitations & Caching
* **Offline Page:** When network connections are unavailable, the Service Worker (`sw.js`) intercepts failures to serve the standalone `public/offline.html` page.
* **Cached States:** Service Worker asset caching is **disabled in development** to ensure updates are served immediately, and is only enabled when running in production (`import.meta.env.PROD`).
* **Manual Cache Clearing:** If updates are not reflecting on device viewports, open Chrome DevTools → **Application** → **Service Workers** → click **Unregister**; then go to **Storage** and click **Clear site data**.

---

## ⚙️ 5. Mock Mode vs Real Backend Mode
The frontend supports a stateful Mock mode for previewing features without running database connections:
* **Configuration:** Toggled inside the `.env` file via `VITE_USE_MOCKS`.
* **Mock Mode (`VITE_USE_MOCKS=true`):** Saves user cases and updates in the browser's `localStorage`. Ideal for presentation mockups.
* **Real Backend Mode (`VITE_USE_MOCKS=false`):** Communicates with the Spring Boot REST API. Requires the backend and H2/MySQL databases to be running.
