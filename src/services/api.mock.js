// Stateful mock data API layer for ARAM Frontend Demo Mode
// Operates on localStorage to persist changes during demo mode

const getMockData = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(`aram_mock_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setMockData = (key, value) => {
  try {
    localStorage.setItem(`aram_mock_${key}`, JSON.stringify(value));
  } catch (e) {}
};

// Initial Data seeds
const INITIAL_USERS = [
  {
    id: "usr-1",
    name: "Rajesh Kumar",
    email: "citizen@aram.ai",
    mobile: "9876543210",
    role: "CITIZEN",
    status: "ACTIVE",
    district: "Coimbatore",
    address: "12, Cross Cut Road, Gandhipuram",
    preferredLanguage: "Tamil",
    bio: "Citizen looking for simple legal aid regarding labour disputes.",
    avatarUrl: "",
    createdAt: "2026-06-01T10:00:00Z"
  },
  {
    id: "usr-2",
    name: "Sharon Mary",
    email: "volunteer@aram.ai",
    mobile: "9876543211",
    role: "VOLUNTEER",
    status: "ACTIVE",
    helperVerified: true,
    specialization: "Labor & Consumer Law",
    district: "Chennai",
    address: "45, Nelson Manickam Road",
    preferredLanguage: "English",
    bio: "Law student eager to assist citizens with initial legal triage guidance.",
    languagesKnown: "English, Tamil",
    assignedCasesCount: 2,
    resolvedCasesCount: 5,
    createdAt: "2026-05-15T09:30:00Z"
  },
  {
    id: "usr-3",
    name: "System Administrator",
    email: "admin@aram.ai",
    mobile: "9876543212",
    role: "ADMIN",
    status: "ACTIVE",
    district: "Coimbatore",
    address: "ARAM Legal Aid Main HQ",
    preferredLanguage: "English",
    bio: "Chief Administrator of the ARAM triage system.",
    avatarUrl: "",
    createdAt: "2026-01-01T08:00:00Z"
  }
];

const INITIAL_COMPLAINTS = [
  {
    id: "cmp-101",
    userId: "usr-1",
    title: "Salary not paid for three months by my manager",
    description: "I have been working as a junior web developer for 6 months. My manager has not paid my salary since March. Whenever I request it, he threatens to terminate my employment without any notice or experience certificate.",
    language: "ENGLISH",
    district: "Coimbatore",
    inputMode: "TEXT",
    transcribedText: "",
    transcriptionConfidence: 1.0,
    category: "LABOUR_DISPUTE",
    priority: "HIGH",
    priorityScore: 78,
    status: "PENDING",
    assignedHelperId: "usr-2",
    sensitive: false,
    preferredHelperGender: "ANY",
    identityVisibility: "VISIBLE",
    legalOpinion: "",
    authorityRemarks: "",
    requiredDocuments: "Payslips, Bank Statement, Appointment Letter",
    nextSteps: "Approach Labour Commissioner, send legal notice through helper.",
    createdAt: "2026-06-25T11:20:00Z",
    updatedAt: "2026-06-25T14:30:00Z"
  },
  {
    id: "cmp-102",
    userId: "usr-1",
    title: "Online UPI fraud scam from unknown website",
    description: "I received a message claiming I won a lottery. When I clicked the link, Rs. 15,000 was deducted from my bank account via GPay UPI transaction without sharing OTP.",
    language: "ENGLISH",
    district: "Coimbatore",
    inputMode: "TEXT",
    category: "CYBER_CRIME",
    priority: "CRITICAL",
    priorityScore: 92,
    status: "UNDER_REVIEW",
    assignedHelperId: "usr-2",
    sensitive: true,
    preferredHelperGender: "ANY",
    identityVisibility: "PARTIAL",
    legalOpinion: "Please register complaint immediately on National Cyber Crime Portal (cybercrime.gov.in) or call 1930.",
    createdAt: "2026-06-28T09:15:00Z",
    updatedAt: "2026-06-28T10:00:00Z"
  }
];

const INITIAL_AUDIT_LOGS = [
  { id: "log-1", actor: "System Administrator", role: "ADMIN", action: "VERIFY_HELPER", target: "Sharon Mary (usr-2)", timestamp: "2026-06-20T10:30:00Z" },
  { id: "log-2", actor: "Sharon Mary", role: "VOLUNTEER", action: "ASSIGNED_CASE", target: "Salary dispute (cmp-101)", timestamp: "2026-06-25T14:30:00Z" },
  { id: "log-3", actor: "Rajesh Kumar", role: "CITIZEN", action: "SUBMIT_COMPLAINT", target: "UPI Fraud (cmp-102)", timestamp: "2026-06-28T09:15:00Z" }
];

const INITIAL_NOTIFICATIONS = [
  { id: "not-1", userId: "usr-1", title: "Complaint Submitted", message: "Your complaint 'UPI Fraud' has been successfully submitted.", type: "COMPLAINT", read: false, createdAt: "2026-06-28T09:15:00Z" },
  { id: "not-2", userId: "usr-2", title: "New Assignment", message: "You have been assigned to case cmp-102.", type: "ASSIGNMENT", read: false, createdAt: "2026-06-28T09:20:00Z" }
];

const getMockUsers = () => getMockData("users", INITIAL_USERS);
const setMockUsers = (users) => setMockData("users", users);

const getMockComplaints = () => getMockData("complaints", INITIAL_COMPLAINTS);
const setMockComplaints = (complaints) => setMockData("complaints", complaints);

const getMockAuditLogs = () => getMockData("audit_logs", INITIAL_AUDIT_LOGS);
const setMockAuditLogs = (logs) => setMockData("audit_logs", logs);

const getMockNotifications = () => getMockData("notifications", INITIAL_NOTIFICATIONS);
const setMockNotifications = (nots) => setMockData("notifications", nots);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCurrentMockUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};

export const authApi = {
  register: async (payload) => {
    await delay(800);
    const users = getMockUsers();
    const exists = users.some((u) => u.email === payload.email.toLowerCase());
    if (exists) {
      throw new Error("Email address already registered.");
    }
    const newUser = {
      id: `usr-${users.length + 1}`,
      name: payload.name || payload.fullName,
      email: payload.email.toLowerCase(),
      mobile: payload.mobile,
      role: payload.role || "CITIZEN",
      status: payload.role === "VOLUNTEER" || payload.role === "HELPER" ? "PENDING" : "ACTIVE",
      district: payload.district || "Coimbatore",
      preferredLanguage: payload.preferredLanguage || "English",
      bio: payload.bio || "",
      address: payload.address || "",
      helperVerified: payload.role === "VOLUNTEER" || payload.role === "HELPER" ? false : undefined,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setMockUsers(users);
    return {
      success: true,
      message: "Registration successful. Please login.",
      user: newUser
    };
  },

  login: async (payload) => {
    await delay(600);
    const { email, password } = payload;
    const users = getMockUsers();
    const user = users.find((u) => u.email === email.toLowerCase());
    if (!user) {
      throw new Error("Invalid email or password.");
    }
    // Simple passwords check for demo
    if (email.toLowerCase() === "citizen@aram.ai" && password !== "Citizen@123") {
      throw new Error("Invalid password for Rajesh Kumar (Demo: Citizen@123).");
    }
    if (email.toLowerCase() === "volunteer@aram.ai" && password !== "Helper@123") {
      throw new Error("Invalid password for Sharon Mary (Demo: Helper@123).");
    }
    if (email.toLowerCase() === "admin@aram.ai" && password !== "Admin@123") {
      throw new Error("Invalid password for Administrator (Demo: Admin@123).");
    }

    return {
      accessToken: `demo-access-token-${user.role.toLowerCase()}-${Date.now()}`,
      refreshToken: `demo-refresh-token-${Date.now()}`,
      user: user,
      role: user.role
    };
  },

  me: async () => {
    await delay(200);
    const current = getCurrentMockUser();
    if (!current) throw new Error("Unauthorized.");
    return current;
  },

  forgotPassword: async (payload) => {
    await delay(400);
    return { success: true, message: "OTP sent to email." };
  },

  verifyResetOtp: async (payload) => {
    await delay(400);
    if (payload.otp !== "123456") throw new Error("Invalid OTP. Use 123456.");
    return { success: true, token: "demo-reset-token" };
  },

  resetPassword: async (payload) => {
    await delay(400);
    return { success: true, message: "Password reset successful." };
  }
};

export const userApi = {
  me: async () => {
    return authApi.me();
  },
  updateMe: async (payload) => {
    await delay(400);
    const current = getCurrentMockUser();
    if (!current) throw new Error("Unauthorized.");
    const users = getMockUsers();
    const updatedUsers = users.map((u) => {
      if (u.id === current.id) {
        return { ...u, ...payload };
      }
      return u;
    });
    setMockUsers(updatedUsers);
    const updatedUser = updatedUsers.find((u) => u.id === current.id);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  },
  updateTheme: async (themePreference) => {
    await delay(100);
    return { success: true, themePreference };
  },
  updateAvatar: async (file) => {
    await delay(500);
    const current = getCurrentMockUser();
    if (!current) throw new Error("Unauthorized.");
    const avatarUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=AramUser";
    const users = getMockUsers();
    const updatedUsers = users.map((u) => {
      if (u.id === current.id) {
        return { ...u, avatarUrl };
      }
      return u;
    });
    setMockUsers(updatedUsers);
    current.avatarUrl = avatarUrl;
    localStorage.setItem('user', JSON.stringify(current));
    return current;
  }
};

export const helperApi = {
  profile: async () => {
    return authApi.me();
  },
  updateProfile: async (payload) => {
    return userApi.updateMe(payload);
  },
  cases: async () => {
    await delay(300);
    const current = getCurrentMockUser();
    if (!current) return [];
    const complaints = getMockComplaints();
    return complaints.filter((c) => c.assignedHelperId === current.id);
  },
  caseDetails: async (id) => {
    await delay(200);
    const complaints = getMockComplaints();
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) throw new Error("Case not found.");
    return complaint;
  },
  updateCaseStatus: async (id, payload) => {
    await delay(300);
    const complaints = getMockComplaints();
    const updated = complaints.map((c) => {
      if (c.id === id) {
        return { ...c, status: payload.status, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    setMockComplaints(updated);
    return updated.find((c) => c.id === id);
  },
  addNote: async (id, payload) => {
    await delay(300);
    const complaints = getMockComplaints();
    const updated = complaints.map((c) => {
      if (c.id === id) {
        return { ...c, legalOpinion: payload.note || payload.opinion || c.legalOpinion, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    setMockComplaints(updated);
    return updated.find((c) => c.id === id);
  }
};

export const complaintApi = {
  submit: async (payload) => {
    await delay(800);
    const current = getCurrentMockUser();
    const complaints = getMockComplaints();
    const newComplaint = {
      id: `cmp-${101 + complaints.length}`,
      userId: current ? current.id : "usr-1",
      title: payload.title,
      description: payload.description,
      language: payload.language || "ENGLISH",
      district: payload.district,
      inputMode: payload.inputMode || "TEXT",
      category: payload.category || "LABOUR_DISPUTE",
      priority: payload.priority || "MEDIUM",
      priorityScore: payload.priorityScore || 62,
      status: "PENDING",
      assignedHelperId: "usr-2",
      sensitive: payload.sensitive || false,
      preferredHelperGender: payload.preferredHelperGender || "ANY",
      identityVisibility: payload.identityVisibility || "VISIBLE",
      legalOpinion: "",
      authorityRemarks: "",
      requiredDocuments: "Aadhaar card, Written description of issues",
      nextSteps: "Assigned helper Sharon Mary will review files shortly.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    complaints.unshift(newComplaint);
    setMockComplaints(complaints);
    
    // Add audit log
    const logs = getMockAuditLogs();
    logs.unshift({
      id: `log-${logs.length + 1}`,
      actor: current ? current.name : "Rajesh Kumar",
      role: current ? current.role : "CITIZEN",
      action: "SUBMIT_COMPLAINT",
      target: `${payload.title} (${newComplaint.id})`,
      timestamp: new Date().toISOString()
    });
    setMockAuditLogs(logs);

    return newComplaint;
  },
  my: async () => {
    await delay(300);
    const current = getCurrentMockUser();
    if (!current) return [];
    const complaints = getMockComplaints();
    return complaints.filter((c) => c.userId === current.id);
  },
  get: async (id) => {
    await delay(200);
    const complaints = getMockComplaints();
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) throw new Error("Complaint not found.");
    return complaint;
  },
  reanalyze: async (id) => {
    await delay(600);
    const complaints = getMockComplaints();
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) throw new Error("Complaint not found.");
    return complaint;
  },
  updateStatus: async (id, payload) => {
    await delay(300);
    const complaints = getMockComplaints();
    const updated = complaints.map((c) => {
      if (c.id === id) {
        return { ...c, status: payload.status || c.status, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    setMockComplaints(updated);
    return updated.find((c) => c.id === id);
  }
};

export const documentApi = {
  upload: async (complaintId, file) => {
    await delay(600);
    return { success: true, message: "Document uploaded successfully." };
  },
  byComplaint: async (complaintId) => {
    await delay(200);
    return [
      { id: "doc-1", name: "SalaryProof.pdf", verified: true },
      { id: "doc-2", name: "AppointmentLetter.jpg", verified: false }
    ];
  }
};

export const notificationApi = {
  list: async () => {
    await delay(200);
    const current = getCurrentMockUser();
    if (!current) return [];
    const nots = getMockNotifications();
    return nots.filter((n) => n.userId === current.id);
  },
  unreadCount: async () => {
    await delay(100);
    const current = getCurrentMockUser();
    if (!current) return 0;
    const nots = getMockNotifications();
    return nots.filter((n) => n.userId === current.id && !n.read).length;
  },
  markRead: async (id) => {
    await delay(100);
    const nots = getMockNotifications();
    const updated = nots.map((n) => n.id === id ? { ...n, read: true } : n);
    setMockNotifications(updated);
    return { success: true };
  }
};

export const adminApi = {
  dashboard: async () => {
    await delay(300);
    const users = getMockUsers();
    const complaints = getMockComplaints();
    const volunteers = users.filter((u) => u.role === "VOLUNTEER" || u.role === "HELPER");
    return {
      totalComplaints: complaints.length,
      pendingComplaints: complaints.filter((c) => c.status === "PENDING").length,
      underReviewComplaints: complaints.filter((c) => c.status === "UNDER_REVIEW").length,
      resolvedComplaints: complaints.filter((c) => c.status === "RESOLVED").length,
      totalUsers: users.length,
      totalVolunteers: volunteers.length,
      pendingVolunteers: volunteers.filter((v) => !v.helperVerified).length,
    };
  },
  complaints: async () => {
    await delay(300);
    return getMockComplaints();
  },
  users: async () => {
    await delay(300);
    return getMockUsers();
  },
  helpers: async () => {
    await delay(300);
    const users = getMockUsers();
    return users.filter((u) => u.role === "VOLUNTEER" || u.role === "HELPER");
  },
  verifyHelper: async (id) => {
    await delay(400);
    const users = getMockUsers();
    const updated = users.map((u) => u.id === id ? { ...u, helperVerified: true, status: "ACTIVE" } : u);
    setMockUsers(updated);
    return { success: true };
  },
  rejectHelper: async (id) => {
    await delay(400);
    const users = getMockUsers();
    const updated = users.map((u) => u.id === id ? { ...u, helperVerified: false, status: "SUSPENDED" } : u);
    setMockUsers(updated);
    return { success: true };
  },
  deleteUser: async (id) => {
    await delay(400);
    const users = getMockUsers();
    const updated = users.filter((u) => u.id !== id);
    setMockUsers(updated);
    return { success: true };
  },
  deleteComplaint: async (id) => {
    await delay(400);
    const complaints = getMockComplaints();
    const updated = complaints.filter((c) => c.id !== id);
    setMockComplaints(updated);
    return { success: true };
  },
  assignHelper: async (id, helperId) => {
    await delay(400);
    const complaints = getMockComplaints();
    const updated = complaints.map((c) => 
      c.id === id 
        ? { ...c, assignedHelperId: helperId, status: "UNDER_REVIEW", updatedAt: new Date().toISOString() } 
        : c
    );
    setMockComplaints(updated);
    return { success: true };
  },
  reports: async () => {
    await delay(500);
    return {
      complaintsByCategory: {
        LABOUR_DISPUTE: 12,
        CYBER_CRIME: 20,
        CONSUMER_COMPLAINT: 8,
        PROPERTY_CIVIL_DISPUTE: 14,
        WOMEN_SAFETY: 16,
        GENERAL_GRIEVANCE: 9
      },
      resolutionRate: 78,
      averageTriageTimeHours: 2.1
    };
  },
  auditLogs: async () => {
    await delay(200);
    return getMockAuditLogs();
  },
  updateComplaintStatus: async (id, payload) => {
    await delay(300);
    const complaints = getMockComplaints();
    const updated = complaints.map((c) => {
      if (c.id === id) {
        return { ...c, status: payload.status, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    setMockComplaints(updated);
    return updated.find((c) => c.id === id);
  },
  suspendUser: async (id) => {
    await delay(300);
    const users = getMockUsers();
    const updated = users.map((u) => u.id === id ? { ...u, status: "SUSPENDED" } : u);
    setMockUsers(updated);
    return { success: true };
  },
  activateUser: async (id) => {
    await delay(300);
    const users = getMockUsers();
    const updated = users.map((u) => u.id === id ? { ...u, status: "ACTIVE" } : u);
    setMockUsers(updated);
    return { success: true };
  },
  exportUsers: async (role) => {
    await delay(600);
    return new Blob(["Mock exported user data"], { type: "text/csv" });
  }
};

export const advocateApi = {
  cases: async () => {
    await delay(300);
    return getMockComplaints();
  },
  caseDetails: async (id) => {
    await delay(200);
    const complaints = getMockComplaints();
    return complaints.find((c) => c.id === id);
  },
  addOpinion: async (id, opinion) => {
    await delay(400);
    const complaints = getMockComplaints();
    const updated = complaints.map((c) => {
      if (c.id === id) {
        return { ...c, legalOpinion: opinion, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    setMockComplaints(updated);
    return updated.find((c) => c.id === id);
  }
};

export const authorityApi = {
  cases: async () => {
    await delay(300);
    return getMockComplaints();
  },
  caseDetails: async (id) => {
    await delay(200);
    const complaints = getMockComplaints();
    return complaints.find((c) => c.id === id);
  },
  updateStatus: async (id, status) => {
    await delay(300);
    const complaints = getMockComplaints();
    const updated = complaints.map((c) => {
      if (c.id === id) {
        return { ...c, status, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    setMockComplaints(updated);
    return updated.find((c) => c.id === id);
  },
  addRemarks: async (id, remarks) => {
    await delay(400);
    const complaints = getMockComplaints();
    const updated = complaints.map((c) => {
      if (c.id === id) {
        return { ...c, authorityRemarks: remarks, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    setMockComplaints(updated);
    return updated.find((c) => c.id === id);
  }
};
