@echo off
TITLE ARAM AI Service (FastAPI)
echo ========================================================
echo Starting ARAM AI Microservice on Port 8000...
echo ========================================================
cd /d E:\OurAram\My-aram-app\ai-service
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
pause
