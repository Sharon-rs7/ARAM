import React, { useState } from "react";
import { UserCheck, Search, CheckCircle, Shield, Plus, X, User, Mail, Phone, MapPin } from "lucide-react";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

export default function GuideDirectory({ guides = [], district = "Salem", onGuideAdded = () => {} }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "MALE",
    languagesKnown: "Tamil, English",
    specializationCategories: "GENERAL_LEGAL_AID,LABOUR_DISPUTE",
    experienceLevel: "3 years",
    maxActiveCases: 5,
    womenSupportTrained: false,
    canHandleSensitiveCases: false
  });

  const handleCreateGuide = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      toast.error("Mobile number must be a valid 10-digit Indian number.");
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createVolunteer({ ...formData, district });
      toast.success(`Legal Guide ${formData.name} successfully onboarded for ${district}!`);
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        mobile: "",
        gender: "MALE",
        languagesKnown: "Tamil, English",
        specializationCategories: "GENERAL_LEGAL_AID,LABOUR_DISPUTE",
        experienceLevel: "3 years",
        maxActiveCases: 5,
        womenSupportTrained: false,
        canHandleSensitiveCases: false
      });
      onGuideAdded();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Failed to onboard guide.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = guides.filter((g) =>
    g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.district?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-[#163D32] text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
            <UserCheck size={16} className="text-[#1F5948]" /> Verified Legal Guides Directory
          </h3>
          <p className="text-[#65736D] text-xs mt-0.5 font-medium">
            Active volunteer legal advisors in {district} jurisdiction ({guides.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Guide Name, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-[#18332B] focus:border-[#1F5948] focus:ring-2 focus:ring-[#DCEBDD] outline-none w-64 placeholder-[#8B9690]"
            />
            <Search size={14} className="absolute left-3 top-3 text-[#65736D]" />
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 active:scale-95"
          >
            <Plus size={14} />
            <span>+ Add Legal Guide</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E6E1D8] text-[#65736D] uppercase text-[10px] font-black tracking-wider bg-[#F7F1E6]/40">
              <th className="py-3 px-4">Guide Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">District</th>
              <th className="py-3 px-4">Experience</th>
              <th className="py-3 px-4">Active Cases</th>
              <th className="py-3 px-4">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E1D8] text-[#18332B]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-[#65736D] font-medium">
                  No legal guides found in this directory.
                </td>
              </tr>
            ) : (
              filtered.map((g) => (
                <tr key={g.id} className="hover:bg-[#F7F1E6]/50 transition duration-100">
                  <td className="py-3.5 px-4 font-bold text-[#18332B]">
                    {g.name}
                  </td>
                  <td className="py-3.5 px-4 text-[#65736D] font-medium">
                    {g.email}
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[#18332B] font-semibold">
                    {g.district}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6]">
                      {g.experienceLevel || "Senior"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#163D32]">
                    {g.activeCasesCount || 0}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[#163D32] font-bold flex items-center gap-1">
                      <Shield size={13} className="text-[#1F5948]" /> Verified
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Onboard Legal Guide Modal for this specific Region */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#E6E1D8] shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-3">
              <div className="flex items-center gap-2 text-[#163D32]">
                <UserCheck size={18} className="text-[#1F5948]" />
                <h3 className="text-base font-black">Onboard Guide for {district}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-[#8B9690] hover:text-[#18332B] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGuide} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#18332B] uppercase tracking-wider text-[10px] mb-1">
                    Assigned Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={district}
                    disabled
                    className="w-full h-9.5 rounded-xl border border-[#DCEBDD] bg-[#DCEBDD]/30 px-3 font-bold text-[#163D32] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#18332B] uppercase tracking-wider text-[10px] mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full h-9.5 rounded-xl border border-[#E6E1D8] bg-white px-3 font-medium text-[#18332B] outline-none focus:border-[#163D32]"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female (Women Support)</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#18332B] uppercase tracking-wider text-[10px] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adv. K. Murugan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-9.5 rounded-xl border border-[#E6E1D8] bg-white px-3 font-medium text-[#18332B] outline-none focus:border-[#163D32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#18332B] uppercase tracking-wider text-[10px] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="guide@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-9.5 rounded-xl border border-[#E6E1D8] bg-white px-3 font-medium text-[#18332B] outline-none focus:border-[#163D32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#18332B] uppercase tracking-wider text-[10px] mb-1">
                    Mobile Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "") })}
                    className="w-full h-9.5 rounded-xl border border-[#E6E1D8] bg-white px-3 font-medium text-[#18332B] outline-none focus:border-[#163D32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#18332B] uppercase tracking-wider text-[10px] mb-1">
                    Primary Specialization
                  </label>
                  <select
                    value={formData.specializationCategories}
                    onChange={(e) => setFormData({ ...formData, specializationCategories: e.target.value })}
                    className="w-full h-9.5 rounded-xl border border-[#E6E1D8] bg-white px-3 font-medium text-[#18332B] outline-none focus:border-[#163D32]"
                  >
                    <option value="GENERAL_LEGAL_AID,LABOUR_DISPUTE">Labour & General Legal Aid</option>
                    <option value="WOMEN_SAFETY_DOMESTIC_VIOLENCE,CRIMINAL_COMPLAINT">Women Safety & Criminal</option>
                    <option value="PROPERTY_CIVIL_DISPUTE,CONSUMER_COMPLAINT">Property & Consumer Law</option>
                    <option value="CYBER_CRIME,CIVIL_RIGHTS">Cyber Crime & Civil Rights</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#18332B] uppercase tracking-wider text-[10px] mb-1">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full h-9.5 rounded-xl border border-[#E6E1D8] bg-white px-3 font-medium text-[#18332B] outline-none focus:border-[#163D32]"
                  >
                    <option value="1-2 years">Junior (1-2 years)</option>
                    <option value="3-5 years">Intermediate (3-5 years)</option>
                    <option value="5+ years">Senior (5+ years)</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F7F1E6]/60 border border-[#E6E1D8] text-[11px] text-[#65736D]">
                Initial login password will be default: <code className="font-mono font-bold text-[#163D32]">Helper@123</code>. The guide can change it upon initial login.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#E6E1D8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6E1D8] text-[#65736D] text-xs font-bold hover:bg-[#F7F1E6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Onboarding..." : "Confirm & Onboard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
