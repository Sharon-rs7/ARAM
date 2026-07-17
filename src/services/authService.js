import api, { USE_MOCKS } from "./api";
import { getMockUsers, setMockUsers } from "../data/mock";

export const authService = {
  login: async (payload) => {
    const { email, password } = payload;
    
    if (USE_MOCKS) {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const users = getMockUsers();
      const user = users.find((u) => u.email === email.toLowerCase());
      
      if (!user) {
        throw new Error("Invalid email or password.");
      }
      
      // Strict role and credentials check for demo
      // In demo mode, citizen@aram.ai password is "Citizen@123", helper@aram.ai is "Helper@123", admin@aram.ai is "Admin@123"
      if (email.toLowerCase() === "citizen@aram.ai" && password !== "Citizen@123") {
        throw new Error("Invalid password for Rajesh Kumar (Demo: Citizen@123).");
      }
      if (email.toLowerCase() === "volunteer@aram.ai" && password !== "Helper@123") {
        throw new Error("Invalid password for Sharon Mary (Demo: Helper@123).");
      }
      if (email.toLowerCase() === "admin@aram.ai" && password !== "Admin@123") {
        throw new Error("Invalid password for Admin User (Demo: Admin@123).");
      }
      
      return {
        accessToken: `demo-access-token-jwt-${user.role.toLowerCase()}-${Date.now()}`,
        refreshToken: `demo-refresh-token-${Date.now()}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          district: user.district,
          preferredLanguage: user.preferredLanguage,
          avatarUrl: user.avatarUrl,
        },
        role: user.role
      };
    }
    
    // Real API implementation
    const apiPayload = {
      username: payload.email,
      password: payload.password
    };
    const res = await api.post("/auth/login", apiPayload);
    const data = res.data;
    if (data) {
      if (data.user) {
        if (data.user.role === "HELPER") data.user.role = "VOLUNTEER";
      }
      data.role = data.user?.role || data.role;
      if (data.role === "HELPER") data.role = "VOLUNTEER";
    }
    return data;
  },

  register: async (payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const users = getMockUsers();
      const exists = users.some((u) => u.email === payload.email.toLowerCase());
      
      if (exists) {
        throw new Error("Email address already registered.");
      }
      
      // Clean password check
      if (payload.password !== payload.confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      
      const newUser = {
        id: `usr-${users.length + 1}`,
        name: payload.fullName,
        email: payload.email.toLowerCase(),
        mobile: payload.mobile,
        role: payload.role || "CITIZEN",
        status: payload.role === "VOLUNTEER" ? "PENDING" : "ACTIVE", // Volunteers require approval
        district: payload.district,
        preferredLanguage: payload.preferredLanguage,
        bio: payload.role === "VOLUNTEER" ? payload.reasonToVolunteer : "",
        createdAt: new Date().toISOString()
      };
      
      // Save
      users.push(newUser);
      setMockUsers(users);
      
      return {
        success: true,
        message: payload.role === "VOLUNTEER" 
          ? "Registration submitted. Volunteer accounts require administrator approval." 
          : "Account created successfully. Please login.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      };
    }

    const apiPayload = {
      name: payload.fullName,
      email: payload.email,
      mobile: payload.mobile,
      password: payload.password,
      role: payload.role === "VOLUNTEER" ? "HELPER" : payload.role
    };

    const res = await api.post("/auth/register", apiPayload);
    const data = res.data;
    if (data) {
      if (data.user) {
        if (data.user.role === "HELPER") data.user.role = "VOLUNTEER";
      }
      data.role = data.user?.role || data.role;
      if (data.role === "HELPER") data.role = "VOLUNTEER";
    }
    return data;
  },

  forgotPassword: async (payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const users = getMockUsers();
      const user = users.find((u) => u.email === payload.email.toLowerCase());
      if (!user) {
        throw new Error("Email address not found.");
      }
      return { success: true, message: "OTP sent to registered email address." };
    }
    const res = await api.post("/auth/forgot-password", payload);
    return res.data;
  },

  verifyOtp: async (payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (payload.otp !== "123456") {
        throw new Error("Invalid or expired OTP. Use demo OTP: 123456");
      }
      return { success: true, token: "temp-otp-reset-token-999" };
    }
    const res = await api.post("/auth/verify-reset-otp", payload);
    return res.data;
  },

  resetPassword: async (payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, message: "Password updated successfully. Please login." };
    }
    const res = await api.post("/auth/reset-password", payload);
    return res.data;
  }
};
