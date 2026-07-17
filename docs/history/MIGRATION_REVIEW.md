# ARAM Migration and UI Merge Review

This document summarizes the current structure of the old project, the teammate's project, the plan for merging UI/UX improvements, and the final routes/running configurations.

## 1. Old Project Active Structure
The active base project is located at `E:\prgt\New folder\aram`.
Key files and folders:
- `src/` - Active frontend React codebase (using plain, theme-aware CSS style sheets)
  - `src/App.jsx` - Routes configuration
  - `src/components/` - Global components (e.g. `SettingsCenter`, `AppShell`, `ProtectedRoute`, `StatusBadge`)
  - `src/pages/` - Role-based pages (e.g. `LandingPage`, `Profile`, `CitizenDashboard`, `AssignedCases`)
  - `src/services/` - HTTP API clients wrapping Axios (`api.js`, `userService.js`, etc.)
  - `src/styles/` - Stylesheets (`global.css`, `theme.css`, `responsive.css`)
- `aram-backend/` - Spring Boot Java backend containing `pom.xml`, controllers, and API services.
- `package.json` - Frontend NPM configurations.
- `vite.config.js` - Vite compiler configuration.
- `.env` / `.env.example` - Frontend environment parameters.

## 2. Teammate aram-app Structure (Donor/Reference)
The teammate project is located at `E:\prgt\Full stack\aram-app`.
Key elements:
- React + Tailwind v4 + Lucide Icons + Framer Motion
- Shadcn UI (using Radix UI and standard Tailwind utility layout blocks)
- Modular sections for Landing Page (`Hero`, `Features`, `HowItWorks`, `FAQ`)
- Pre-made legal/error layouts (`PrivacyPolicy`, `Disclaimer`, `TermsConditions`, `CookiePolicy`, `NotFound`, `Unauthorized`, `ServerError`)

## 3. Useful UI Files/Components found in aram-app
- **Legal Pages**: `TermsConditions.jsx`, `PrivacyPolicy.jsx`, `Disclaimer.jsx`, `CookiePolicy.jsx` (under `src/pages/Legal/`)
- **Error Pages**: `NotFound.jsx`, `ServerError.jsx`, `Unauthorized.jsx` (under `src/pages/Errors/`)
- **Landing Sections**: Accordion-based FAQs, rich features, and user target group breakdowns
- **Dashboard elements**: Spacing configurations, settings input form constraints, and visual status details

## 4. Files to Merge into Old Project
We will copy and adapt:
- **Legal pages** into `src/pages/legal/` (adapting them to the old project's CSS variables and global theme class structures)
- **Error pages** into `src/pages/errors/` (adapting them to the old project's style standards)
- **FAQ and visual sections** into `src/pages/LandingPage.jsx`
- **Settings & Profile validations** and fields into `src/components/SettingsCenter.jsx` and `src/pages/Profile.jsx`
- **Separated Mock Mode Layer** into `src/services/api.mock.js` and toggle based on `VITE_USE_MOCKS` in `api.js` to ensure real services remain completely clean and unpolluted.

## 5. Files to Ignore
- Tailwind CSS configuration files, `@tailwindcss/vite` imports, shadcn config files
- Unused Tailwind helper libraries or third-party layouts that are incompatible with custom CSS

## 6. Duplicate/Unwanted Files to Remove after Verification
- Any temporary copied folders such as nested `aram-app/` or `aid/` or duplicate `node_modules` inside nested subfolders
- Build output folders (`dist/`) that can be regenerated

## 7. Final Active Route Map
We preserve all existing paths, adding the legal/error views:
- `/` -> `LandingPage.jsx` (AI-powered, visual layout, role cards, supported categories, disclaimer, FAQs)
- `/login` -> `Login.jsx`
- `/register` -> `Register.jsx`
- `/forgot-password` -> `ForgotPassword.jsx`
- `/reset-password` -> `ResetPassword.jsx`
- `/not-authorized` -> `NotAuthorized.jsx`
- `/dashboard` -> `CitizenDashboard.jsx`
- `/dashboard/submit-complaint` -> `SubmitComplaint.jsx`
- `/dashboard/my-complaints` -> `MyComplaints.jsx`
- `/dashboard/complaints/:id` -> `ComplaintDetails.jsx`
- `/dashboard/track-complaint` -> `TrackComplaint.jsx`
- `/dashboard/profile` -> `Profile.jsx`
- `/dashboard/settings` -> `CitizenSettings.jsx`
- `/dashboard/notifications` -> `Notifications.jsx`
- `/dashboard/ai-chat` -> `AiChat.jsx`
- `/helper` -> `HelperDashboard.jsx`
- `/helper/assigned-cases` -> `AssignedCases.jsx`
- `/helper/settings` -> `HelperSettings.jsx`
- `/helper/profile` -> `Profile.jsx`
- `/admin` -> `AdminDashboard.jsx`
- `/admin/complaints` -> `ComplaintManagement.jsx`
- `/admin/users` -> `UserManagement.jsx`
- `/admin/audit-logs` -> `AuditLogs.jsx`
- `/admin/settings` -> `AdminSettings.jsx`
- `/admin/profile` -> `Profile.jsx`
- **Legal Routes**:
  - `/terms` -> `TermsConditions.jsx`
  - `/privacy` -> `PrivacyPolicy.jsx`
  - `/disclaimer` -> `Disclaimer.jsx`
  - `/cookies` -> `CookiePolicy.jsx`
- **Error Routes**:
  - `/server-error` -> `ServerError.jsx`
  - `*` (fallback) -> `NotFound.jsx` (replacing the plain redirect)

## 8. Final Run Commands
### Frontend:
```bash
cd "E:\prgt\New folder\aram"
npm run dev
```
Runs at: http://localhost:5173

### Backend:
```bash
cd "E:\prgt\New folder\aram\aram-backend"
mvn spring-boot:run
```
Runs at: http://localhost:8080
