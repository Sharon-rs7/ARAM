# ARAM Local Mobile Testing & Run Guide

This guide explains how to connect your Android phone or any mobile device to the ARAM server running on your laptop.

---

## 🛠️ Step 1: Start Host Servers on Laptop

1. **Find Laptop IP:**
   - Open Command Prompt and type `ipconfig`.
   - Find your **IPv4 Address** under your active Wi-Fi connection (e.g., `192.168.1.10`).

2. **Start Frontend Dev Server with Host Flag:**
   - Double-click **`START_FRONTEND_MOBILE_HOST.bat`** (or run `npm run dev -- --host 0.0.0.0`).
   - This starts the Vite dev server listening on all network interfaces.

3. **Start Backend Server:**
   - Double-click **`START_BACKEND_LOCAL.bat`** (or run `mvn spring-boot:run` in `aram-backend`).

---

## 📱 Step 2: Configure Environment Variables

1. Copy `.env.mobile.example` to `.env` (overwrite it temporarily during LAN testing).
2. Set the `VITE_API_BASE_URL` variable to use your laptop IP:
   ```env
   VITE_API_BASE_URL=http://192.168.1.10:8080/api
   VITE_USE_MOCKS=false
   ```
3. Restart the frontend server.

---

## 🔗 Step 3: Access from Android Phone

1. Connect your phone and laptop to the **same Wi-Fi network**.
2. Open Chrome on your phone.
3. Navigate to:
   ```text
   http://YOUR_LAPTOP_IP:5173
   ```
   *(Example: `http://192.168.1.10:5173`)*

---

## 🚨 Troubleshooting
- **Firewall Block:** If the page doesn't load on your phone, you may need to allow ports `5173` and `8080` through the Windows Defender Firewall.
- **CORS Errors:** Wildcard patterns `http://192.168.*:*` are allowed in `CorsConfig.java`. Ensure your IP falls within standard local subnets.
