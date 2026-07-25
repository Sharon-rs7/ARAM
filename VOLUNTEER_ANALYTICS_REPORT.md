# Legal Guide Analytics Page - LeetCode Style Professional Dashboard

This report details the implementation of the ARAM Individual Legal Guide Analytics dashboard and associated backend APIs.

## 1. Design & Concept Inspiration
We adapted the visual framework of LeetCode's personal profile card and solved problems grid to create an analytical dashboard for ARAM's legal aid Legal Guides:

- **LeetCode profile card** &rarr; **Legal Guide profile card**: Avatar, role, service area, availability, specializations, and languages.
- **Solved progress ring** &rarr; **Cases resolved progress ring**: Circular dashboard showing resolved cases vs assigned cases.
- **Easy/Medium/Hard** &rarr; **Standard Guidance / Priority Review / Urgent Intervention**: Visual breakdown of workload by case severity.
- **Contribution heatmap** &rarr; **Daily activity heatmap**: An interactive matrix representing actions (page views, notes, updates) in the past 140 days.
- **Badges** &rarr; **Skill & Achievement Badges**: Verified Helper, Women Support Trained, Fast Responder, etc.
- **Submissions** &rarr; **Recent Case Actions**: Chronological logging of case assignments, status changes, and recommendations.

---

## 2. Implemented Routes
### Admin Route
- **GET page**: `/admin/volunteers/:id/analytics`
- **Frontend page**: [VolunteerAnalytics.jsx](file:///E:/prgt/New%20folder/aram/src/pages/Admin/VolunteerAnalytics.jsx)
- **Manage Legal Guides Link**: Clicking "Analytics" on any legal guide row navigates to this dashboard.
- **Legal Guide Activity Link**: Clicking a legal guide's name on the Activity Overview page navigates to their analytics dashboard.

### Legal Guide Self Route
- **GET page**: `/volunteer/my-analytics`
- **Frontend page**: [MyAnalytics.jsx](file:///E:/prgt/New%20folder/aram/src/pages/Volunteer/MyAnalytics.jsx)
- **Dashboard Button**: "View My Analytics" button is placed in the welcome dashboard card.
- **Sidebar Integration**: Added "Analytics" item with a chart icon in the legal guide sidebar menu.

---

## 3. Backend APIs
### GET `/api/admin/volunteers/{id}/analytics`
- **Role required**: `ADMIN`
- **Response**: Aggregated profile details, case summary stats, priority counts, language stats, category lists, weekly trend metrics, activity heatmap dates, recent case actions, and achievement badges.

### GET `/api/volunteer/my-analytics`
- **Role required**: `HELPER`
- **Response**: Same format as above, automatically fetched for the authenticated helper session.

---

## 4. Privacy & Masking Rules
To protect citizen confidentiality:
- Citizen names in the recent activity actions are dynamically masked (e.g. `Sharon Mary` becomes `S*** M***`).
- If `IdentityVisibility` is set to `HIDDEN`, the name is shown as `Protected Identity`.
- If `IdentityVisibility` is set to `PARTIAL`, the name is shown as `Citizen from {district}`.
- Phone numbers, email addresses, and detailed description texts are excluded from the analytics logs.

---

## 5. Development Seed Data
Sharon Mary (`volunteer@aram.ai` / `Helper@123`) is pre-seeded with:
- **8 assigned complaints**: Covers Labour Dispute, Consumer Complaint, Women Safety, Property Civil Dispute, and Cyber Crime categories.
- **2 women-sensitive complaints** with partial/hidden visibility.
- **30 days of randomized activity logs** (page views, note additions, status changes) to populate the contribution heatmap.

---

## 6. User-Facing Role Labels
User-facing role labels in the UI have been updated:
- **Public User** (internally `CITIZEN` / `Citizen`)
- **Legal Guide** (internally `HELPER` / `VOLUNTEER` / `Volunteer`)
- **Admin** (internally `ADMIN` / `Admin`)

> [!NOTE]
> Internal backend enums, database role values, JWT keys, and API/routing paths remain unchanged (`/citizen`, `/volunteer`, `/admin`) for stability.
