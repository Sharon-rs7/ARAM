export const ROLE_LABELS = {
  CITIZEN: "Public User",
  HELPER: "Legal Guide",
  VOLUNTEER: "Legal Guide",
  ADMIN: "Admin",
};

export const ROLE_PORTAL_LABELS = {
  CITIZEN: "Public User Portal",
  HELPER: "Legal Guide Portal",
  VOLUNTEER: "Legal Guide Portal",
  ADMIN: "Admin Panel",
};

export const ROLE_DASHBOARD_LABELS = {
  CITIZEN: "Public User Dashboard",
  HELPER: "Legal Guide Dashboard",
  VOLUNTEER: "Legal Guide Dashboard",
  ADMIN: "Admin Dashboard",
};

export function getRoleLabel(role) {
  return ROLE_LABELS[String(role || "").toUpperCase()] || role || "";
}

export function getRolePortalLabel(role) {
  return ROLE_PORTAL_LABELS[String(role || "").toUpperCase()] || role || "";
}

export function getRoleDashboardLabel(role) {
  return ROLE_DASHBOARD_LABELS[String(role || "").toUpperCase()] || role || "";
}
