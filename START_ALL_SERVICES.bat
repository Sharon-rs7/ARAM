@echo off
echo ===================================================
echo   ARAM - Starting All Microservices and Frontend
echo ===================================================

echo [1/4] Starting AI Triage Service (Port 8000)...
start "ARAM AI Service (Port 8000)" cmd /k "cd /d "%~dp0\ai-service" && venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo [2/4] Starting Auth Microservice (Port 8081)...
start "ARAM Auth Service (Port 8081)" cmd /k "cd /d "%~dp0\auth-service" && mvnw.cmd spring-boot:run -Dmaven.test.skip=true"

echo [3/4] Starting Legal Aid Microservice (Port 8082)...
start "ARAM Legal Aid Service (Port 8082)" cmd /k "cd /d "%~dp0\aram-backend" && mvnw.cmd spring-boot:run -Dmaven.test.skip=true -Dspring.profiles.active=mysql"

echo [4/4] Starting React Frontend Web App (Port 5173)...
start "ARAM Frontend (Port 5173)" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo All services launched in separate windows!
echo Open http://localhost:5173 in your browser.
echo ===================================================
pause
