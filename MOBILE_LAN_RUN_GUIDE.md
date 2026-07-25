# ARAM Mobile & Laptop LAN Run Guide

This guide explains how to run ARAM on both your laptop and mobile device concurrently over the same Wi-Fi network.

## Prerequisite Checklist
1. **Same Wi-Fi Network**: Ensure your laptop and mobile device are connected to the exact same Wi-Fi router/hotspot.
2. **Mobile Data Off**: Disable mobile cellular data on your phone to force routing over Wi-Fi.
3. **VPN Off**: Turn off any VPN services on both laptop and mobile.
4. **Windows Firewall**: If prompted by Windows, make sure to click **Allow Access** for OpenJDK/Java and Node.js.

---

## Step-by-Step Setup

### Step 1: Find Laptop IPv4 Address
1. Open Command Prompt or PowerShell on your laptop.
2. Run the command:
   ```cmd
   ipconfig
   ```
3. Look for the active network adapter (typically `Wireless LAN adapter Wi-Fi`).
4. Copy the **IPv4 Address** (e.g. `10.61.14.171` or `192.168.1.X`).

### Step 2: Configure Environment `.env`
1. Open the project root `.env` file (`E:\prgt\New folder\aram\.env`).
2. Set the configuration using your laptop's IPv4 address:
   ```env
   VITE_API_BASE_URL=http://<YOUR_LAPTOP_IP>:8080/api
   VITE_USE_MOCKS=false
   ```
   *(Example: `VITE_API_BASE_URL=http://10.61.14.171:8080/api`)*
3. **Important**: Restart the frontend server if it was already running after saving `.env`.

### Step 3: Run the Services using LAN Scripts
We have created three dedicated Windows batch scripts in the project root:

1. **Start Backend (MySQL Profile)**:
   Double-click `START_BACKEND_MYSQL_LAN.bat` to launch Spring Boot. It will listen on `0.0.0.0:8080` (all network interfaces).
2. **Start Python AI Service**:
   Double-click `START_AI_LAN.bat` to launch uvicorn with `--host 0.0.0.0`. It will listen on `0.0.0.0:8000`.
3. **Start Frontend (Vite Host Mode)**:
   Double-click `START_FRONTEND_LAN.bat` to launch Vite with `--host 0.0.0.0`. It will listen on port `5173`.

---

## Access URLs

Open these links on both your **laptop** and your **mobile phone**:

* **Web Application Portal**:
  `http://<YOUR_LAPTOP_IP>:5173`
  *(Example: `http://10.61.14.171:5173`)*
  
* **Backend API Health Check**:
  `http://<YOUR_LAPTOP_IP>:8080/api/health`
  *(Example: `http://10.61.14.171:8080/api/health`)*
  
* **FastAPI AI Service Health Check**:
  `http://<YOUR_LAPTOP_IP>:8000/health`
  *(Example: `http://10.61.14.171:8000/health`)*

---

## Troubleshooting
* **Mobile cannot load page**: Double check if Wi-Fi network matches and mobile data/VPN are turned off. Try pinging your laptop's IP from your mobile terminal.
* **Backend loads on laptop but not mobile**: Windows Firewall is blocking Spring Boot (Java). Add an inbound rule in Windows Defender Firewall allowing port `8080`.
* **Login fails or shows blank screen**: Make sure `.env` contains the correct laptop Wi-Fi IP and is not still pointing to `localhost`. Restart the frontend runner after updating `.env`.
* **IP Address changed**: When you reconnect to Wi-Fi, your router might assign a new IP address. Run `ipconfig` again and update `.env` accordingly.
