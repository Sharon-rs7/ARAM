# Review Demo Run Guide

This guide provides instructions to run the ARAM application stack locally for faculty presentations and project reviews.

## Service Commands

### 1. Spring Boot Backend Stack
Runs on port `8080` (requires MySQL running locally).
```powershell
cd "E:\prgt\New folder\aram\aram-backend"
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
```

### 2. React Vite Frontend Stack
Runs on port `5173`.
```powershell
cd "E:\prgt\New folder\aram"
npm run dev
```

### 3. FastAPI Python AI Stack
Runs on port `8000`.
```powershell
cd "E:\prgt\New folder\aram\ai-service"
.\venv\Scripts\activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

---

## Demo Review Checklist

1. **Login as Public User:** Use credentials `citizen@aram.ai` / `Citizen@123`.
2. **Submit a Complaint:** Open the submission form, write or narrate a grievance, choose visibility details, and click submit.
3. **Login as Administrator:** Use credentials `admin@aram.ai` / `Admin@123`.
4. **Assign Legal Guide:** Go to the complaints queue, click the complaint, select "Legal Guide Recommendation", review the match parameters, and click "Assign".
5. **Demonstrate Chat & Mediation:**
   - Log back in as Citizen, open the complaint chat, and send a message.
   - Log in as the assigned Guide (`volunteer@aram.ai` / `Helper@123`), view assigned cases, open the case, verify details, reply to chat, request evidence documents, and finalize status values.
