import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

/* Landing & Auth */
const LandingPage = lazy(() => import("./pages/Landing/LandingPage"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const OTPVerification = lazy(() => import("./pages/Auth/OTPVerification"));

/* Citizen */
const Dashboard = lazy(() => import("./pages/Citizen/Dashboard"));
const SubmitComplaint = lazy(() => import("./pages/Citizen/SubmitComplaint"));
const AIAnalysis = lazy(() => import("./pages/Citizen/AIAnalysis"));
const ComplaintHistory = lazy(() => import("./pages/Citizen/ComplaintHistory"));
const ComplaintDetails = lazy(() => import("./pages/Citizen/ComplaintDetails"));
const Notifications = lazy(() => import("./pages/Citizen/Notifications"));
const Chatbot = lazy(() => import("./pages/Citizen/Chatbot"));
const Profile = lazy(() => import("./pages/Citizen/Profile"));
const Settings = lazy(() => import("./pages/Citizen/Settings"));
const CitizenDocuments = lazy(() => import("./pages/Citizen/CitizenDocuments"));
const TrackComplaint = lazy(() => import("./pages/Citizen/TrackComplaint"));
const HelpCenter = lazy(() => import("./pages/Citizen/HelpCenter"));

/* Volunteer */
const VolunteerDashboard = lazy(() => import("./pages/Volunteer/Dashboard"));
const AssignedCases = lazy(() => import("./pages/Volunteer/AssignedCases"));
const VolunteerComplaintDetails = lazy(() => import("./pages/Volunteer/ComplaintDetails"));
const CaseReview = lazy(() => import("./pages/Volunteer/CaseReview"));
const VolunteerProfile = lazy(() => import("./pages/Volunteer/Profile"));
const VolunteerSettings = lazy(() => import("./pages/Volunteer/Settings"));
const MyAnalytics = lazy(() => import("./pages/Volunteer/MyAnalytics"));

/* Admin */
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard"));
const ManageUsers = lazy(() => import("./pages/Admin/ManageUsers"));
const ManageComplaints = lazy(() => import("./pages/Admin/ManageComplaints"));
const AdminComplaintDetails = lazy(() => import("./pages/Admin/ComplaintDetails"));
const ManageVolunteers = lazy(() => import("./pages/Admin/ManageVolunteers"));
const Departments = lazy(() => import("./pages/Admin/Departments"));
const Analytics = lazy(() => import("./pages/Admin/Analytics"));
const Reports = lazy(() => import("./pages/Admin/Reports"));
const AdminProfile = lazy(() => import("./pages/Admin/Profile"));
const AdminSettings = lazy(() => import("./pages/Admin/Settings"));
const AuditLogs = lazy(() => import("./pages/Admin/AuditLogs"));
const VolunteerActivityOverview = lazy(() => import("./pages/Admin/VolunteerActivityOverview"));
const VolunteerActivityDetails = lazy(() => import("./pages/Admin/VolunteerActivityDetails"));
const VolunteerAnalytics = lazy(() => import("./pages/Admin/VolunteerAnalytics"));

/* Legal & Errors */
const TermsConditions = lazy(() => import("./pages/Legal/TermsConditions"));
const PrivacyPolicy = lazy(() => import("./pages/Legal/PrivacyPolicy"));
const Disclaimer = lazy(() => import("./pages/Legal/Disclaimer"));
const CookiePolicy = lazy(() => import("./pages/Legal/CookiePolicy"));
const NotFound = lazy(() => import("./pages/Errors/NotFound"));
const ServerError = lazy(() => import("./pages/Errors/ServerError"));
const Unauthorized = lazy(() => import("./pages/Errors/Unauthorized"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-400">Loading ARAM...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Landing & Policy Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/server-error" element={<ServerError />} />
        <Route path="/track-complaint" element={<TrackComplaint />} />

        {/* Public Authentication Pages (Protected from logged-in users) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
        </Route>

        {/* Citizen Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["CITIZEN"]} />}>
          <Route path="/citizen/dashboard" element={<Dashboard />} />
          <Route path="/citizen/submit-complaint" element={<SubmitComplaint />} />
          <Route path="/citizen/ai-analysis" element={<AIAnalysis />} />
          <Route path="/citizen/ai-analysis/:complaintId" element={<AIAnalysis />} />
          <Route path="/citizen/history" element={<ComplaintHistory />} />
          <Route path="/citizen/my-complaints" element={<ComplaintHistory />} />
          <Route path="/citizen/complaint/:id" element={<ComplaintDetails />} />
          <Route path="/citizen/complaints/:id" element={<ComplaintDetails />} />
          <Route path="/citizen/notifications" element={<Notifications />} />
          <Route path="/citizen/chatbot" element={<Chatbot />} />
          <Route path="/citizen/documents" element={<CitizenDocuments />} />
          <Route path="/citizen/profile" element={<Profile />} />
          <Route path="/citizen/settings" element={<Settings />} />
          <Route path="/citizen/help" element={<HelpCenter />} />
        </Route>

        {/* Volunteer Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["VOLUNTEER"]} />}>
          <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
          <Route path="/volunteer/assigned-cases" element={<AssignedCases />} />
          <Route path="/volunteer/complaint/:id" element={<VolunteerComplaintDetails />} />
          <Route path="/volunteer/case-review" element={<CaseReview />} />
          <Route path="/volunteer/case-review/:id" element={<CaseReview />} />
          <Route path="/volunteer/profile" element={<VolunteerProfile />} />
          <Route path="/volunteer/settings" element={<VolunteerSettings />} />
          <Route path="/volunteer/my-analytics" element={<MyAnalytics />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/manage-complaints" element={<ManageComplaints />} />
          <Route path="/admin/complaints" element={<ManageComplaints />} />
          <Route path="/admin/complaint/:id" element={<AdminComplaintDetails />} />
          <Route path="/admin/manage-volunteers" element={<ManageVolunteers />} />
          <Route path="/admin/volunteers" element={<ManageVolunteers />} />
          <Route path="/admin/departments" element={<Departments />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/admin/volunteer-activity" element={<VolunteerActivityOverview />} />
          <Route path="/admin/volunteers/:id/activity" element={<VolunteerActivityDetails />} />
          <Route path="/admin/volunteers/:id/analytics" element={<VolunteerAnalytics />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* Role-based Dashboard redirects */}
        <Route path="/dashboard" element={<Navigate to="/citizen/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/volunteer" element={<Navigate to="/volunteer/dashboard" replace />} />

        {/* 404 Catch All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
