import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  Users,
  UserPlus,
  BadgeCheck,
  Clock3,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  BarChart3
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { toast } from "sonner";
import SearchInput from "@/components/common/SearchInput";


const ManageVolunteers = () => {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "FEMALE",
    district: "Coimbatore",
    languagesKnown: "English,Tamil",
    specializationCategories: "GENERAL_LEGAL_AID",
    maxActiveCases: 5,
    womenSupportTrained: false,
    canHandleSensitiveCases: false,
    serviceArea: "Legal Triage",
    subSpecializations: "General Practice",
    experienceLevel: "Intermediate"
  });

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getVolunteers();
      setVolunteers(data || []);
    } catch (e) {
      toast.error("Failed to load volunteers from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.mobile) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error("Mobile number must be a valid 10-digit Indian number.");
      return;
    }

    try {
      const result = await adminService.createVolunteer(form);
      const tempPassword = "AramVol@" + form.mobile.substring(6);
      toast.success(
        <div className="space-y-1">
          <p className="font-bold text-green-700">Legal Guide account created!</p>
          <p className="text-xs">Temp Password: <span className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold select-all text-slate-800">{tempPassword}</span></p>
        </div>,
        { duration: 10000 }
      );
      setShowAddModal(false);
      // Reset form
      setForm({
        name: "",
        email: "",
        mobile: "",
        gender: "FEMALE",
        district: "Coimbatore",
        languagesKnown: "English,Tamil",
        specializationCategories: "GENERAL_LEGAL_AID",
        maxActiveCases: 5,
        womenSupportTrained: false,
        canHandleSensitiveCases: false,
        serviceArea: "Legal Triage",
        subSpecializations: "General Practice",
        experienceLevel: "Intermediate"
      });
      fetchVolunteers();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create legal guide account.";
      toast.error(msg);
    }
  };

  const handleVerify = async (id) => {
    try {
      await adminService.verifyVolunteer(id);
      toast.success("Legal Guide profile status updated to Active.");
      fetchVolunteers();
    } catch (e) {
      toast.error("Failed to verify legal guide.");
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectVolunteer(id);
      toast.success("Legal Guide status updated to Suspended.");
      fetchVolunteers();
    } catch (e) {
      toast.error("Failed to suspend legal guide.");
    }
  };

  const filteredVolunteers = volunteers.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase()) ||
      item.district?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Legal Guides</h1>
            <p className="text-sm text-slate-500 mt-0.5">Assign specializations and track workload parameters dynamically.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white tracking-wide shadow-md transition hover:bg-blue-700 hover:shadow-lg active:scale-95"
          >
            <UserPlus size={16} />
            ADD LEGAL GUIDE
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><Users size={24} /></div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Legal Guides</p>
              <h2 className="text-2xl font-bold text-slate-800 mt-0.5">{volunteers.length}</h2>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-50 text-green-600"><BadgeCheck size={24} /></div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active</p>
              <h2 className="text-2xl font-bold text-slate-800 mt-0.5">
                {volunteers.filter((v) => v.status === "ACTIVE").length}
              </h2>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600"><Clock3 size={24} /></div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Sensitive Trained</p>
              <h2 className="text-2xl font-bold text-slate-800 mt-0.5">
                {volunteers.filter((v) => v.womenSupportTrained).length}
              </h2>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-50 text-red-600"><UserX size={24} /></div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Suspended</p>
              <h2 className="text-2xl font-bold text-slate-800 mt-0.5">
                {volunteers.filter((v) => v.status === "SUSPENDED").length}
              </h2>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="rounded-2xl border border-slate-150 bg-white p-4 shadow-sm flex items-center gap-4">
          <SearchInput
            placeholder="Search by name, email, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            className="flex-1"
          />
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer shrink-0">
            <Filter size={14} />
            Filter
          </button>
        </div>



        {/* Table representation */}
        <div className="rounded-2xl border border-slate-150 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Name / ID</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Specialization</th>
                  <th className="px-6 py-4">Languages</th>
                  <th className="px-6 py-4">Workload</th>
                  <th className="px-6 py-4">Safety training</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400">
                      Loading legal guide list...
                    </td>
                  </tr>
                ) : filteredVolunteers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400">
                      No legal guides matching your search parameters were found.
                    </td>
                  </tr>
                ) : (
                  filteredVolunteers.map((vol) => (
                    <tr key={vol.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{vol.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{vol.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">{vol.district}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(vol.specializationCategories || vol.specialization || "GENERAL_LEGAL_AID")
                            .split(",")
                            .map((tag) => (
                              <span key={tag} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[10px] uppercase border border-blue-100">
                                {tag.replace("_", " ")}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {vol.languagesKnown || vol.preferredLanguage || "English"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{vol.currentActiveCases}</span>
                          <span className="text-slate-400">/</span>
                          <span className="text-slate-500">{vol.maxActiveCases || 5}</span>
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, ((vol.currentActiveCases || 0) / (vol.maxActiveCases || 5)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {vol.womenSupportTrained && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                              <HeartHandshake size={12} /> Woman comfort trained
                            </span>
                          )}
                          {vol.canHandleSensitiveCases && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 uppercase">
                              <ShieldCheck size={12} /> Sensitive Cases Cert
                            </span>
                          )}
                          {!vol.womenSupportTrained && !vol.canHandleSensitiveCases && (
                            <span className="text-xs text-slate-400">Standard Advocacy</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/volunteers/${vol.id}/analytics`)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 text-xs font-semibold transition cursor-pointer"
                          >
                            <BarChart3 size={14} /> Analytics
                          </button>
                          {vol.status !== "ACTIVE" ? (
                            <button
                              onClick={() => handleVerify(vol.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 border border-green-150 text-green-700 text-xs font-semibold transition"
                            >
                              <UserCheck size={14} /> Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReject(vol.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-150 text-red-700 text-xs font-semibold transition"
                            >
                              <UserX size={14} /> Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Volunteer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-[650px] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><UserPlus size={18} /></div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Add New Advocate Profile</h2>
                    <p className="text-xs text-slate-400">Admin-exclusive setup of legal guide matching parameters.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-5 overflow-y-auto">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="John Doe"
                        className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        placeholder="advocate@aram.ai"
                        className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile Number *</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        required
                        placeholder="9876543210"
                        className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender comfort tag</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Operating District</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        name="district"
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                        placeholder="Coimbatore"
                        className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Languages (Comma separated)</label>
                    <input
                      type="text"
                      name="languagesKnown"
                      value={form.languagesKnown}
                      onChange={(e) => setForm({ ...form, languagesKnown: e.target.value })}
                      placeholder="English,Tamil"
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category Specialization</label>
                    <select
                      value={form.specializationCategories}
                      onChange={(e) => setForm({ ...form, specializationCategories: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition"
                    >
                      <option value="GENERAL_LEGAL_AID">General Legal Aid</option>
                      <option value="LABOUR_DISPUTE">Labour Dispute</option>
                      <option value="CONSUMER_COMPLAINT">Consumer protection</option>
                      <option value="CYBER_CRIME">Cyber Crime Cell</option>
                      <option value="PROPERTY_CIVIL_DISPUTE">Property/Civil disputes</option>
                      <option value="WOMEN_SAFETY_DOMESTIC_VIOLENCE">Women safety/Domestic violence</option>
                      <option value="CRIMINAL_COMPLAINT">Criminal Grievance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Max Active Cases</label>
                    <input
                      type="number"
                      name="maxActiveCases"
                      value={form.maxActiveCases}
                      onChange={(e) => setForm({ ...form, maxActiveCases: parseInt(e.target.value) || 5 })}
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.womenSupportTrained}
                      onChange={(e) => setForm({ ...form, womenSupportTrained: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-50 h-4 w-4"
                    />
                    <span className="text-xs text-slate-600 font-semibold">Trained in Women Support Protocols</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.canHandleSensitiveCases}
                      onChange={(e) => setForm({ ...form, canHandleSensitiveCases: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-50 h-4 w-4"
                    />
                    <span className="text-xs text-slate-600 font-semibold">Certified to Handle Sensitive Cases</span>
                  </label>
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="h-10 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
                  >
                    CREATE ADVOCATE
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageVolunteers;