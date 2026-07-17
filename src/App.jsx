import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* Landing */
import LandingPage from "./pages/Landing/LandingPage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import OTPVerification from "./pages/Auth/OTPVerification";

/* Citizen */
import Dashboard from "./pages/Citizen/Dashboard";
import SubmitComplaint from "./pages/Citizen/SubmitComplaint";
import AIAnalysis from "./pages/Citizen/AIAnalysis";
import ComplaintHistory from "./pages/Citizen/ComplaintHistory";
import ComplaintDetails from "./pages/Citizen/ComplaintDetails";
import Notifications from "./pages/Citizen/Notifications";
import Chatbot from "./pages/Citizen/Chatbot";
import Profile from "./pages/Citizen/Profile";
import Settings from "./pages/Citizen/Settings";
import CitizenDocuments from "./pages/Citizen/CitizenDocuments";

/* Volunteer */
import VolunteerDashboard from "./pages/Volunteer/Dashboard";
import AssignedCases from "./pages/Volunteer/AssignedCases";
import VolunteerComplaintDetails from "./pages/Volunteer/ComplaintDetails";
import CaseReview from "./pages/Volunteer/CaseReview";
import VolunteerProfile from "./pages/Volunteer/Profile";
import VolunteerSettings from "./pages/Volunteer/Settings";

/* Admin */
import AdminDashboard from "./pages/Admin/Dashboard";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageComplaints from "./pages/Admin/ManageComplaints";
import AdminComplaintDetails from "./pages/Admin/ComplaintDetails";
import ManageVolunteers from "./pages/Admin/ManageVolunteers";
import Departments from "./pages/Admin/Departments";
import Analytics from "./pages/Admin/Analytics";
import Reports from "./pages/Admin/Reports";
import AdminProfile from "./pages/Admin/Profile";
import AdminSettings from "./pages/Admin/Settings";
import AuditLogs from "./pages/Admin/AuditLogs";
import VolunteerActivityOverview from "./pages/Admin/VolunteerActivityOverview";
import VolunteerActivityDetails from "./pages/Admin/VolunteerActivityDetails";

/* Legal & Errors */
import TermsConditions from "./pages/Legal/TermsConditions";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy";
import Disclaimer from "./pages/Legal/Disclaimer";
import CookiePolicy from "./pages/Legal/CookiePolicy";
import NotFound from "./pages/Errors/NotFound";
import ServerError from "./pages/Errors/ServerError";
import Unauthorized from "./pages/Errors/Unauthorized";

/* Routing Guards */
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <BrowserRouter>
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
      
      {/* Dev Badge */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#ffffff',
        color: '#0f172a',
        padding: '10px 16px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 99999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '2.5px solid #0f172a',
        pointerEvents: 'none'
      }}>
        CURRENT ARAM PROJECT UPDATED
      </div>
    </BrowserRouter>
  );
}

export default App;
