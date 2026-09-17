# ARAM AI — Troubleshooting & Incident Recovery Guide

---

## 1. Common Diagnostics & Solutions

### A. Backend Boot: Redis Connection Failure
- **Symptom**: `io.lettuce.core.RedisConnectionException: Unable to connect to localhost:6379`.
- **Solution**: Start the standalone TCP Redis runner via:
  ```powershell
  cd ai-service
  .\venv\Scripts\python.exe run_redis_server.py
  ```

### B. Regional Admin Dashboard: 403 Forbidden
- **Symptom**: Admin receives 403 when querying `/api/regional-admin/dashboard?district=Coimbatore`.
- **Cause**: The authenticated admin's assigned district does not match the requested district.
- **Solution**: Authenticate with the correct regional admin account (e.g. `coimbatore.admin@gmail.com` for Coimbatore).

### C. Voice Synthesis: Inaudible / Broken Audio
- **Symptom**: Native speech synthesis fails on mobile browsers.
- **Solution**: The frontend automatically detects Web Speech API support and falls back to text-based localized guidance cards.
