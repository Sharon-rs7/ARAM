# ARAM Cleanup & Duplicate Audit Report

This report identifies active vs unused duplicate components and files in the frontend codebase.

---

## 1. Protected Route Audit
- **src/routes/ProtectedRoute.jsx** -> **[ACTIVE KEEP]** (Imported by `src/App.jsx` to guard paths)
- **src/components/ProtectedRoute.jsx** -> **[SAFE TO DELETE]** (Unused duplicate leftover)
- **src/components/common/ProtectedRoute.jsx** -> **[SAFE TO DELETE]** (Unused duplicate leftover)

---

## 2. Layouts & Sidebar Audit
- **src/components/layout/DashboardLayout.jsx** -> **[ACTIVE KEEP]** (Core layout frame used by all dashboard pages)
- **src/components/layout/AdminSidebar.jsx** -> **[ACTIVE KEEP]** (Admin sidebar menu)
- **src/components/layout/CitizenSidebar.jsx** -> **[ACTIVE KEEP]** (Citizen sidebar menu)
- **src/components/layout/VolunteerSidebar.jsx** -> **[ACTIVE KEEP]** (Volunteer sidebar menu)
- **src/components/layout/Topbar.jsx** -> **[ACTIVE KEEP]** (Global dashboard top navigation bar)
- **src/components/layout/Footer.jsx** -> **[ACTIVE KEEP]** (Global landing page footer)
- **src/components/layout/Navbar.jsx** -> **[ACTIVE KEEP]** (Global landing page navigation header)
- **src/components/Sidebar.jsx** -> **[SAFE TO DELETE]** (Legacy unused flat sidebar)
- **src/components/dashboard/Sidebar.jsx** -> **[SAFE TO DELETE]** (Unused leftover sidebar)
- **src/components/layout/AdminLayout.jsx** -> **[SAFE TO DELETE]** (Legacy layout referencing missing components)
- **src/components/layout/CitizenLayout.jsx** -> **[SAFE TO DELETE]** (Legacy layout referencing missing components)
- **src/components/layout/VolunteerLayout.jsx** -> **[SAFE TO DELETE]** (Legacy layout referencing missing components)
- **src/components/dashboard/Topbar.jsx** -> **[SAFE TO DELETE]** (Unused leftover topbar)

---

## 3. Modals & Dialogs Audit
- **src/components/common/Modal.jsx** -> **[ACTIVE KEEP]** (Used across pages for overlays and confirmations)
- **src/components/common/Model.jsx** -> **[SAFE TO DELETE]** (Legacy duplicate with spelling error)

---

## 4. Case Sensitivity Audit
- Renamed all page directories under `src/pages/` to follow standardized **PascalCase** naming conventions (`Citizen`, `Volunteer`, `Admin`, `Auth`, `Legal`, `Errors`, `Helper`, `Advocate`, `Authority`).
- Verified that all imports inside active files match the capitalized folder paths exactly.
