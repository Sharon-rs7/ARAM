# ARAM Frontend + Backend Connection Fix

## Main issue fixed
Frontend was static. Login/Register/Complaint pages were using React Router links only and did not call backend APIs.

## Run backend
```bash
cd aram-backend
./mvnw spring-boot:run
```

Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```
Backend: http://localhost:8080
Swagger: http://localhost:8080/swagger-ui.html

Default admin:
- email: admin@aram.ai
- password: Admin@123

## Run frontend
From the root `aram` folder, not `aram/aid`:

```bash
cd aram
rmdir /s /q node_modules
npm install
npm run dev
```

Create `.env` in root if needed:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Frontend: http://localhost:5173

## Correct frontend folder
Use root folder: `aram/`
Do not use: `aram/aid/` because that is a separate default Vite project.

## API connection files added
- src/services/api.js
- src/utils/mappers.js

## Pages connected
- Login
- Register
- Submit Complaint
- AI Result
- My Complaints
- Complaint Details
- Track Complaint
- Admin Dashboard
- Complaint Management
- User Management
