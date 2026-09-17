# ARAM AI — Testing & Verification Guide

---

## 1. Automated Test Execution

### 1. Multi-Role REST Integration Suite
```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\Sharon\.gemini\antigravity\brain\df2c1ee5-098b-4d5d-8273-4efe2c8f7ce5\scratch\test_rest_integration.ps1
```
*Validates*:
- Super Admin login (`admin@gmail.com`) & statewide registries.
- Regional Admin login (`chennai.admin@gmail.com`) & district-scoped dashboard.
- Guide login (`volunteer@gmail.com`) & assigned cases.
- Citizen login (`citizen@gmail.com`) & complaint filing.

### 2. AI Inference & RAG Verification Suite
```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\Sharon\.gemini\antigravity\brain\df2c1ee5-098b-4d5d-8273-4efe2c8f7ce5\scratch\test_ai_service.ps1
```
*Validates*:
- AI Service health & model readiness.
- ONNX multi-class legal categorization & priority estimation.
- Grounded RAG statutory guidance generation.

### 3. Frontend Production Build
```cmd
cmd.exe /c "npm run build"
```
*Validates*:
- Production compilation of 88 modules in **11.50s** with zero errors.
