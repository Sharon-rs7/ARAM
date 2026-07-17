// Stateful mock data for ARAM Frontend Demo Mode
// Operates on localStorage to persist changes during demo mode

const getStorageItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(`aram_mock_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setStorageItem = (key, value) => {
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
    departmentPreference: "Labour Dispute",
    serviceArea: "Chennai Corporation",
    languagesKnown: "English, Tamil",
    reasonToVolunteer: "Passionate about legal aid accessibility.",
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

const INITIAL_DEPARTMENTS = [
  { id: "dept-1", name: "Labour Commissioner", head: "Dr. K. Srinivasan", email: "labour@aram.gov", mobile: "9441122330", active: true, count: 12 },
  { id: "dept-2", name: "Cyber Crime Cell", head: "Tmt. A. Banu IPS", email: "cybercrime@aram.gov", mobile: "9441122331", active: true, count: 25 },
  { id: "dept-3", name: "Consumer Disputes Forum", head: "Thiru. R. Murugan", email: "consumer@aram.gov", mobile: "9441122332", active: true, count: 8 },
  { id: "dept-4", name: "Police Help Cell & Women Safety", head: "Selvi. S. Priya DSP", email: "womensafety@aram.gov", mobile: "9441122333", active: true, count: 19 }
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

// Getters & Setters
export const getMockUsers = () => getStorageItem("users", INITIAL_USERS);
export const setMockUsers = (users) => setStorageItem("users", users);

export const getMockComplaints = () => getStorageItem("complaints", INITIAL_COMPLAINTS);
export const setMockComplaints = (complaints) => setStorageItem("complaints", complaints);

export const getMockDepartments = () => getStorageItem("departments", INITIAL_DEPARTMENTS);
export const setMockDepartments = (depts) => setStorageItem("departments", depts);

export const getMockAuditLogs = () => getStorageItem("audit_logs", INITIAL_AUDIT_LOGS);
export const setMockAuditLogs = (logs) => setStorageItem("audit_logs", logs);

export const getMockNotifications = () => getStorageItem("notifications", INITIAL_NOTIFICATIONS);
export const setMockNotifications = (nots) => setStorageItem("notifications", nots);
