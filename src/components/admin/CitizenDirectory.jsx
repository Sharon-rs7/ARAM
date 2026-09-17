import React, { useState } from "react";
import { Users, Search, CheckCircle, Clock } from "lucide-react";

export default function CitizenDirectory({ citizens = [] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = citizens.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-[#163D32] text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
            <Users size={16} className="text-[#1F5948]" /> Registered Citizens Directory
          </h3>
          <p className="text-[#65736D] text-xs mt-0.5 font-medium">
            Scoped to local regional jurisdiction ({citizens.length} registered)
          </p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Name, Email, or Mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-[#18332B] focus:border-[#1F5948] focus:ring-2 focus:ring-[#DCEBDD] outline-none w-72 placeholder-[#8B9690]"
          />
          <Search size={14} className="absolute left-3 top-3 text-[#65736D]" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E6E1D8] text-[#65736D] uppercase text-[10px] font-black tracking-wider bg-[#F7F1E6]/40">
              <th className="py-3 px-4">Citizen Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">District</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4">Profile Verified</th>
              <th className="py-3 px-4">Verification Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E1D8] text-[#18332B]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-[#65736D] font-medium">
                  No citizens found in this district directory.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#F7F1E6]/50 transition duration-100">
                  <td className="py-3.5 px-4 font-bold text-[#18332B]">
                    {c.name}
                  </td>
                  <td className="py-3.5 px-4 text-[#65736D] font-medium">
                    {c.email}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#65736D]">
                    {c.mobile || "N/A"}
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[#18332B] font-semibold">
                    {c.district}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        c.status === "ACTIVE"
                          ? "bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6]"
                          : "bg-[#E8C978]/30 text-[#C58A25] border border-[#D6B45E]"
                      }`}
                    >
                      {c.status || "ACTIVE"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {c.profileVerified ? (
                      <span className="text-[#163D32] font-bold flex items-center gap-1">
                        <CheckCircle size={13} className="text-[#1F5948]" /> Verified
                      </span>
                    ) : (
                      <span className="text-[#65736D] font-medium flex items-center gap-1">
                        <Clock size={13} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#163D32]">
                    {c.verificationScore != null ? `${c.verificationScore}%` : "85%"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
