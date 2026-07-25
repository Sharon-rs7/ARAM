# Final Run Guide

This guide provides steps for running and testing the ARAM platform.

## 1. Laptop Execution (Local Host)

### Step 1: Start MySQL
- Ensure your local MySQL server is running and the database `aram_db` exists.

### Step 2: Start Spring Boot Server
```bash
cd "E:\prgt\New folder\aram\aram-backend"
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
```

### Step 3: Start AI Service
```bash
cd "E:\prgt\New folder\aram\ai-service"
# Activate your virtual environment
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 4: Start Frontend
```bash
cd "E:\prgt\New folder\aram"
npm run dev -- --host 0.0.0.0
```

---

## 2. Mobile / LAN Testing (Same Wi-Fi)

1. Find your laptop's local IP address (e.g. `192.168.1.45`) using `ipconfig`.
2. Update the frontend environment file `.env`:
   ```text
   VITE_API_BASE_URL=http://YOUR_LAPTOP_IP:8080/api
   VITE_USE_MOCKS=false
   ```
3. Open the app on your mobile browser:
   `http://YOUR_LAPTOP_IP:5173`

---

## 3. Demo Credentials

- **Admin Workspace:** `admin@aram.ai` / `Admin@123`
- **Public User Workspace:** `citizen@aram.ai` / `Citizen@123`
- **Legal Guide Workspace:** `volunteer@aram.ai` / `Helper@123`
