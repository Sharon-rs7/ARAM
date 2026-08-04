# ARAM Today's Changes TODO List

This file tracks the implementation status, risk levels, and review importance of the features discussed today for the ARAM Legal Aid platform.

---

## 1. P0 Checklist — Must for Second Review

| Task Name | Priority | Status | Risks | Review Importance | Implemented Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Remove Fake AI Landing Card** | `HIGH` | **DONE** | `LOW` | `HIGH` | Replaced the fake static hero card in [Hero.jsx](file:///E:/prgt/New%20folder/aram/src/components/sections/Hero.jsx) with a dynamic "AI Legal Assistant" card and a multi-step "Grievance Journey Timeline". |
| **2. Low-Literacy Mobile UX** | `HIGH` | **DONE** | `LOW` | `HIGH` | Configured big tap-to-act buttons on mobile layouts in [Dashboard.jsx](file:///E:/prgt/New%20folder/aram/src/pages/Citizen/Dashboard.jsx) and integrated a bottom sticky navigation bar inside [DashboardLayout.jsx](file:///E:/prgt/New%20folder/aram/src/components/layout/DashboardLayout.jsx). |
| **3. Next Action Plan** | `HIGH` | **DONE** | `MEDIUM` | `HIGH` | Created backend entities, seeder records, and REST API controllers for case action plans. Integrated citizen details rendering and Legal Guide sharing flows. |
| **4. Authority Location & Map** | `HIGH` | **DONE** | `LOW` | `HIGH` | Calculated nearest offices using Haversine distance, sorted by district, and embedded direct Google Maps directions links. Excluded exact citizen GPS sharing to preserve privacy. |
| **5. Pure ML (No Rule-based AI)** | `HIGH` | **DONE** | `HIGH` | `HIGH` | Replaced keyword patterns with trained character n-grams TF-IDF + Logistic Regression language classifiers. Verified that model failure flags `fallbackUsed=true` and `manualReviewRequired=true`. |
| **6. OCR Document Verification** | `HIGH` | **DONE** | `MEDIUM` | `HIGH` | Implemented EasyOCR processing pipeline, quality grading, and regex field matches. Restricted raw text storage to database fields only (no localStorage). |
| **7. Multilingual Voice & Speech** | `HIGH` | **DONE** | `MEDIUM` | `HIGH` | Integrated browser-based Web Speech API input, FastAPI `/speech/transcribe` Whisper pipeline, and SpeechSynthesis read-aloud buttons mapped by locale. |
| **8. Storage & Security Audits** | `HIGH` | **DONE** | `MEDIUM` | `HIGH` | Sanitized local caches, banned grievance text or credentials caching in localStorage, and added service worker exclude paths for APIs. |
| **9. Compilation & CSS Checks** | `HIGH` | **DONE** | `LOW` | `HIGH` | Validated that Python files compile, Spring Boot runs a successful build, and Vite builds without errors. |

---

## 2. P1 Checklist — Strong Demo Improvements

| Task Name | Priority | Status | Risks | Review Importance | Implemented Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **10. Cost Estimate Range** | `MEDIUM-HIGH` | **DONE** | `LOW` | `HIGH` | Displays approximate print/photocopy/filing ranges with Legal Aid availability indicators and legal disclaimers. Guides can override these in the review panel. |
| **11. Document Request Tracker** | `MEDIUM-HIGH` | **DONE** | `LOW` | `HIGH` | Tracks requested evidence status (Requested, Uploaded, Verified, Rejected) with reupload alerts. |
| **12. Emergency/Safety Flow** | `MEDIUM-HIGH` | **DONE** | `LOW` | `HIGH` | Added safety guidelines, red banner warnings for non-emergency guidance, and privacy shields for women-sensitive cases. |
| **13. Case Closure & Feedback** | `MEDIUM-HIGH` | **DONE** | `LOW` | `HIGH` | Implemented case resolution summary inputs for Guides, rating scales, feedback comments, and case reopen mechanisms. |
| **14. Call/Appointment Scheduler** | `MEDIUM-HIGH` | **DONE** | `LOW` | `HIGH` | Secure call request form that logs safe callback hours and preferred communication methods without direct number exposure. |

---

## 3. P2 Checklist — Future Roadmap

| Task Name | Priority | Status | Risks | Review Importance | Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **15. Capacitor App Packaging** | `MEDIUM` | **DONE** | `LOW` | `MEDIUM` | Successfully compiled Vite production bundle and synced assets to native Android project (`android/app/src/main/assets/public`) via Capacitor CLI. |
| **16. SMS/WhatsApp Gateway** | `LOW` | **TODO** | `LOW` | `LOW` | Connect Twilio or local GSM modem triggers to send automatic SMS updates for status changes. |
| **17. WebSockets Real-time Chat** | `LOW` | **TODO** | `MEDIUM` | `MEDIUM` | Move chat polling to persistent STOMP/WebSocket connections. |
| **18. Local Ollama Chatbot** | `LOW` | **TODO** | `HIGH` | `MEDIUM` | Hook up local Llama-3 instances via Ollama backend API once local hardware permits. |
| **19. Cloud Deployment & KMS** | `LOW` | **TODO** | `HIGH` | `MEDIUM` | Deploy Spring Boot backend, MySQL, and FastAPI using docker-compose and encrypt credentials with AWS KMS. |
| **20. Offline Case Sync** | `LOW` | **TODO** | `MEDIUM` | `MEDIUM` | Cache active user complaints in IndexedDB and sync changes when network becomes available. |
