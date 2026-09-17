import api from "@/services/api";
import { normalizeRole } from "@/utils/roleLabels";

export const authService = {
  login: async (emailOrPayload, passwordMaybe) => {
    let email, password;
    if (typeof emailOrPayload === "object" && emailOrPayload !== null) {
      email = emailOrPayload.email || emailOrPayload.username;
      password = emailOrPayload.password;
    } else {
      email = emailOrPayload;
      password = passwordMaybe;
    }

    const trimmed = (email || "").trim();
    const apiPayload = {
      username: trimmed,
      email: trimmed,
      password: password
    };
    const res = await api.post("/auth/login", apiPayload);
    const data = res.data;
    if (data) {
      if (data.user) {
        data.user.role = normalizeRole(data.user.role);
      }
      data.role = normalizeRole(data.user?.role || data.role);
    }
    return data;
  },

  loginWithGoogle: async (googlePayload) => {
    const res = await api.post("/auth/google", googlePayload);
    const data = res.data;
    if (data) {
      if (data.user) {
        data.user.role = normalizeRole(data.user.role);
      }
      data.role = normalizeRole(data.user?.role || data.role);
    }
    return data;
  },

  register: async (payload) => {
    const apiPayload = {
      name: payload.fullName,
      email: payload.email,
      mobile: payload.mobile,
      password: payload.password,
      role: (payload.role === "GUIDE" || payload.role === "VOLUNTEER") ? "HELPER" : payload.role,
      district: payload.district
    };

    const res = await api.post("/auth/register", apiPayload);
    const data = res.data;
    if (data) {
      if (data.user) {
        data.user.role = normalizeRole(data.user.role);
      }
      data.role = normalizeRole(data.user?.role || data.role);
    }
    return data;
  },

  forgotPassword: async (payload) => {
    const res = await api.post("/auth/forgot-password", payload);
    return res.data;
  },

  verifyOtp: async (payload) => {
    const res = await api.post("/auth/verify-reset-otp", payload);
    return res.data;
  },

  resetPassword: async (payload) => {
    const res = await api.post("/auth/reset-password", payload);
    return res.data;
  },

  activateAccount: async (payload) => {
    const res = await api.post("/auth/activate-account", payload);
    return res.data;
  }
};
