# ARAM Mobile Grievance UX Reference & Alignment Notes

These notes outline how the ARAM mobile grievance experience aligns with civic standards (inspired by the Perambur constituency "Jana Sevana Vedhi" app and the Namma Chennai grievance platform), while maintaining ARAM's unique core identity as a secure AI-powered Legal Aid Triage system.

---

## 1. Perambur Constituency Grievance App Inspiration Points
The Perambur "Jana Sevana Vedhi" mobile app sets high benchmarks for civic grievance management:
- **Simple, Direct Triage:** Easy input fields, photo/document proofs, and instant grievance status timelines.
- **Strict SLA Targets:** A 72-hour timeline for responses.
- **Unique Registration ID:** Clean references for citizen tracking.
- **WhatsApp Grievance Support:** Easy sharing and status queries via WhatsApp.

---

## 2. What ARAM Adopted
We adapted several key UX patterns to make ARAM feel familiar and professional for citizens on mobile viewports:
1. **Sleek Mobile Bottom Navigation:** Added native bottom tabs (`Home`, `Submit`, `Track`, `AI Help`, `Profile`) on screen widths `< md` for Citizen and Volunteer portals.
2. **Mobile Quick Action Grid:** Redesigned the citizen homepage on mobile to render a dashboard grid of 6 quick tappable cards.
3. **Public Status Tracking Screen (`/track-complaint`):** Added a public-facing page where a user can input their ARAM complaint ID and mobile number to see progress without logging in.
4. **SLA Deadlines:** Integrated expected SLA response targets in forms and details views:
   - **LOW:** 7 Days SLA (Standard Guidance)
   - **MEDIUM:** 72 Hours SLA (Priority Review)
   - **HIGH:** 24 Hours SLA (Urgent Triage)
   - **CRITICAL:** Immediate Admin Triage (Recommended for Women-sensitive cases)
5. **Unique Reference Format:** Displayed IDs in the standard `ARAM-2026-{id}` format in frontend displays.
6. **WhatsApp Sharing Link:** Integrated a simulated WhatsApp sharing option to copy status references and open pre-filled chats.

---

## 3. What ARAM Does Differently
Unlike standard civic apps that handle municipal complaints, ARAM is built for **Legal Aid Triage**:
- **Secure OCR Evidence Scanner:** Automatically runs AI masking on document uploads to redact sensitive PII before volunteers review the case.
- **Trained Volunteer Assignment:** Admin panel features robust filtering of helpers, including specialized filters for women-support certified volunteers.
- **Sensitive Case Shielding:** Offers options like female volunteer preferences and invisible/partial profiles.

---

## 4. Mobile UI Responsiveness Checklist
- [x] No horizontal scrolling on screen widths (360px, 390px, 430px, tablet).
- [x] Tappable cards and full-width buttons on mobile layout.
- [x] Correct positioning of textareas and voice dictation icons (no overlaps).
- [x] Sleek bottom navigation bar visible only on mobile viewports.

---

## 5. Pending Limitations & Future Scope
- **Real WhatsApp API integration:** Currently using simulated browser share link generators (`https://wa.me/?text=...`).
- **Live Video Upload Triage:** Backend currently optimized for PDF, JPG, and PNG uploads. Large video uploads are marked as "Video upload support pending".
