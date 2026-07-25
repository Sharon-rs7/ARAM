cd /d "E:\prgt\New folder\aram\ai-service"
call venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
