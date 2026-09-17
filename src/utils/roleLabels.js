export const ROLE_LABELS = {
  CITIZEN: "Citizen",
  GUIDE: "Legal Guide",
  HELPER: "Legal Guide",
  VOLUNTEER: "Legal Guide",
  ADMIN: "Regional Admin",
  SUPER_ADMIN: "Super Admin",
};

export const ROLE_PORTAL_LABELS = {
  CITIZEN: "Citizen Portal",
  GUIDE: "Legal Guide Portal",
  HELPER: "Legal Guide Portal",
  VOLUNTEER: "Legal Guide Portal",
  ADMIN: "Regional Admin Panel",
  SUPER_ADMIN: "Super Admin Panel",
};

export const ROLE_DASHBOARD_LABELS = {
  CITIZEN: "Citizen Dashboard",
  GUIDE: "Legal Guide Dashboard",
  HELPER: "Legal Guide Dashboard",
  VOLUNTEER: "Legal Guide Dashboard",
  ADMIN: "Regional Admin Dashboard",
  SUPER_ADMIN: "Super Admin Dashboard",
};

export function normalizeRole(rawRole) {
  if (!rawRole) return null;
  let r = String(rawRole).toUpperCase().replace(/^ROLE_/, "");
  if (r === "HELPER" || r === "VOLUNTEER") return "GUIDE";
  if (r === "CITIZEN") return "CITIZEN";
  if (r === "ADMIN") return "ADMIN";
  if (r === "SUPER_ADMIN") return "SUPER_ADMIN";
  return r;
}

export function getRoleLabel(role) {
  const norm = normalizeRole(role);
  return ROLE_LABELS[String(norm || "").toUpperCase()] || role || "";
}

export function getRolePortalLabel(role) {
  const norm = normalizeRole(role);
  return ROLE_PORTAL_LABELS[String(norm || "").toUpperCase()] || role || "";
}

export function getRoleDashboardLabel(role) {
  const norm = normalizeRole(role);
  return ROLE_DASHBOARD_LABELS[String(norm || "").toUpperCase()] || role || "";
}

