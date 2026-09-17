# ARAM AI — FINAL USER JOURNEY & FLOW DOCUMENTATION

## 1. End-to-End User Journey

```
  1. CITIZEN INPUT
     Citizen submits issue via Voice (Tamil/English/Hindi), Typed Text, or Uploaded Scans.
       │
       ▼
  2. MULTILINGUAL & MULTIMODAL INTAKE
     Faster-Whisper transcribes audio; EasyOCR extracts document text with PII masking.
       │
       ▼
  3. AI TRIAGE & GROUNDED RAG
     Classifier detects legal category; RAG engine pulls verified statutory provisions;
     Gemini 3.6 Flash / Grounded engine formats plain-language localized guidance.
       │
       ▼
  4. GRIEVANCE PERSISTENCE & DISTRICT ROUTING
     Citizen reviews advice & confirms complaint filing. System saves record in MySQL
     and routes to the appropriate Regional Admin based on location (e.g. Coimbatore).
       │
       ▼
  5. REGIONAL ADMIN REVIEW & GUIDE MATCHING
     Admin inspects AI triage, category, and priority. Elo matcher ranks qualified guides
     (checking District, Language, Specialization, Workload, and Female Guide policy).
       │
       ▼
  6. LEGAL GUIDE ASSIGNMENT & COLLABORATION
     Guide receives notification, accepts case, interacts via Secure Chat/WebRTC Call,
     requests supporting documents, and updates action plan.
       │
       ▼
  7. RESOLUTION & AUDIT
     Guide completes quality resolution checklist. Citizen receives resolution summary
     and full statutory audit history.
```
