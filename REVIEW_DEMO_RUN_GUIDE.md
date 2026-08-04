# ARAM Review Demo Run Guide

This guide describes how to start the ARAM system, verify all services, and test the major features in a local environment.

---

## 1. Startup Services

Ensure you launch the services in order:

### A. Start MySQL Database
Ensure your MySQL service is running locally on port 3306 with the schema `aram` configured.

### B. Start Spring Boot Backend
```powershell
cd "aram-backend"
.\mvnw.cmd spring-boot:run
```
* **Endpoint:** `http://localhost:8080`

### C. Start FastAPI AI Service
Ensure the Python virtual environment is activated and start Uvicorn:
```powershell
cd "ai-service"
venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
* **Endpoint:** `http://localhost:8000`

### D. Start Vite React Frontend
```powershell
npm run dev
```
* **URL:** `http://localhost:5173`


---

## 2. Testing Key Features

### A. Pure ML Language Detection & Grievance Triage
1. Navigate to the **Submit Complaint** page as a citizen.
2. Enter one of the multilingual test complaints (e.g. Tamil: `"என் சம்பளம் இரண்டு மாதமாக தரவில்லை"` or Tanglish: `"enaku salary tharala"`).
3. Confirm the AI analyzes the text, identifies the correct language (e.g., `ta` or `ta-en`), category (`LABOUR_DISPUTE`), and recommended authority type.
4. If models are stopped or fail, verify that `fallbackUsed` is flagged as `true`, predictions are set to `null`, and the case is safely routed to Admin for manual review.

### B. Map Location & Cost Estimates
1. Submit a complaint.
2. Verify that ARAM matches the district (e.g. Coimbatore) and shows the nearest authority office location card with:
   - Dynamic Haversine distance.
   - Address and operating hours.
   - Clickable Google Maps directions links.
3. Verify the estimated travel and document fee card (e.g., ₹0 - ₹300 for Labour cases) with legal disclaimers.
4. Log in as a Volunteer/Legal Guide, open the **Case Review Panel** for the complaint, and verify you can override both the recommended office and the min/max cost range bounds.

### C. Multilingual Voice submission
1. Open the Submit Complaint page on a mobile-sized viewport or device.
2. Tap the **Speak Complaint** card.
3. Record your grievance verbally and check that faster-whisper transcribes it correctly, showing the estimated ASR confidence before final submission.
