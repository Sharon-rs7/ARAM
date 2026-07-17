# ARAM Compare & Merge Audit Report

This document compares your **OLD ARAM project** (Active Base) with your **friend's reference project** (Donor) to identify UI/UX enhancements and outline a safe merge strategy.

---

## 1. Project Pages Mapping

| Page Category | Active Project (`E:\prgt\New folder\aram\src`) | Teammate Reference (`E:\prgt\Full stack\aram-app\src`) |
| :--- | :--- | :--- |
| **Landing Page** | `pages/LandingPage.jsx` | `pages/Landing/LandingPage.jsx` |
| **Login / Register** | `pages/Login.jsx`, `pages/Register.jsx` | `pages/Auth/Login.jsx`, `pages/Auth/Register.jsx` |
| **Citizen Dashboard**| `pages/CitizenDashboard.jsx` | `pages/Citizen/Dashboard.jsx` |
| **Submit Complaint** | `pages/SubmitComplaint.jsx` | `pages/Citizen/SubmitComplaint.jsx` |
| **My Complaints** | `pages/MyComplaints.jsx` | `pages/Citizen/ComplaintHistory.jsx` |
| **Complaint Details**| `pages/ComplaintDetails.jsx` | `pages/Citizen/ComplaintDetails.jsx` |
| **Chatbot** | `pages/citizen/AiChat.jsx` | `pages/Citizen/Chatbot.jsx` |
| **Notifications** | `pages/Notifications.jsx` | `pages/Citizen/Notifications.jsx` |
| **Settings** | `components/SettingsCenter.jsx` | `pages/Citizen/Settings.jsx` |
| **Helper Dashboard** | `pages/HelperDashboard.jsx` | `pages/Volunteer/Dashboard.jsx` |
| **Admin Dashboard** | `pages/AdminDashboard.jsx` | `pages/Admin/Dashboard.jsx` |

---

## 2. Features Missing or Weaker in Old Project

1. **Submit Complaint Custom Inputs:**
   - Targets Department selector (`Labour Department`, `Police Commission Cell`, etc.) is currently auto-routed by AI in the old project, whereas the donor project allows optional user selection.
   - Urgency / Priority dropdown selector is missing.
2. **Voice Dictation Section:**
   - The donor project has a visual "Dictate Grievance" microphone block that simulates recording Speech in Tamil/English and updates description fields automatically.
3. **Evidence Scanning Results (OCR):**
   - The donor project contains a mock OCR Scanner results panel showing detected document type and integrity score.
4. **Chatbot Enhancements:**
   - Suggested prompts/quick-bubbles are missing in the old chatbot interface.

---

## 3. Component Comparison Summary

### A. Worth Copying / Adapting:
- **Voice Recording Block:** Mic toggle simulation for transcription.
- **OCR scanner results panel:** emerald-colored alert showing mock document scan scores.
- **Urgency selectors:** specific priorities lists.
- **Suggested bubbles:** quick-chat prompts for chatbot.

### B. Ignore from Friend Project:
- **Tailwind UI Component Atoms:** `src/components/ui/*`, `src/lib/utils.js` (would clash with custom ARAM styling).
- **Core Authentication Layouts:** Friend uses custom `AuthLayout` that breaks standard ARAM logins.

---

## 4. Proposed Recovery & Merge Actions

### A. Files to Modify:
* **[SubmitComplaint.jsx](file:///E:/prgt/New%20folder/aram/src/pages/SubmitComplaint.jsx):**
  - Integrate Priority and Department dropdowns.
  - Add "Dictate Grievance" simulation card block.
  - Add ARAM Document Scanner (OCR) results alert.
* **[AiChat.jsx](file:///E:/prgt/New%20folder/aram/src/pages/citizen/AiChat.jsx):**
  - Add quick suggestions bubbles (e.g., "Check status of salary dispute", "How to report cyber fraud?").

### B. Files to Create:
- **[COMPARE_MERGE_REPORT.md](file:///E:/prgt/New%20folder/aram/COMPARE_MERGE_REPORT.md)** (this document).

### C. Files to Ignore:
- `E:\prgt\Full stack\aram-app\tailwind.config.js`
- `E:\prgt\Full stack\aram-app\components.json`
- `E:\prgt\Full stack\aram-app\src\components\ui\*`

---

## 5. Final Merge Checklist
- [x] Create COMPARE_MERGE_REPORT.md
- [ ] Merge Priority/Department drop-downs to SubmitComplaint.jsx
- [ ] Add Voice dictation mic simulation box
- [ ] Add mock Document OCR scanner details card
- [ ] Add chatbot quick suggestions bubbles
- [ ] Run `npm run build` to verify compilation
