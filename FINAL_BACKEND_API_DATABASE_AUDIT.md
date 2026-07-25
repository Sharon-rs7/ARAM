# Final Backend API & Database Audit

This report reviews the Spring Boot controllers, MySQL configurations, and entity properties.

## 1. REST Endpoint Integrity

- **User Accounts (`/api/users`):**
  - `GET /me` (Profile details)
  - `PUT /me` (Details update)
  - `PUT /me/password` (Salt validation and password update)
  - `POST /me/2fa/enable` / `/disable` (Toggles boolean 2FA flag)
  - `GET /me/devices` (Returns simulated session device list)
  - `POST /me/delete-request` (Flags deactivation status)
- **Case Workflows (`/api/volunteer` & `/api/cases`):**
  - Secure threads and file attachment triggers are operational.

---

## 2. MySQL Schema & Seeding
- **Active Schema Profile:** `mysql` profile configured in `application-mysql.properties`.
- **Database Name:** `aram_db`.
- **Ddl Auto Mode:** `update` (Guarantees data persistence across restarts).
- **Audit Tables:** Persistent storage schema is active for `VolunteerActivityLog`, `CaseChatThread`, `CaseMessage`, and `LegalGuideCaseNote`.
