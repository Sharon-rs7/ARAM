import axios from "axios";
import { userService } from "./userService.js";
import { authService } from "./authService.js";
import { complaintService } from "./complaintService.js";
import { documentService } from "./documentService.js";
import { notificationService } from "./notificationService.js";
import { adminService } from "./adminService.js";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user || (localStorage.getItem('role') ? { role: localStorage.getItem('role') } : null);
  } catch {
    return localStorage.getItem('role') ? { role: localStorage.getItem('role') } : null;
  }
}

export function saveAuth(auth) {
  const accessToken = auth?.accessToken || auth?.token;
  let role = auth?.user?.role || auth?.role;
  if (role) {
    role = String(role).toUpperCase().replace(/^ROLE_/, "");
    if (role === "HELPER") role = "VOLUNTEER";
  }
  const user = auth?.user ? { ...auth.user, role } : (role ? { role } : null);
  
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (auth?.refreshToken) localStorage.setItem('refreshToken', auth.refreshToken);
  if (user) localStorage.setItem('user', JSON.stringify(user));
  if (role) localStorage.setItem('role', role);
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
}

export const userApi = {
  me: () => userService.getMe(),
  updateMe: (payload) => userService.updateMe(payload),
  updateTheme: (themePreference) => userService.updateSettings({ themePreference }),
  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return userService.uploadAvatar(formData);
  }
};

export const authApi = {
  register: (payload) => authService.register(payload),
  login: (payload) => authService.login(payload),
  me: () => userService.getMe(),
};

export const complaintApi = {
  submit: (payload) => complaintService.submitComplaint(payload),
  my: () => complaintService.getMyComplaints(),
  get: (id) => complaintService.getComplaintById(id),
  uploadDocument: (id, formData) => complaintService.uploadComplaintDocument(id, formData)
};

export const documentApi = {
  upload: (complaintId, file) => {
    const formData = new FormData();
    formData.append('complaintId', complaintId);
    formData.append('file', file);
    return documentService.uploadDocument(formData);
  }
};

export const notificationApi = {
  list: () => notificationService.getNotifications(),
  unreadCount: () => notificationService.getUnreadCount(),
  markRead: (id) => notificationService.markAsRead(id)
};

export const adminApi = {
  dashboard: () => adminService.getDashboard(),
  complaints: () => adminService.getComplaints(),
  users: () => adminService.getUsers(),
  helpers: () => adminService.getVolunteers(),
  verifyHelper: (id) => adminService.verifyVolunteer(id),
  rejectHelper: (id) => adminService.rejectVolunteer(id),
  deleteUser: (id) => adminService.deleteUser(id),
  assignHelper: (complaintId, volunteerId) => adminService.assignVolunteer(complaintId, volunteerId)
};

export default api;
