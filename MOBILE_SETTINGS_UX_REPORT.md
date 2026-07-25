# Mobile Settings UX Report

This report documents the design specifications and technical integration of the role-based Settings Center across the ARAM platform.

## Settings Configurations

### 1. Public User (`citizen` role)
- **Account:** Profile avatar, name, district, area/locality, and language preference.
- **Communication Preferences:** Toggles for email, SMS, and WhatsApp alerts, with safe hours configuration.
- **Privacy & Safety:** Default identityVisibility shield (VISIBLE / PARTIAL / HIDDEN), women guide preference, and hide phone/email toggle.
- **Security:** Password updating, trusted device logs, and 2FA activation.
- **Appearance & Accessibility:** Dark mode toggle, text scaling, simple mode preference, and voice velocity slider.
- **Data & Deletion:** JSON data package download, and account deletion request.

### 2. Legal Guide (`helper` role)
- **Professional Info:** Languages spoken, specialization categories, capacity maximums, and availability toggle.
- **Case Preferences:** Sensitive case toggles, women support trained certificates, and SLA alerts.
- **Security & Devices:** Connected browser sessions list, password resets, and 2FA.

### 3. Admin (`admin` role)
- **System Rules:** auto-recommendation toggles, workload limits, and SLA thresholds.
- **Danger Zone:** Admin deactivation request.

---

## Mobile UX & Comfort Controls

1. **Collapsible Accordion Stack:** Stacks card sections vertically on mobile to prevent excessive scrolling.
2. **Min 44px Touch Targets:** All buttons, selection lists, text input zones, and navigation controls use at least `44px` height padding to prevent mis-taps.
3. **Sticky Action Bar:** Keeps the "Save Changes" action pinned to the screen bottom for quick access.
4. **Input Spacings:** Prevent text overlaps by displaying error states and validation logs below input fields.

---

## Backend settings API status
- **GET/PUT `/api/users/me`**: Operational.
- **PUT `/api/users/me/password`**: Operational.
- **POST `/api/users/me/2fa/enable` / `/api/users/me/2fa/disable`**: Operational.
- **GET `/api/users/me/devices`**: Operational (mocked lists returned).
- **POST `/api/users/me/logout-all`**: Operational.
- **GET `/api/users/me/data-report`**: Operational.
- **POST `/api/users/me/delete-request`**: Operational.

---

## Security & Privacy Rules
- **No Local Storage Cache:** Sensitive documents, transcripts, and passwords are never stored in browser `localStorage`.
- **Authenticated Sessions Only:** All updates require JWT header authorization.
