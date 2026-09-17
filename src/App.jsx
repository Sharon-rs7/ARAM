import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";
import { useEffect } from "react";
import { toast } from "sonner";
import { offlineDraftService } from "@/services/offlineDraftService";
import { complaintService } from "@/services/complaintService";
import { documentService } from "@/services/documentService";
import ErrorBoundary from "@/components/common/ErrorBoundary";

/* Landing & Auth */
const LandingPage = lazy(() => import("./pages/landing/LandingPage"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const OTPVerification = lazy(() => import("./pages/auth/OTPVerification"));
const ActivateAccount = lazy(() => import("./pages/auth/ActivateAccount"));

/* Citizen */
const Dashboard = lazy(() => import("./pages/citizen/Dashboard"));
const SubmitComplaint = lazy(() => import("./pages/citizen/SubmitComplaint"));
const AIAnalysis = lazy(() => import("./pages/citizen/AIAnalysis"));
const ComplaintHistory = lazy(() => import("./pages/citizen/ComplaintHistory"));
const ComplaintDetails = lazy(() => import("./pages/citizen/ComplaintDetails"));
const Notifications = lazy(() => import("./pages/citizen/Notifications"));
const Chatbot = lazy(() => import("./pages/citizen/Chatbot"));
const MessagesInbox = lazy(() => import("./pages/citizen/MessagesInbox"));
const Profile = lazy(() => import("./pages/citizen/Profile"));
const Settings = lazy(() => import("./pages/citizen/Settings"));
const CitizenDocuments = lazy(() => import("./pages/citizen/CitizenDocuments"));
const TrackComplaint = lazy(() => import("./pages/citizen/TrackComplaint"));
const HelpCenter = lazy(() => import("./pages/citizen/HelpCenter"));

/* Volunteer */
const VolunteerDashboard = lazy(() => import("./pages/guide/Dashboard"));
const AssignedCases = lazy(() => import("./pages/guide/AssignedCases"));
const VolunteerComplaintDetails = lazy(() => import("./pages/guide/ComplaintDetails"));
const CaseReview = lazy(() => import("./pages/guide/CaseReview"));
const VolunteerProfile = lazy(() => import("./pages/guide/Profile"));
const VolunteerSettings = lazy(() => import("./pages/guide/Settings"));
const MyAnalytics = lazy(() => import("./pages/guide/MyAnalytics"));

/* Admin */
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const ManageComplaints = lazy(() => import("./pages/admin/ManageComplaints"));
const AdminComplaintDetails = lazy(() => import("./pages/admin/ComplaintDetails"));
const ManageVolunteers = lazy(() => import("./pages/admin/ManageVolunteers"));
const Departments = lazy(() => import("./pages/admin/Departments"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const AdminProfile = lazy(() => import("./pages/admin/Profile"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AuditLogs = lazy(() => import("./pages/superadmin/AuditLogs"));
const SuperAdminDashboard = lazy(() => import("./pages/superadmin/SuperAdminDashboard"));

/* Regional Admin */
const RegionalAdminDashboard = lazy(() => import("./pages/admin/RegionalAdminDashboard"));
const RegionalComplaints = lazy(() => import("./pages/admin/RegionalComplaints"));
const RegionalComplaintDetails = lazy(() => import("./pages/admin/RegionalComplaintDetails"));
const RegionalCitizens = lazy(() => import("./pages/admin/RegionalCitizens"));
const RegionalGuides = lazy(() => import("./pages/admin/RegionalGuides"));
const RegionalAnalytics = lazy(() => import("./pages/admin/RegionalAnalytics"));
const RegionalGuideRequests = lazy(() => import("./pages/admin/RegionalGuideRequests"));
const RegionalControlCenter = lazy(() => import("./pages/superadmin/RegionalControlCenter"));
const VolunteerActivityOverview = lazy(() => import("./pages/admin/VolunteerActivityOverview"));
const VolunteerActivityDetails = lazy(() => import("./pages/admin/VolunteerActivityDetails"));
const VolunteerAnalytics = lazy(() => import("./pages/admin/VolunteerAnalytics"));

/* Legal & Errors */
const TermsConditions = lazy(() => import("./pages/legal/TermsConditions"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const Disclaimer = lazy(() => import("./pages/legal/Disclaimer"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));
const NotFound = lazy(() => import("./pages/errors/NotFound"));
const ServerError = lazy(() => import("./pages/errors/ServerError"));
const Unauthorized = lazy(() => import("./pages/errors/Unauthorized"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-400">Loading ARAM...</p>
    </div>
  </div>
);

function App() {
  // Sync offline queued complaints
  useEffect(() => {
    const syncOfflineComplaints = async () => {
      try {
        const queue = await offlineDraftService.getQueuedSubmissions();
        if (queue.length === 0) return;

        toast.info(`Syncing ${queue.length} offline complaint(s)...`);

        for (const item of queue) {
          try {
            const res = await complaintService.createComplaint(item.payload);
            
            if (item.evidenceBlob && res && res.id) {
              try {
                const file = new File([item.evidenceBlob], item.evidenceName || "evidence.jpg", { type: item.evidenceBlob.type });
                const docFormData = new FormData();
                docFormData.append("file", file);
                docFormData.append("complaintId", res.id);
                docFormData.append("documentType", "EVIDENCE_PROOF");
                await documentService.uploadDocument(docFormData);
              } catch (docErr) {
                console.warn("Offline evidence attachment error:", docErr);
              }
            }
            
            await offlineDraftService.removeQueuedSubmission(item.queueId);
            toast.success(`Offline complaint '${item.payload.title}' successfully synced!`);
          } catch (err) {
            console.error("Failed to sync queued complaint:", err);
            break;
          }
        }
      } catch (globalErr) {
        console.error("Sync runner error:", globalErr);
      }
    };

    if (navigator.onLine) {
      syncOfflineComplaints();
    }

    const handleOnline = () => {
      syncOfflineComplaints();
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <ErrorBoundary>
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
              <Route path="/activate-account" element={<ActivateAccount />} />
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
              <Route path="/citizen/messages" element={<MessagesInbox />} />
              <Route path="/citizen/documents" element={<CitizenDocuments />} />
              <Route path="/citizen/profile" element={<Profile />} />
              <Route path="/citizen/settings" element={<Settings />} />
              <Route path="/citizen/help" element={<HelpCenter />} />
            </Route>

            {/* Guide Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["GUIDE"]} />}>
              <Route path="/guide/dashboard" element={<VolunteerDashboard />} />
              <Route path="/guide/assigned-cases" element={<AssignedCases />} />
              <Route path="/guide/complaint/:id" element={<VolunteerComplaintDetails />} />
              <Route path="/guide/case-review" element={<CaseReview />} />
              <Route path="/guide/case-review/:id" element={<CaseReview />} />
              <Route path="/guide/messages" element={<MessagesInbox />} />
              <Route path="/guide/profile" element={<VolunteerProfile />} />
              <Route path="/guide/settings" element={<VolunteerSettings />} />
              <Route path="/guide/my-analytics" element={<MyAnalytics />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} />}>
              <Route path="/admin/dashboard" element={<RegionalAdminDashboard />} />
              <Route path="/admin/manage-users" element={<RegionalCitizens />} />
              <Route path="/admin/users" element={<RegionalCitizens />} />
              <Route path="/admin/manage-complaints" element={<RegionalComplaints />} />
              <Route path="/admin/complaints" element={<RegionalComplaints />} />
              <Route path="/admin/complaint/:id" element={<RegionalComplaintDetails />} />
              <Route path="/admin/complaints/:id" element={<RegionalComplaintDetails />} />
              <Route path="/admin/manage-volunteers" element={<RegionalGuides />} />
              <Route path="/admin/volunteers" element={<RegionalGuides />} />
              <Route path="/admin/guide-requests" element={<RegionalGuideRequests />} />
              <Route path="/admin/departments" element={<Departments />} />
              <Route path="/admin/analytics" element={<RegionalAnalytics />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/volunteer-activity" element={<VolunteerActivityOverview />} />
              <Route path="/admin/volunteers/:id/activity" element={<VolunteerActivityDetails />} />
              <Route path="/admin/volunteers/:id/analytics" element={<VolunteerAnalytics />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/regions/:district" element={<RegionalControlCenter />} />
            </Route>

            {/* Super Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]} />}>
              <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/audit-logs" element={<AuditLogs />} />
              <Route path="/superadmin/regions/:district" element={<RegionalControlCenter />} />
            </Route>

            {/* Role-based Dashboard redirects */}
            <Route path="/dashboard" element={<Navigate to="/citizen/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/volunteer" element={<Navigate to="/guide/dashboard" replace />} />
            <Route path="/guide" element={<Navigate to="/guide/dashboard" replace />} />
            <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />

            {/* 404 Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
