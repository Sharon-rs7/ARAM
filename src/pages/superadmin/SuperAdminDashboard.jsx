import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import { adminService } from "@/services/adminService";
import { regionalAdminService } from "@/services/regionalAdminService";
import { API_BUSINESS_URL } from "@/services/api";
import Avatar from "@/components/common/Avatar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  MapPin, Users, Scale, ShieldAlert, FileText, 
  CheckCircle2, AlertCircle, Clock, X, Bot, Sparkles, 
  Phone, Mail, ArrowRight, Shield, Activity, TrendingUp,
  UserX, UserCheck, ShieldAlert as AlertIcon, RefreshCw, BarChart2,
  Search, Filter, Plus, Send, Eye, ShieldCheck, Download, AlertTriangle,
  Award, Briefcase, ChevronRight, Lock, Layers
} from "lucide-react";
import StatewideAnalyticsView from "@/components/superadmin/StatewideAnalyticsView";

export const TN_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", 
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", 
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", 
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", 
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", 
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", 
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", 
  "Vellore", "Viluppuram", "Virudhunagar"
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTabState] = useState(urlTab || "analytics");

  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTabState(urlTab);
    }
  }, [urlTab]);

  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam !== null && searchParam !== undefined) {
      setComplaintSearch(searchParam);
    }
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setComplaintStatusFilter(statusParam);
    }
    const districtParam = searchParams.get("district");
    if (districtParam) {
      setComplaintDistrictFilter(districtParam);
    }
  }, [searchParams]);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    setSearchParams({ tab: tabId });
  };

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data Collections
  const [districtMetrics, setDistrictMetrics] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);

  // Search & Filter States
  const [districtSearch, setDistrictSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all"); // all, with_cases, has_admin, no_admin

  const [complaintSearch, setComplaintSearch] = useState("");
  const [complaintDistrictFilter, setComplaintDistrictFilter] = useState("ALL");
  const [complaintStatusFilter, setComplaintStatusFilter] = useState("ALL");
  const [complaintPriorityFilter, setComplaintPriorityFilter] = useState("ALL");

  const [citizenSearch, setCitizenSearch] = useState("");
  const [citizenDistrictFilter, setCitizenDistrictFilter] = useState("ALL");
  const [citizenStatusFilter, setCitizenStatusFilter] = useState("ALL");

  const [guideSearch, setGuideSearch] = useState("");
  const [guideDistrictFilter, setGuideDistrictFilter] = useState("ALL");
  const [guideStatusFilter, setGuideStatusFilter] = useState("ALL");

  const [adminSearch, setAdminSearch] = useState("");
  const [adminStatusFilter, setAdminStatusFilter] = useState("ALL");

  // Modals & Action States
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState("");
  const [assignReason, setAssignReason] = useState("");
  const [recommendedGuides, setRecommendedGuides] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    district: "Ariyalur",
    name: "",
    email: "",
    mobile: "",
    designation: "Regional Administrator",
    password: "Admin@123"
  });

  const [showCreateGuideModal, setShowCreateGuideModal] = useState(false);
  const [guideFormData, setGuideFormData] = useState({
    district: "Coimbatore",
    name: "",
    email: "",
    mobile: "",
    gender: "MALE",
    languagesKnown: "Tamil, English",
    specializationCategories: "CIVIL_RIGHTS,PROPERTY_DISPUTE",
    experienceLevel: "3 years",
    maxActiveCases: 5,
    womenSupportTrained: false,
    canHandleSensitiveCases: false
  });

  // Statewide AI Compliance Sweep
  const [sweeping, setSweeping] = useState(false);
  const [sweepResults, setSweepResults] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Load All System Registers
  const loadAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [metricsData, allUsers, allComplaints] = await Promise.all([
        adminService.getDistrictMetrics().catch(() => []),
        adminService.getUsers().catch(() => []),
        adminService.getComplaints().catch(() => [])
      ]);

      // If metricsData is returned, use it; otherwise synthesize for all 38 districts
      if (metricsData && Array.isArray(metricsData) && metricsData.length > 0) {
        setDistrictMetrics(metricsData);
      } else {
        const synthesized = TN_DISTRICTS.map(d => {
          const dComplaints = (allComplaints || []).filter(c => c.district && c.district.toLowerCase() === d.toLowerCase());
          const dUsers = (allUsers || []).filter(u => u.district && u.district.toLowerCase() === d.toLowerCase());
          const dGuides = dUsers.filter(u => u.role === "HELPER" || u.role === "VOLUNTEER" || u.role === "GUIDE");
          const dCitizens = dUsers.filter(u => u.role === "CITIZEN");
          const dAdmin = dUsers.find(u => u.role === "ADMIN" && u.status !== "DELETED");

          return {
            name: d,
            district: d,
            caseCount: dComplaints.length,
            totalComplaints: dComplaints.length,
            pendingCount: dComplaints.filter(c => c.status !== "RESOLVED" && c.status !== "REJECTED").length,
            pendingComplaints: dComplaints.filter(c => c.status !== "RESOLVED" && c.status !== "REJECTED").length,
            resolvedCount: dComplaints.filter(c => c.status === "RESOLVED").length,
            guidesCount: dGuides.length,
            totalGuides: dGuides.length,
            citizensCount: dCitizens.length,
            hasActiveAdmin: !!(dAdmin && dAdmin.status === "ACTIVE"),
            adminName: dAdmin ? dAdmin.name : "Unassigned",
            adminEmail: dAdmin ? dAdmin.email : null,
            adminStatus: dAdmin ? dAdmin.status : "UNASSIGNED"
          };
        });
        setDistrictMetrics(synthesized);
      }

      setUsers(allUsers || []);
      setComplaints(allComplaints || []);
    } catch (err) {
      console.error("Super Admin Data Load Error:", err);
      toast.error("Failed to refresh statewide registers.");
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Compute statewide stats
  const stats = useMemo(() => {
    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => c.status !== "RESOLVED" && c.status !== "REJECTED" && c.status !== "DELETED").length;
    const resolvedComplaints = complaints.filter(c => c.status === "RESOLVED").length;
    const citizens = users.filter(u => u.role === "CITIZEN" && u.status !== "DELETED");
    const guides = users.filter(u => (u.role === "HELPER" || u.role === "VOLUNTEER" || u.role === "GUIDE") && u.status !== "DELETED");
    const activeAdmins = users.filter(u => u.role === "ADMIN" && u.status === "ACTIVE");

    return {
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      totalCitizens: citizens.length,
      totalGuides: guides.length,
      totalAdmins: activeAdmins.length
    };
  }, [complaints, users]);

  // Filtered District Grids
  const filteredDistricts = useMemo(() => {
    return (districtMetrics.length > 0 ? districtMetrics : TN_DISTRICTS.map(d => ({ name: d, district: d, caseCount: 0, guidesCount: 0, citizensCount: 0, adminName: "Unassigned" }))).filter(d => {
      const name = (d.name || d.district || "").toLowerCase();
      const matchSearch = name.includes(districtSearch.toLowerCase().trim());
      if (!matchSearch) return false;

      const cases = d.caseCount || d.totalComplaints || 0;
      const hasAdmin = d.hasActiveAdmin || (d.adminName && d.adminName !== "Unassigned");

      if (districtFilter === "with_cases") return cases > 0;
      if (districtFilter === "has_admin") return hasAdmin;
      if (districtFilter === "no_admin") return !hasAdmin;
      return true;
    });
  }, [districtMetrics, districtSearch, districtFilter]);

  // Filtered Complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const title = (c.title || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      const customId = (c.complaintCustomId || `ARAM-${c.id}`).toLowerCase();
      const search = complaintSearch.toLowerCase().trim();
      const matchSearch = !search || title.includes(search) || desc.includes(search) || customId.includes(search);
      if (!matchSearch) return false;

      if (complaintDistrictFilter !== "ALL" && (!c.district || c.district.toLowerCase() !== complaintDistrictFilter.toLowerCase())) {
        return false;
      }
      if (complaintStatusFilter !== "ALL" && c.status !== complaintStatusFilter) {
        return false;
      }
      if (complaintPriorityFilter !== "ALL" && c.priority !== complaintPriorityFilter) {
        return false;
      }
      return true;
    });
  }, [complaints, complaintSearch, complaintDistrictFilter, complaintStatusFilter, complaintPriorityFilter]);

  // Filtered Citizens
  const filteredCitizens = useMemo(() => {
    return users.filter(u => u.role === "CITIZEN").filter(u => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const mobile = (u.mobile || "");
      const search = citizenSearch.toLowerCase().trim();
      const matchSearch = !search || name.includes(search) || email.includes(search) || mobile.includes(search);
      if (!matchSearch) return false;

      if (citizenDistrictFilter !== "ALL" && (!u.district || u.district.toLowerCase() !== citizenDistrictFilter.toLowerCase())) {
        return false;
      }
      if (citizenStatusFilter !== "ALL" && u.status !== citizenStatusFilter) {
        return false;
      }
      return true;
    });
  }, [users, citizenSearch, citizenDistrictFilter, citizenStatusFilter]);

  // Filtered Guides
  const filteredGuides = useMemo(() => {
    return users.filter(u => u.role === "HELPER" || u.role === "VOLUNTEER" || u.role === "GUIDE").filter(u => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const spec = (u.specialization || u.specializationCategories || "").toLowerCase();
      const search = guideSearch.toLowerCase().trim();
      const matchSearch = !search || name.includes(search) || email.includes(search) || spec.includes(search);
      if (!matchSearch) return false;

      if (guideDistrictFilter !== "ALL" && (!u.district || u.district.toLowerCase() !== guideDistrictFilter.toLowerCase())) {
        return false;
      }
      if (guideStatusFilter !== "ALL" && u.status !== guideStatusFilter) {
        return false;
      }
      return true;
    });
  }, [users, guideSearch, guideDistrictFilter, guideStatusFilter]);

  // Filtered Admins
  const filteredAdmins = useMemo(() => {
    return TN_DISTRICTS.map(dist => {
      const found = users.find(u => u.role === "ADMIN" && u.district && u.district.toLowerCase() === dist.toLowerCase() && u.status !== "DELETED");
      return {
        district: dist,
        admin: found || null,
        status: found ? found.status : "UNASSIGNED"
      };
    }).filter(item => {
      if (adminStatusFilter !== "ALL") {
        if (adminStatusFilter === "ACTIVE" && item.status !== "ACTIVE") return false;
        if (adminStatusFilter === "SUSPENDED" && item.status !== "SUSPENDED") return false;
        if (adminStatusFilter === "UNASSIGNED" && item.status !== "UNASSIGNED") return false;
      }
      const search = adminSearch.toLowerCase().trim();
      if (!search) return true;
      const distMatch = item.district.toLowerCase().includes(search);
      const nameMatch = item.admin && item.admin.name.toLowerCase().includes(search);
      const emailMatch = item.admin && item.admin.email.toLowerCase().includes(search);
      return distMatch || nameMatch || emailMatch;
    });
  }, [users, adminSearch, adminStatusFilter]);

  // Action Handlers
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await adminService.updateUserStatus(userId, nextStatus);
      toast.success(`User status changed to ${nextStatus}`);
      await loadAllData(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user status.");
    }
  };

  const handleVerifyGuide = async (guideId, approve = true) => {
    try {
      if (approve) {
        await adminService.verifyVolunteer(guideId);
        toast.success("Legal Guide credentials verified successfully.");
      } else {
        await adminService.rejectVolunteer(guideId);
        toast.warning("Legal Guide verification rejected.");
      }
      await loadAllData(true);
    } catch (err) {
      console.error(err);
      toast.error("Action failed.");
    }
  };

  // Open Guide Assignment Modal
  const openAssignModal = async (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedGuideId(complaint.assignedHelper?.id || "");
    setAssignReason("");
    setShowAssignModal(true);
    setLoadingRecommendations(true);

    try {
      const recs = await adminService.recommendVolunteers(complaint.id);
      setRecommendedGuides(recs || []);
    } catch (err) {
      setRecommendedGuides([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Submit Guide Assignment
  const handleAssignGuideSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGuideId || !selectedComplaint) return;
    setSubmittingAction(true);

    try {
      await adminService.assignVolunteer(
        selectedComplaint.id,
        selectedGuideId,
        assignReason || "Assigned via Super Admin Statewide Dispatch Control",
        "Direct dispatch by Super Admin"
      );
      toast.success("Legal Guide dispatched successfully!");
      setShowAssignModal(false);
      await loadAllData(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign Legal Guide.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Open Status Update Modal
  const openStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status || "UNDER_REVIEW");
    setStatusNote("");
    setShowStatusModal(true);
  };

  // Submit Status Update
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!newStatus || !selectedComplaint) return;
    setSubmittingAction(true);

    try {
      await adminService.updateComplaintStatus(selectedComplaint.id, newStatus, statusNote || "Status updated by Super Admin");
      toast.success(`Complaint status updated to ${newStatus}`);
      setShowStatusModal(false);
      await loadAllData(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Create Admin Submit
  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminFormData.name || !adminFormData.email || !adminFormData.mobile || !adminFormData.district) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmittingAction(true);

    try {
      await adminService.createAdmin(adminFormData);
      toast.success(`Regional Admin for ${adminFormData.district} created successfully!`);
      setShowCreateAdminModal(false);
      setAdminFormData({
        district: "Ariyalur",
        name: "",
        email: "",
        mobile: "",
        designation: "Regional Administrator",
        password: "Admin@123"
      });
      await loadAllData(true);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Failed to create Regional Admin.";
      toast.error(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Resend Admin Invite
  const handleResendAdminInvite = async (email) => {
    try {
      await adminService.resendAdminInvitation(email);
      toast.success(`Invitation resent to ${email}`);
    } catch (err) {
      toast.error("Failed to resend invitation.");
    }
  };

  // Handle Create Guide Submit
  const handleCreateGuideSubmit = async (e) => {
    e.preventDefault();
    if (!guideFormData.name || !guideFormData.email || !guideFormData.mobile || !guideFormData.district) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmittingAction(true);

    try {
      await adminService.createVolunteer(guideFormData);
      toast.success(`Legal Guide ${guideFormData.name} onboarded for ${guideFormData.district}!`);
      setShowCreateGuideModal(false);
      setGuideFormData({
        district: "Coimbatore",
        name: "",
        email: "",
        mobile: "",
        gender: "MALE",
        languagesKnown: "Tamil, English",
        specializationCategories: "CIVIL_RIGHTS,PROPERTY_DISPUTE",
        experienceLevel: "3 years",
        maxActiveCases: 5,
        womenSupportTrained: false,
        canHandleSensitiveCases: false
      });
      await loadAllData(true);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Failed to create Legal Guide.";
      toast.error(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Run Statewide AI Compliance Sweep
  const triggerStatewideAiSweep = () => {
    setSweeping(true);
    setTimeout(() => {
      const unassigned = complaints.filter(c => c.status === "SUBMITTED" || c.status === "PENDING");
      const criticalUnassigned = complaints.filter(c => (c.status === "SUBMITTED" || c.status === "PENDING") && (c.priority === "CRITICAL" || c.priority === "HIGH"));
      const overloadedGuides = users.filter(u => {
        const isGuide = u.role === "HELPER" || u.role === "VOLUNTEER" || u.role === "GUIDE";
        return isGuide && (u.currentActiveCases >= (u.maxActiveCases || 5));
      });
      const districtsNoAdmin = TN_DISTRICTS.filter(d => {
        const found = users.find(u => u.role === "ADMIN" && u.district && u.district.toLowerCase() === d.toLowerCase() && u.status === "ACTIVE");
        return !found;
      });

      setSweepResults({
        totalScannedComplaints: complaints.length,
        totalScannedUsers: users.length,
        unassignedCount: unassigned.length,
        criticalUnassignedCount: criticalUnassigned.length,
        criticalList: criticalUnassigned.slice(0, 5),
        overloadedGuidesCount: overloadedGuides.length,
        districtsNoAdminCount: districtsNoAdmin.length,
        districtsNoAdminList: districtsNoAdmin
      });
      setSweeping(false);
      toast.success("Statewide AI Compliance Scan Complete!");
    }, 1200);
  };

  return (
    <DashboardLayout role="superadmin">
      <div className="max-w-7xl mx-auto space-y-7 pb-16 text-[#18332B] dark:text-slate-100">
        
        {/* Top Statewide Master Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#163D32] via-[#1B4B3D] to-[#163D32] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-emerald-700/40">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-300 mb-2">
              <Shield size={13} className="text-emerald-400" />
              <span>Statewide Master Authority</span>
              <span>•</span>
              <span>Primary: superadmin@gmail.com</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tamil Nadu Statewide Command Center
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl font-medium leading-relaxed">
              Real-time governance, 38-district public grievance redressal monitoring, citizen registry, legal guide dispatch, and transparent audit trail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => loadAllData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "Syncing..." : "Live Refresh"}</span>
            </button>

            <button
              onClick={() => setShowCreateAdminModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#DCEBDD] hover:bg-emerald-100 text-[#163D32] text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            >
              <Plus size={15} />
              <span>+ Create District Admin</span>
            </button>

            <button
              onClick={() => setShowCreateGuideModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-bold border border-emerald-600/50 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <UserCheck size={14} />
              <span>+ Onboard Legal Guide</span>
            </button>
          </div>
        </div>

        {/* 6 Key KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-[#FFFDF8] dark:bg-[#11201B] p-4.5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-[#65736D] dark:text-emerald-300/70 uppercase tracking-wider">Total Complaints</span>
            <span className="text-2xl sm:text-3xl font-black text-[#18332B] dark:text-white mt-1.5">{stats.totalComplaints}</span>
            <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 font-semibold mt-1">38 Districts Statewide</span>
          </div>

          <div className="bg-[#FFFDF8] dark:bg-[#11201B] p-4.5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-[#65736D] dark:text-emerald-300/70 uppercase tracking-wider">Active In-Review</span>
            <span className="text-2xl sm:text-3xl font-black text-[#1F5948] dark:text-emerald-400 mt-1.5">{stats.pendingComplaints}</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1">Pending Review</span>
          </div>

          <div className="bg-[#FFFDF8] dark:bg-[#11201B] p-4.5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-[#65736D] dark:text-emerald-300/70 uppercase tracking-wider">Resolved Cases</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1.5">{stats.resolvedComplaints}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Grievances Resolved</span>
          </div>

          <div className="bg-[#FFFDF8] dark:bg-[#11201B] p-4.5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-[#65736D] dark:text-emerald-300/70 uppercase tracking-wider">Citizens</span>
            <span className="text-2xl sm:text-3xl font-black text-[#18332B] dark:text-white mt-1.5">{stats.totalCitizens}</span>
            <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 font-semibold mt-1">Registered Profiles</span>
          </div>

          <div className="bg-[#FFFDF8] dark:bg-[#11201B] p-4.5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-[#65736D] dark:text-emerald-300/70 uppercase tracking-wider">Legal Guides</span>
            <span className="text-2xl sm:text-3xl font-black text-[#18332B] dark:text-white mt-1.5">{stats.totalGuides}</span>
            <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 font-semibold mt-1">Specialized Advocates</span>
          </div>

          <div className="bg-[#FFFDF8] dark:bg-[#11201B] p-4.5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-[#65736D] dark:text-emerald-300/70 uppercase tracking-wider">District Admins</span>
            <span className="text-2xl sm:text-3xl font-black text-[#18332B] dark:text-white mt-1.5">{stats.totalAdmins} / 38</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Active Coverage</span>
          </div>
        </div>

        {/* View Header & Quick Module Switcher */}
        <div className="bg-[#FFFDF8] dark:bg-[#11201B] p-4 sm:p-5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCEBDD] dark:bg-emerald-950/80 text-[#163D32] dark:text-emerald-300 flex items-center justify-center shrink-0 border border-[#163D32]/20 dark:border-emerald-700/50 shadow-xs">
              {activeTab === "analytics" && <Activity size={20} />}
              {activeTab === "districts" && <MapPin size={20} />}
              {activeTab === "complaints" && <FileText size={20} />}
              {activeTab === "citizens" && <Users size={20} />}
              {activeTab === "guides" && <Scale size={20} />}
              {activeTab === "admins" && <ShieldCheck size={20} />}
              {activeTab === "ai_audit" && <Bot size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#163D32] text-white">
                  {activeTab === "analytics" && "Executive Command"}
                  {activeTab === "districts" && "District Network"}
                  {activeTab === "complaints" && "Grievance Redressal"}
                  {activeTab === "citizens" && "Directory"}
                  {activeTab === "guides" && "Advocate Network"}
                  {activeTab === "admins" && "Administration"}
                  {activeTab === "ai_audit" && "Security & Ledger"}
                </span>
                <span className="text-xs text-[#65736D] dark:text-emerald-300/60 font-semibold">
                  Select options from Sidebar or quick navigation below
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#18332B] dark:text-white mt-0.5">
                {activeTab === "analytics" && "Tamil Nadu Legal Aid Command & Statewide Intelligence"}
                {activeTab === "districts" && "Tamil Nadu District Grievance Redressal Network"}
                {activeTab === "complaints" && "Statewide Grievance Redressal Queue"}
                {activeTab === "citizens" && "Tamil Nadu Citizen Registry & Profiles"}
                {activeTab === "guides" && "Specialized Legal Guide Force (120+)"}
                {activeTab === "admins" && "Tamil Nadu District Grievance Redressal Officers"}
                {activeTab === "ai_audit" && "AI Compliance Sweeps & Cryptographic Audit"}
              </h2>
            </div>
          </div>

          {/* Quick Module Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#F7F1E6]/70 dark:bg-[#182C26] p-1.5 rounded-xl border border-[#E6E1D8] dark:border-emerald-800/40 text-xs font-bold">
            {[
              { id: "analytics", label: "Statewide Analytics", icon: Activity },
              { id: "districts", label: "District Portals", icon: MapPin },
              { id: "complaints", label: "Grievances", icon: FileText, count: complaints.length },
              { id: "citizens", label: "Citizens", icon: Users, count: stats.totalCitizens },
              { id: "guides", label: "Legal Guides", icon: Scale, count: stats.totalGuides },
              { id: "admins", label: "Admins", icon: ShieldCheck, count: stats.totalAdmins },
              { id: "ai_audit", label: "AI Audit", icon: Bot }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                    isActive
                      ? "bg-[#163D32] text-white shadow-xs"
                      : "text-[#65736D] dark:text-emerald-200/70 hover:text-[#18332B] dark:hover:text-white hover:bg-white/60 dark:hover:bg-emerald-900/40"
                  }`}
                >
                  <Icon size={13} className={isActive ? "text-[#DCEBDD]" : ""} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-[#E6E1D8] dark:bg-emerald-950 text-[#18332B] dark:text-emerald-300"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 0: STATEWIDE COMMAND & ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === "analytics" && (
          <StatewideAnalyticsView
            onNavigateToComplaints={(statusCode) => {
              if (statusCode === "CRITICAL") {
                setComplaintPriorityFilter("CRITICAL");
                setComplaintStatusFilter("ALL");
              } else {
                setComplaintStatusFilter(statusCode);
              }
              setActiveTab("complaints");
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 1: DISTRICT PORTALS */}
        {/* ========================================================================= */}
        {activeTab === "districts" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Filter & Controls Bar */}
            <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-5 sm:p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[#163D32] dark:text-emerald-300 flex items-center gap-2">
                  <MapPin size={18} /> Tamil Nadu 38 District Grievance & Legal Redressal Network
                </h3>
                <p className="text-xs text-[#65736D] dark:text-emerald-200/60 mt-0.5">
                  Select any district portal to inspect active grievances, track resolutions, or manage designated redressal officers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[220px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60" />
                  <input
                    type="text"
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    placeholder="Search district name..."
                    className="w-full h-9.5 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] pl-8.5 pr-3 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#163D32] focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="flex rounded-xl bg-slate-100 dark:bg-[#182C26] p-1 border border-slate-200 dark:border-emerald-800/50 text-[11px] font-bold">
                  <button
                    onClick={() => setDistrictFilter("all")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${districtFilter === "all" ? "bg-white dark:bg-[#1C352E] text-[#163D32] dark:text-emerald-300 shadow-xs" : "text-slate-500 dark:text-emerald-200/60"}`}
                  >
                    All (38)
                  </button>
                  <button
                    onClick={() => setDistrictFilter("with_cases")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${districtFilter === "with_cases" ? "bg-white dark:bg-[#1C352E] text-[#163D32] dark:text-emerald-300 shadow-xs" : "text-slate-500 dark:text-emerald-200/60"}`}
                  >
                    Active Cases
                  </button>
                  <button
                    onClick={() => setDistrictFilter("has_admin")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${districtFilter === "has_admin" ? "bg-white dark:bg-[#1C352E] text-[#163D32] dark:text-emerald-300 shadow-xs" : "text-slate-500 dark:text-emerald-200/60"}`}
                  >
                    Admin Set
                  </button>
                  <button
                    onClick={() => setDistrictFilter("no_admin")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${districtFilter === "no_admin" ? "bg-white dark:bg-[#1C352E] text-[#163D32] dark:text-emerald-300 shadow-xs" : "text-slate-500 dark:text-emerald-200/60"}`}
                  >
                    Needs Admin
                  </button>
                </div>
              </div>
            </div>

            {/* 38 District Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDistricts.map((d) => {
                const distName = d.name || d.district;
                const cases = d.caseCount || d.totalComplaints || 0;
                const pending = d.pendingCount || d.pendingComplaints || 0;
                const guides = d.guidesCount || d.totalGuides || 0;
                const citizens = d.citizensCount || 0;
                const hasAdmin = d.hasActiveAdmin || (d.adminName && d.adminName !== "Unassigned");
                const adminName = d.adminName && d.adminName !== "Unassigned" ? d.adminName : null;
                const adminEmail = d.adminEmail || null;

                return (
                  <div
                    key={distName}
                    onClick={() => navigate(`/superadmin/regions/${distName}`)}
                    className="p-5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/40 bg-[#FFFDF8] dark:bg-[#162923] hover:border-[#163D32] dark:hover:border-emerald-400 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-base font-black text-[#18332B] dark:text-white group-hover:text-[#163D32] dark:group-hover:text-emerald-300 transition truncate">
                            {distName}
                          </h4>
                          <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 font-semibold block">
                            Tamil Nadu District
                          </span>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shrink-0 ${
                          cases > 0 
                            ? "bg-[#DCEBDD] text-[#163D32] dark:bg-emerald-950 dark:text-emerald-300 border border-[#B9D8BD] dark:border-emerald-700/40" 
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {cases} {cases === 1 ? "Case" : "Cases"}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-[#11201B] p-2.5 rounded-xl border border-slate-100 dark:border-emerald-900/40 font-medium">
                        <div>
                          <span className="text-[#65736D] dark:text-emerald-300/70 text-[10px] block font-bold">Legal Guides</span>
                          <span className="font-extrabold text-[#18332B] dark:text-white text-xs">{guides} Active</span>
                        </div>
                        <div>
                          <span className="text-[#65736D] dark:text-emerald-300/70 text-[10px] block font-bold">Citizens</span>
                          <span className="font-extrabold text-[#18332B] dark:text-white text-xs">{citizens} Registered</span>
                        </div>
                      </div>

                      {pending > 0 && (
                        <div className="mt-2 text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle size={11} />
                          <span>{pending} awaiting review/assignment</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-emerald-900/40 flex items-center justify-between text-[11px]">
                      {hasAdmin ? (
                        <div className="truncate pr-2">
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold truncate">
                            <ShieldCheck size={13} className="shrink-0 text-emerald-600" />
                            <span className="truncate">{adminName}</span>
                          </span>
                          {adminEmail && <span className="text-[9px] text-slate-400 dark:text-emerald-400/50 block truncate font-mono">{adminEmail}</span>}
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                          <AlertCircle size={12} className="shrink-0" />
                          <span>Admin Unassigned</span>
                        </span>
                      )}

                      <span className="text-[#1F5948] dark:text-emerald-400 font-black shrink-0 group-hover:translate-x-1 transition-transform">
                        Control →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredDistricts.length === 0 && (
              <div className="text-center py-12 rounded-3xl bg-white dark:bg-[#11201B] border border-slate-200 dark:border-emerald-800/40">
                <p className="text-xs text-slate-400 dark:text-emerald-200/50 font-medium">No districts match the filter "{districtSearch}".</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STATEWIDE GRIEVANCE QUEUE */}
        {/* ========================================================================= */}
        {activeTab === "complaints" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Filter Bar */}
            <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-5 sm:p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h3 className="text-base font-black text-[#163D32] dark:text-emerald-300 flex items-center gap-2">
                  <FileText size={18} /> Statewide Grievance Triage Queue ({filteredComplaints.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60" />
                  <input
                    type="text"
                    value={complaintSearch}
                    onChange={(e) => setComplaintSearch(e.target.value)}
                    placeholder="Search by Title, ID, Description..."
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] pl-8.5 pr-3 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#163D32]"
                  />
                </div>

                {/* District Filter */}
                <div>
                  <select
                    value={complaintDistrictFilter}
                    onChange={(e) => setComplaintDistrictFilter(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] px-3 text-xs text-slate-800 dark:text-white font-medium outline-none focus:border-[#163D32]"
                  >
                    <option value="ALL">All 38 Districts</option>
                    {TN_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={complaintStatusFilter}
                    onChange={(e) => setComplaintStatusFilter(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] px-3 text-xs text-slate-800 dark:text-white font-medium outline-none focus:border-[#163D32]"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="HELPER_ASSIGNED">HELPER_ASSIGNED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <select
                    value={complaintPriorityFilter}
                    onChange={(e) => setComplaintPriorityFilter(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] px-3 text-xs text-slate-800 dark:text-white font-medium outline-none focus:border-[#163D32]"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-[#FFFDF8] dark:bg-[#11201B] border border-[#E6E1D8] dark:border-emerald-800/50 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E6E1D8] dark:border-emerald-900/60 text-[#65736D] dark:text-emerald-300 uppercase text-[10px] font-black tracking-wider bg-[#F7F1E6]/40 dark:bg-[#182C26]">
                      <th className="py-3.5 px-4">Complaint ID</th>
                      <th className="py-3.5 px-4">Title & Details</th>
                      <th className="py-3.5 px-4">District</th>
                      <th className="py-3.5 px-4">Priority</th>
                      <th className="py-3.5 px-4">Assigned Guide</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Dispatch & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1D8] dark:divide-emerald-900/40 text-[#18332B] dark:text-slate-100">
                    {filteredComplaints.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F7F1E6]/40 dark:hover:bg-[#182C26]/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#1F5948] dark:text-emerald-400">
                          {c.complaintCustomId || `ARAM-${c.id}`}
                        </td>
                        <td className="py-3.5 px-4 max-w-[260px]">
                          <div className="font-bold text-[#18332B] dark:text-white truncate">{c.title}</div>
                          <div className="text-[10px] text-[#65736D] dark:text-emerald-200/60 font-semibold truncate">
                            {c.category?.replace(/_/g, " ") || "CIVIL DISPUTE"} • {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#163D32] dark:text-emerald-300">
                          {c.district || "Coimbatore"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            c.priority === "CRITICAL"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300"
                              : c.priority === "HIGH"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}>
                            {c.priority || "MEDIUM"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {c.assignedHelper ? (
                            <div>
                              <span className="font-bold text-slate-800 dark:text-white">{c.assignedHelper.name}</span>
                              <span className="text-[9px] text-slate-400 dark:text-emerald-400/60 block">{c.assignedHelper.email}</span>
                            </div>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center gap-1">
                              <AlertCircle size={12} /> Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            c.status === "RESOLVED"
                              ? "bg-[#DCEBDD] text-[#163D32] dark:bg-emerald-950 dark:text-emerald-300 border border-[#B9D8BD]"
                              : c.status === "HELPER_ASSIGNED"
                              ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300"
                              : "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openAssignModal(c)}
                              className="px-2.5 py-1.5 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white text-[10px] font-bold transition cursor-pointer shadow-xs"
                            >
                              Dispatch Guide
                            </button>
                            <button
                              onClick={() => openStatusModal(c)}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-white dark:bg-[#182C26] hover:bg-slate-50 text-slate-700 dark:text-emerald-200 text-[10px] font-bold transition cursor-pointer"
                            >
                              Status
                            </button>
                            <button
                              onClick={() => navigate(`/admin/complaint/${c.id}`)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                              title="Inspect Full Workspace"
                            >
                              <Eye size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredComplaints.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-10 text-center text-slate-400 dark:text-emerald-200/50 font-medium">
                          No grievances found matching the current search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CITIZEN REGISTRY */}
        {/* ========================================================================= */}
        {activeTab === "citizens" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-5 sm:p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[#163D32] dark:text-emerald-300 flex items-center gap-2">
                  <Users size={18} /> Statewide Citizen Directory ({filteredCitizens.length})
                </h3>
                <p className="text-xs text-[#65736D] dark:text-emerald-200/60 mt-0.5">
                  View and manage registered citizens across all 38 districts of Tamil Nadu.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60" />
                  <input
                    type="text"
                    value={citizenSearch}
                    onChange={(e) => setCitizenSearch(e.target.value)}
                    placeholder="Search citizens by name/email..."
                    className="w-full h-9.5 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] pl-8.5 pr-3 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#163D32]"
                  />
                </div>

                <select
                  value={citizenDistrictFilter}
                  onChange={(e) => setCitizenDistrictFilter(e.target.value)}
                  className="h-9.5 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] px-3 text-xs text-slate-800 dark:text-white font-medium outline-none focus:border-[#163D32]"
                >
                  <option value="ALL">All 38 Districts</option>
                  {TN_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={citizenStatusFilter}
                  onChange={(e) => setCitizenStatusFilter(e.target.value)}
                  className="h-9.5 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] px-3 text-xs text-slate-800 dark:text-white font-medium outline-none focus:border-[#163D32]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="SUSPENDED">Suspended Only</option>
                </select>

                <a
                  href={`${API_BUSINESS_URL}/admin/users/export?role=CITIZEN`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#182C26] hover:bg-slate-200 text-slate-700 dark:text-emerald-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-emerald-800"
                >
                  <Download size={13} />
                  <span>Export Excel</span>
                </a>
              </div>
            </div>

            {/* Citizens Table */}
            <div className="bg-[#FFFDF8] dark:bg-[#11201B] border border-[#E6E1D8] dark:border-emerald-800/50 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E6E1D8] dark:border-emerald-900/60 text-[#65736D] dark:text-emerald-300 uppercase text-[10px] font-black tracking-wider bg-[#F7F1E6]/40 dark:bg-[#182C26]">
                      <th className="py-3.5 px-4">Citizen Name</th>
                      <th className="py-3.5 px-4">Contact Info</th>
                      <th className="py-3.5 px-4">District</th>
                      <th className="py-3.5 px-4">Language</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Account Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1D8] dark:divide-emerald-900/40 text-[#18332B] dark:text-slate-100">
                    {filteredCitizens.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F7F1E6]/40 dark:hover:bg-[#182C26]/60 transition">
                        <td className="py-3.5 px-4 font-bold text-[#18332B] dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              name={c.name}
                              role="CITIZEN"
                              size="sm"
                              showRoleBadge={false}
                            />
                            <div>
                              <span>{c.name}</span>
                              <span className="text-[10px] text-slate-400 dark:text-emerald-400/50 block font-normal">ID #{c.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-[11px] text-slate-700 dark:text-emerald-200">{c.email}</div>
                          <div className="text-[10px] text-slate-400 dark:text-emerald-400/60">{c.mobile || "N/A"}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#163D32] dark:text-emerald-300">
                          {c.district || "Statewide"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-emerald-200 font-medium">
                          {c.preferredLanguage || "Tamil / English"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            c.status === "ACTIVE"
                              ? "bg-[#DCEBDD] text-[#163D32] dark:bg-emerald-950 dark:text-emerald-300 border border-[#B9D8BD]"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300"
                          }`}>
                            {c.status || "ACTIVE"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(c.id, c.status || "ACTIVE")}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                              c.status === "ACTIVE"
                                ? "bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 dark:bg-[#182C26] dark:text-rose-300 dark:border-rose-800"
                                : "bg-[#163D32] hover:bg-[#1F5948] text-white"
                            }`}
                          >
                            {c.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredCitizens.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-10 text-center text-slate-400 dark:text-emerald-200/50 font-medium">
                          No citizens found for the selected query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LEGAL GUIDE & VOLUNTEER NETWORK */}
        {/* ========================================================================= */}
        {activeTab === "guides" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-5 sm:p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[#163D32] dark:text-emerald-300 flex items-center gap-2">
                  <UserCheck size={18} /> Legal Guide & Volunteer Force ({filteredGuides.length})
                </h3>
                <p className="text-xs text-[#65736D] dark:text-emerald-200/60 mt-0.5">
                  114+ specialized advocates, legal aid volunteers, and dispute mediators across 38 districts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60" />
                  <input
                    type="text"
                    value={guideSearch}
                    onChange={(e) => setGuideSearch(e.target.value)}
                    placeholder="Search guides by name/skill..."
                    className="w-full h-9.5 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] pl-8.5 pr-3 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#163D32]"
                  />
                </div>

                <select
                  value={guideDistrictFilter}
                  onChange={(e) => setGuideDistrictFilter(e.target.value)}
                  className="h-9.5 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] px-3 text-xs text-slate-800 dark:text-white font-medium outline-none focus:border-[#163D32]"
                >
                  <option value="ALL">All 38 Districts</option>
                  {TN_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowCreateGuideModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Onboard Guide</span>
                </button>
              </div>
            </div>

            {/* Guides Table */}
            <div className="bg-[#FFFDF8] dark:bg-[#11201B] border border-[#E6E1D8] dark:border-emerald-800/50 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E6E1D8] dark:border-emerald-900/60 text-[#65736D] dark:text-emerald-300 uppercase text-[10px] font-black tracking-wider bg-[#F7F1E6]/40 dark:bg-[#182C26]">
                      <th className="py-3.5 px-4">Legal Guide</th>
                      <th className="py-3.5 px-4">District</th>
                      <th className="py-3.5 px-4">Specialization</th>
                      <th className="py-3.5 px-4">Workload Capacity</th>
                      <th className="py-3.5 px-4">Status & Verification</th>
                      <th className="py-3.5 px-4 text-right">Verification & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1D8] dark:divide-emerald-900/40 text-[#18332B] dark:text-slate-100">
                    {filteredGuides.map((g) => (
                      <tr key={g.id} className="hover:bg-[#F7F1E6]/40 dark:hover:bg-[#182C26]/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={g.name} role="GUIDE" size="sm" showRoleBadge />
                            <div>
                              <div className="font-bold text-[#18332B] dark:text-white flex items-center gap-1.5">
                                <span>{g.name}</span>
                                {g.helperVerified && <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />}
                              </div>
                              <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 font-mono block">{g.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#163D32] dark:text-emerald-300">
                          {g.district || "Statewide"}
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <span className="text-slate-700 dark:text-emerald-200 font-medium block truncate">
                            {g.specializationCategories || g.specialization || "General Legal Aid"}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-emerald-400/50 block">
                            {g.languagesKnown || "Tamil, English"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-[#163D32] dark:text-emerald-400">
                            {g.currentActiveCases || 0} / {g.maxActiveCases || 5} cases
                          </span>
                          <div className="w-24 bg-slate-200 dark:bg-emerald-950 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className="bg-[#163D32] dark:bg-emerald-400 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, ((g.currentActiveCases || 0) / (g.maxActiveCases || 5)) * 100)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase w-fit ${
                              g.status === "ACTIVE"
                                ? "bg-[#DCEBDD] text-[#163D32] dark:bg-emerald-950 dark:text-emerald-300 border border-[#B9D8BD]"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300"
                            }`}>
                              {g.status || "ACTIVE"}
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 dark:text-emerald-400/60">
                              {g.helperVerified ? "✓ Verified Credential" : "⚠️ Unverified"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!g.helperVerified ? (
                              <button
                                onClick={() => handleVerifyGuide(g.id, true)}
                                className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition cursor-pointer"
                              >
                                Verify
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerifyGuide(g.id, false)}
                                className="px-2 py-1 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-bold transition cursor-pointer"
                              >
                                Revoke
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleUserStatus(g.id, g.status || "ACTIVE")}
                              className="px-2 py-1 rounded-xl border border-slate-200 dark:border-emerald-800 bg-white dark:bg-[#182C26] text-slate-700 dark:text-emerald-200 text-[10px] font-bold transition cursor-pointer"
                            >
                              {g.status === "ACTIVE" ? "Suspend" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredGuides.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-10 text-center text-slate-400 dark:text-emerald-200/50 font-medium">
                          No legal guides found for the selected query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DISTRICT REDRESSAL OFFICERS */}
        {/* ========================================================================= */}
        {activeTab === "admins" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-5 sm:p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[#163D32] dark:text-emerald-300 flex items-center gap-2">
                  <Shield size={18} /> Tamil Nadu District Grievance Redressal Officers ({stats.totalAdmins} / 38)
                </h3>
                <p className="text-xs text-[#65736D] dark:text-emerald-200/60 mt-0.5">
                  Assign, reassign, invite, or manage credentials for District Grievance Redressal Officers across all 38 districts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[220px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search by District or Admin..."
                    className="w-full h-9.5 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] pl-8.5 pr-3 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#163D32]"
                  />
                </div>

                <select
                  value={adminStatusFilter}
                  onChange={(e) => setAdminStatusFilter(e.target.value)}
                  className="h-9.5 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] px-3 text-xs text-slate-800 dark:text-white font-medium outline-none focus:border-[#163D32]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Admin</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="UNASSIGNED">Unassigned District</option>
                </select>

                <button
                  onClick={() => setShowCreateAdminModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Create / Assign Admin</span>
                </button>
              </div>
            </div>

            {/* Admins Table */}
            <div className="bg-[#FFFDF8] dark:bg-[#11201B] border border-[#E6E1D8] dark:border-emerald-800/50 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E6E1D8] dark:border-emerald-900/60 text-[#65736D] dark:text-emerald-300 uppercase text-[10px] font-black tracking-wider bg-[#F7F1E6]/40 dark:bg-[#182C26]">
                      <th className="py-3.5 px-4">District</th>
                      <th className="py-3.5 px-4">Assigned Regional Admin</th>
                      <th className="py-3.5 px-4">Designation & Role</th>
                      <th className="py-3.5 px-4">Contact Phone</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1D8] dark:divide-emerald-900/40 text-[#18332B] dark:text-slate-100">
                    {filteredAdmins.map((item) => {
                      const admin = item.admin;
                      const hasAdmin = !!admin;

                      return (
                        <tr key={item.district} className="hover:bg-[#F7F1E6]/40 dark:hover:bg-[#182C26]/60 transition">
                          <td className="py-3.5 px-4 font-bold text-[#163D32] dark:text-emerald-300">
                            {item.district}
                          </td>
                          <td className="py-3.5 px-4">
                            {hasAdmin ? (
                              <div className="flex items-center gap-2.5">
                                <Avatar name={admin.name} role="ADMIN" size="sm" showRoleBadge />
                                <div>
                                  <span className="font-bold text-[#18332B] dark:text-white flex items-center gap-1.5">
                                    <span>{admin.name}</span>
                                    <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                                  </span>
                                  <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 font-mono block">{admin.email}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center gap-1">
                                <AlertTriangle size={12} /> No Admin Configured
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-emerald-200 font-medium">
                            {admin?.specialization || "Regional Administrator"}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-emerald-200">
                            {admin?.mobile || "N/A"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              hasAdmin && admin.status === "ACTIVE"
                                ? "bg-[#DCEBDD] text-[#163D32] dark:bg-emerald-950 dark:text-emerald-300 border border-[#B9D8BD]"
                                : hasAdmin && admin.status === "INVITED"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300"
                            }`}>
                              {hasAdmin ? admin.status : "UNASSIGNED"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {hasAdmin ? (
                                <>
                                  <button
                                    onClick={() => handleToggleUserStatus(admin.id, admin.status)}
                                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                                      admin.status === "ACTIVE"
                                        ? "bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 dark:bg-[#182C26] dark:text-rose-300 dark:border-rose-800"
                                        : "bg-[#163D32] hover:bg-[#1F5948] text-white"
                                    }`}
                                  >
                                    {admin.status === "ACTIVE" ? "Suspend" : "Activate"}
                                  </button>
                                  <button
                                    onClick={() => handleResendAdminInvite(admin.email)}
                                    className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-emerald-800 bg-white dark:bg-[#182C26] text-slate-700 dark:text-emerald-200 text-[10px] font-bold transition cursor-pointer hover:bg-slate-50"
                                    title="Resend Activation / Access Link"
                                  >
                                    Resend Link
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    setAdminFormData(prev => ({ ...prev, district: item.district }));
                                    setShowCreateAdminModal(true);
                                  }}
                                  className="px-3 py-1 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white text-[10px] font-bold transition cursor-pointer shadow-xs"
                                >
                                  + Assign Admin
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/superadmin/regions/${item.district}`)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                                title="Open District Operations"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: AI COMPLIANCE & BLOCKCHAIN AUDIT STREAM */}
        {/* ========================================================================= */}
        {activeTab === "ai_audit" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* AI Analysis Master Widget */}
            <div className="rounded-3xl bg-gradient-to-r from-[#163D32] via-[#1A4538] to-[#112822] text-white p-6 sm:p-8 shadow-lg border border-emerald-600/30 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-400/30">
                    <Bot size={26} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">ARAM Statewide AI Compliance & Integrity Engine</h2>
                    <p className="text-xs text-emerald-200/80 mt-0.5">
                      Autonomous anomaly detection, volunteer workload balancing, unassigned critical triage alerts, and cryptographic blockchain audit.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={triggerStatewideAiSweep}
                    disabled={sweeping}
                    className="px-4.5 py-2.5 rounded-xl bg-white text-[#163D32] hover:bg-emerald-50 text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {sweeping ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#163D32] border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing All 38 Districts...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-[#163D32]" />
                        <span>Run Full Compliance Sweep</span>
                      </>
                    )}
                  </button>

                  <Link
                    to="/superadmin/audit-logs"
                    className="px-4 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-white text-xs font-bold border border-emerald-500/30 transition flex items-center gap-1.5"
                  >
                    <Activity size={14} />
                    <span>View Immutable Audit Logs</span>
                  </Link>
                </div>
              </div>

              {/* Sweep Results Card */}
              {sweepResults && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 bg-white/5 p-5 rounded-2xl border border-white/10 text-white text-xs animate-in fade-in duration-300">
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Register Scan Overview</span>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between border-b border-white/10 pb-1.5">
                        <span className="text-emerald-100/70">Scanned Complaints:</span>
                        <span className="font-bold">{sweepResults.totalScannedComplaints}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-1.5">
                        <span className="text-emerald-100/70">Scanned User Profiles:</span>
                        <span className="font-bold">{sweepResults.totalScannedUsers}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-1.5">
                        <span className="text-emerald-100/70">Unassigned Grievances:</span>
                        <span className="font-bold text-amber-300">{sweepResults.unassignedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-100/70">Overloaded Guides:</span>
                        <span className="font-bold text-amber-300">{sweepResults.overloadedGuidesCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-300">Critical Unassigned Cases ({sweepResults.criticalUnassignedCount})</span>
                    {sweepResults.criticalList.length > 0 ? (
                      <div className="space-y-2">
                        {sweepResults.criticalList.map(c => (
                          <div key={c.id} className="p-2 bg-rose-950/40 rounded-lg border border-rose-500/30 flex items-center justify-between">
                            <div className="truncate pr-2">
                              <span className="font-bold truncate block">{c.title}</span>
                              <span className="text-[9px] text-rose-200/70">{c.district} • {c.priority}</span>
                            </div>
                            <button
                              onClick={() => openAssignModal(c)}
                              className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold cursor-pointer shrink-0"
                            >
                              Dispatch
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-emerald-200/70 font-medium">All critical cases have assigned Legal Guides.</p>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Districts Needing Admin ({sweepResults.districtsNoAdminCount})</span>
                    {sweepResults.districtsNoAdminList.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {sweepResults.districtsNoAdminList.slice(0, 8).map(d => (
                          <button
                            key={d}
                            onClick={() => {
                              setAdminFormData(prev => ({ ...prev, district: d }));
                              setShowCreateAdminModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-bold text-white transition flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={10} />
                            <span>{d}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-emerald-200/70 font-medium">All 38 districts have active Regional Administrators configured.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Blockchain Ledger Health & Quick Audit Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#163D32] dark:text-emerald-300 font-extrabold text-sm">
                  <ShieldCheck size={18} />
                  <span>Blockchain Cryptographic Security</span>
                </div>
                <p className="text-xs text-[#65736D] dark:text-emerald-200/70 font-medium leading-relaxed">
                  Every user action, guide assignment, and status alteration is cryptographically hashed and sequenced into an immutable SHA-256 block ledger.
                </p>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Ledger Hash Chain: SECURE & VERIFIED</span>
                  </div>
                  <Link to="/superadmin/audit-logs" className="text-xs font-bold text-[#163D32] dark:text-emerald-300 hover:underline">
                    Verify Chain →
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#163D32] dark:text-emerald-300 font-extrabold text-sm">
                  <Activity size={18} />
                  <span>Tamil Nadu AI Caseload Optimizer</span>
                </div>
                <p className="text-xs text-[#65736D] dark:text-emerald-200/70 font-medium leading-relaxed">
                  The AI matching engine continuously analyzes complaint urgency, district legal jurisdiction, language preference, and volunteer Elo ratings.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-emerald-900/40 text-xs">
                  <span className="text-[#65736D] dark:text-emerald-300/70 font-bold">Matching Accuracy</span>
                  <span className="font-black text-[#163D32] dark:text-emerald-400">Verified AI Triage</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: CREATE DISTRICT ADMIN */}
        {/* ========================================================================= */}
        {showCreateAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#11201B] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-emerald-800 shadow-2xl space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900/50 pb-3">
                <div className="flex items-center gap-2 text-[#163D32] dark:text-emerald-300">
                  <Shield size={20} />
                  <h3 className="text-lg font-black">Assign / Create District Admin</h3>
                </div>
                <button
                  onClick={() => setShowCreateAdminModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateAdminSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                    District Jurisdiction *
                  </label>
                  <select
                    value={adminFormData.district}
                    onChange={(e) => setAdminFormData({ ...adminFormData, district: e.target.value })}
                    required
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-bold text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                  >
                    {TN_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d} District</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={adminFormData.name}
                    onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-medium text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                      placeholder="e.g. coimbatore.admin@aram.ai"
                      required
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-medium text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={adminFormData.mobile}
                      onChange={(e) => setAdminFormData({ ...adminFormData, mobile: e.target.value })}
                      placeholder="9876543210"
                      required
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-medium text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={adminFormData.designation}
                      onChange={(e) => setAdminFormData({ ...adminFormData, designation: e.target.value })}
                      placeholder="Regional Administrator"
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-medium text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                      Initial Password
                    </label>
                    <input
                      type="text"
                      value={adminFormData.password}
                      onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                      placeholder="Admin@123"
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-medium text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-emerald-900/50">
                  <button
                    type="button"
                    onClick={() => setShowCreateAdminModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 text-slate-600 dark:text-emerald-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-5 py-2.5 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submittingAction ? "Creating..." : "Confirm & Create Admin"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ONBOARD LEGAL GUIDE */}
        {/* ========================================================================= */}
        {showCreateGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#11201B] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-emerald-800 shadow-2xl space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900/50 pb-3">
                <div className="flex items-center gap-2 text-[#163D32] dark:text-emerald-300">
                  <UserCheck size={20} />
                  <h3 className="text-lg font-black">Onboard Legal Aid Guide</h3>
                </div>
                <button
                  onClick={() => setShowCreateGuideModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateGuideSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                      Assigned District *
                    </label>
                    <select
                      value={guideFormData.district}
                      onChange={(e) => setGuideFormData({ ...guideFormData, district: e.target.value })}
                      required
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-bold text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                    >
                      {TN_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                      Gender
                    </label>
                    <select
                      value={guideFormData.gender}
                      onChange={(e) => setGuideFormData({ ...guideFormData, gender: e.target.value })}
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-medium text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female (Women Trained)</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={guideFormData.name}
                    onChange={(e) => setGuideFormData({ ...guideFormData, name: e.target.value })}
                    placeholder="e.g. Adv. S. Priya"
                    required
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-medium text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={guideFormData.email}
                      onChange={(e) => setGuideFormData({ ...guideFormData, email: e.target.value })}
                      placeholder="guide.priya@gmail.com"
                      required
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-medium text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={guideFormData.mobile}
                      onChange={(e) => setGuideFormData({ ...guideFormData, mobile: e.target.value })}
                      placeholder="9845123456"
                      required
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-medium text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                    Specializations (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={guideFormData.specializationCategories}
                    onChange={(e) => setGuideFormData({ ...guideFormData, specializationCategories: e.target.value })}
                    placeholder="CIVIL_RIGHTS, PROPERTY_DISPUTE, DOMESTIC_VIOLENCE"
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-medium text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-emerald-900/50">
                  <button
                    type="button"
                    onClick={() => setShowCreateGuideModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 text-slate-600 dark:text-emerald-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-5 py-2.5 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submittingAction ? "Onboarding..." : "Confirm & Onboard Guide"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: DISPATCH LEGAL GUIDE TO COMPLAINT */}
        {/* ========================================================================= */}
        {showAssignModal && selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#11201B] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-emerald-800 shadow-2xl space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900/50 pb-3">
                <div>
                  <h3 className="text-base font-black text-[#163D32] dark:text-emerald-300">
                    Dispatch Legal Guide • {selectedComplaint.complaintCustomId || `ARAM-${selectedComplaint.id}`}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-emerald-200/60 truncate max-w-xs">{selectedComplaint.title}</p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* AI Recommended Suggestions */}
              {loadingRecommendations ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#182C26] text-center text-xs text-slate-500">
                  <RefreshCw size={16} className="animate-spin mx-auto mb-1 text-[#163D32]" />
                  <span>Computing optimal AI guide matches...</span>
                </div>
              ) : recommendedGuides.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1F5948] dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles size={12} /> AI Top Recommended Guides:
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {recommendedGuides.slice(0, 3).map((rec) => (
                      <div
                        key={rec.id || rec.volunteerId}
                        onClick={() => setSelectedGuideId(rec.id || rec.volunteerId)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                          selectedGuideId == (rec.id || rec.volunteerId)
                            ? "bg-[#DCEBDD] text-[#163D32] border-[#163D32] font-black"
                            : "bg-slate-50 dark:bg-[#182C26] border-slate-200 dark:border-emerald-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100"
                        }`}
                      >
                        <div>
                          <p className="font-bold">{rec.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-emerald-300/70">{rec.district} • Match: {rec.matchScore ? `${Math.round(rec.matchScore * 100)}%` : "High"}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Select</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleAssignGuideSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                    Select Guide for {selectedComplaint.district || "this region"} *
                  </label>
                  <select
                    value={selectedGuideId}
                    onChange={(e) => setSelectedGuideId(e.target.value)}
                    required
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-bold text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                  >
                    <option value="">-- Choose Legal Guide --</option>
                    {users
                      .filter(u => u.role === "HELPER" || u.role === "VOLUNTEER" || u.role === "GUIDE")
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.district || "Statewide"} • {u.currentActiveCases || 0}/{u.maxActiveCases || 5} cases)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                    Dispatch Note / Reason
                  </label>
                  <textarea
                    rows={2}
                    value={assignReason}
                    onChange={(e) => setAssignReason(e.target.value)}
                    placeholder="e.g. Priority legal triage assigned via statewide super admin oversight."
                    className="w-full rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] p-2.5 font-medium text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-emerald-900/50">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-800 text-slate-600 dark:text-emerald-200 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction || !selectedGuideId}
                    className="px-5 py-2 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white font-bold transition shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submittingAction ? "Dispatching..." : "Confirm Dispatch"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: UPDATE COMPLAINT STATUS */}
        {/* ========================================================================= */}
        {showStatusModal && selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#11201B] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-emerald-800 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900/50 pb-3">
                <h3 className="text-sm font-black text-[#163D32] dark:text-emerald-300">
                  Update Status • {selectedComplaint.complaintCustomId || `ARAM-${selectedComplaint.id}`}
                </h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                    New Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-bold text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="HELPER_ASSIGNED">HELPER_ASSIGNED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                    Status Update Note
                  </label>
                  <textarea
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add audit log reason..."
                    className="w-full rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] p-2.5 font-medium text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-emerald-900/50">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-800 text-slate-600 dark:text-emerald-200 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-5 py-2 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white font-bold transition shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submittingAction ? "Saving..." : "Update Status"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
