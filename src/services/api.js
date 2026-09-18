import axios from "axios";
import { userService } from "@/services/userService.js";
import { authService } from "@/services/authService.js";
import { complaintService } from "@/services/complaintService.js";
import { documentService } from "@/services/documentService.js";
import { notificationService } from "@/services/notificationService.js";
import { adminService } from "@/services/adminService.js";
import { normalizeRole } from "@/utils/roleLabels";

const resolveApiUrl = (envVar) => {
  if (envVar) return envVar;
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return `${window.location.origin}/api`;
  }
  return "http://localhost:8082/api";
};

export const API_BUSINESS_URL = resolveApiUrl(import.meta.env.VITE_API_BASE_URL);
export const API_AUTH_URL = resolveApiUrl(import.meta.env.VITE_AUTH_SERVICE_BASE_URL);
export const API_BASE_URL = API_BUSINESS_URL;
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

const api = axios.create({
  baseURL: API_BUSINESS_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Dynamic routing: Auth endpoints -> Port 8081, Business endpoints -> Port 8082
    if (config.url.startsWith("/auth") || config.url.startsWith("/users/me")) {
      config.baseURL = API_AUTH_URL;
    } else {
      config.baseURL = API_BUSINESS_URL;
    }
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const isPublic = config.url.includes("/auth/") || config.url.includes("/support/contact");
    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
      if (!refreshToken) {
        logout();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const refreshRes = await axios.post(`${API_AUTH_URL}/auth/refresh`, { refreshToken });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshRes.data;
        
        const isSession = !!sessionStorage.getItem("accessToken");
        const storage = isSession ? sessionStorage : localStorage;

        storage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          storage.setItem("refreshToken", newRefreshToken);
        }

        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export function getAccessToken() {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
}

export function getCurrentUser() {
  try {
    const userVal = localStorage.getItem('user') || sessionStorage.getItem('user');
    const roleVal = localStorage.getItem('role') || sessionStorage.getItem('role');
    const user = JSON.parse(userVal || 'null');
    return user || (roleVal ? { role: roleVal } : null);
  } catch {
    const roleVal = localStorage.getItem('role') || sessionStorage.getItem('role');
    return roleVal ? { role: roleVal } : null;
  }
}

export function saveAuth(auth, rememberMe = true) {
  const accessToken = auth?.accessToken || auth?.token;
  let role = normalizeRole(auth?.user?.role || auth?.role);
  const user = auth?.user ? { ...auth.user, role, backendRole: (auth.user.backendRole || auth.user.role || auth.role) } : (role ? { role } : null);
  
  const storage = rememberMe ? localStorage : sessionStorage;
  const oldStorage = rememberMe ? sessionStorage : localStorage;

  // Clear opposite storage
  oldStorage.removeItem('accessToken');
  oldStorage.removeItem('refreshToken');
  oldStorage.removeItem('user');
  oldStorage.removeItem('role');

  if (accessToken) storage.setItem('accessToken', accessToken);
  if (auth?.refreshToken) storage.setItem('refreshToken', auth.refreshToken);
  if (user) storage.setItem('user', JSON.stringify(user));
  if (role) storage.setItem('role', role);
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('role');

  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('role');
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
