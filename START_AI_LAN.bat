@echo off
title ARAM AI Service
cd /d "%~dp0\ai-service"
call venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause

