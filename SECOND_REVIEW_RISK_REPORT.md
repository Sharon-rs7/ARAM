# Second Review Risk Report

This report identifies presentation risks and lists answers to expected review panel questions.

## 1. Demo Safety Zones

### A. Safe to Demo
- **Public User:** Login, complaint submission (text/voice), details, and tracking timeline.
- **Admin:** Tabbed detail views, recommended guide matching scores, and guide assignment.
- **Legal Guide:** Active case list, document request buttons, adding notes, and case status updates.
- **Secure Chat:** Messages exchange between assigned citizens and guides.

### B. Demo Carefully
- **Voice Assistive Triage:** Speak clearly to ensure high confidence speech-to-text.
- **Override Logs:** Test override controls by assigning a male helper to a sensitive case.

### C. Do Not Claim
- **Real SMS Gateway / WhatsApp APIs:** Toggles exist but API connection is simulated.

---

## 2. Review Panel Q&A

### Q1: How does the AI recommend a Legal Guide?
- **A:** The system calculates a matching score based on language matching, category specialty, availability status, active workload count, and women-sensitive certification.

### Q2: How are Public Users and Legal Guides linked?
- **A:** Administrators verify recommendations and finalize the assignment, which creates a private `CaseChatThread` and logs an audit trail.

### Q3: Is database data real or mocked?
- **A:** When `VITE_USE_MOCKS=false` is set, all actions query the real MySQL database directly.

### Q4: How is a women-sensitive case protected?
- **A:** By enforcing a female helper requirement, mask visibility shields (e.g. `Protected Identity`), and hiding contact phone/email details by default.
