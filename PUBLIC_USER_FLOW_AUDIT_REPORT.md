# Public User Flow Audit Report

This report evaluates the execution state of the citizen/public user path from landing to resolution.

## Public User Flow Status

| Step | State | Details / File Path |
| :--- | :--- | :--- |
| **1. Landing Page** | **WORKING** | Quick routes to submit/track. |
| **2. Login & Register** | **WORKING** | Authenticates against backend. |
| **3. Dashboard** | **WORKING** | Displays status updates and alerts. |
| **4. Submit Complaint** | **WORKING** | Persistent in MySQL (`SubmitComplaint.jsx`). |
| **5. Voice Triage** | **WORKING** | Speech-to-text transcription (`voiceCommands.js`). |
| **6. Select Category** | **WORKING** | Dropdowns map to enums (`SubmitComplaint.jsx`). |
| **7. Description Input** | **WORKING** | Accepts up to 500 characters. |
| **8. Sensitive Toggle** | **WORKING** | Saves sensitive flag in backend. |
| **9. Prefer Woman Helper** | **WORKING** | Saves helper preference. |
| **10. Visibility Selection** | **WORKING** | VISIBLE / PARTIAL / HIDDEN flags. |
| **11. Document Upload** | **WORKING** | Handled by `DocumentController.java`. |
| **12. Complaint ID Display** | **WORKING** | Formats ID as `ARAM-2026-00000X`. |
| **13. AI Analysis** | **WORKING** | Shows required documents and next steps. |
| **14. Track Status** | **WORKING** | Displays chronological case timeline. |
| **15. Assigned Helper** | **WORKING** | Displays name on timeline when assigned. |
| **16. Secure Chat Room** | **WORKING** | messaging console (`CaseChatPanel.jsx`). |
| **17. Notifications** | **WORKING** | Alerts citizen when a helper is assigned. |
| **18. Settings Center** | **WORKING** | Access controls (`SettingsCenter.jsx`). |

---

## Technical Audit Verdict
- **End-to-End Status:** **WORKING**. The citizen path functions correctly, with database persistence and AI-driven triage advice.
