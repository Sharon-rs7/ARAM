@echo off
TITLE ARAM Platform Launcher
echo ========================================================
echo       ARAM Legal Aid Platform - Multi-Server Starter
echo ========================================================
echo.
echo [1/3] Launching FastAPI AI Microservice (Port 8000)...
start "ARAM 1 - AI Microservice (:8000)" cmd /k "cd /d E:\OurAram\My-aram-app\ai-service && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo [2/3] Launching Spring Boot Core Backend (Port 8082)...
start "ARAM 2 - Spring Boot Backend (:8082)" cmd /k "cd /d E:\OurAram\My-aram-app\aram-backend && mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql"

echo [3/3] Launching React Vite Frontend (Port 5173)...
start "ARAM 3 - Vite React Frontend (:5173)" cmd /k "cd /d E:\OurAram\My-aram-app && npm run dev -- --host 0.0.0.0"

echo.
echo ========================================================
echo All 3 server consoles have been launched in separate windows!
echo - AI Service:     http://localhost:8000/docs
echo - Spring Backend: http://localhost:8082/swagger-ui.html
echo - Web Frontend:   http://localhost:5173
echo ========================================================
pause
