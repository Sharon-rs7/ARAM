import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Shield, Search, Filter, Calendar } from "lucide-react";

const initialLogs = [
  {
    id: "LOG1001",
    actor: "Admin (Rajesh Kumar)",
    action: "User Verified",
    target: "Volunteer (Sharon Robert)",
    time: "2026-07-03 12:45:10",
    status: "SUCCESS"
  },
  {
    id: "LOG1002",
    actor: "Admin (Rajesh Kumar)",
    action: "Case Assigned",
    target: "Complaint #CMP1023 to Volunteer",
    time: "2026-07-03 11:30:22",
    status: "SUCCESS"
  },
  {
    id: "LOG1003",
    actor: "Volunteer (Sharon Robert)",
    action: "Status Updated",
    target: "Complaint #CMP1024 -> In Progress",
    time: "2026-07-03 10:15:05",
    status: "SUCCESS"
  },
  {
    id: "LOG1004",
    actor: "System AI",
    action: "OCR Verification Scan",
    target: "Document DOC101 (Salary Slip)",
    time: "2026-07-03 09:00:12",
    status: "SUCCESS"
  }
];

export default function AuditLogs() {
  const [logs] = useState(initialLogs);
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter(log => 
    log.actor.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Audit Logs</h1>
          <p className="mt-2 text-slate-500">
            Monitor system activities, role assignments, and automated AI security scans.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 h-12 w-full rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
            />
          </div>
          
          <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-medium text-slate-650 cursor-pointer">
            <Filter size={18} />
            Filter Logs
          </button>
        </div>

        {/* Logs Table */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-blue-650" size={26} />
            <h2 className="text-2xl font-bold text-slate-900">Security Audit Logs</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-sm font-semibold">
                  <th className="pb-4">Log ID</th>
                  <th className="pb-4">Actor</th>
                  <th className="pb-4">Action</th>
                  <th className="pb-4">Target Details</th>
                  <th className="pb-4">Timestamp</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 font-mono font-semibold">{log.id}</td>
                      <td className="py-4 font-medium text-slate-850">{log.actor}</td>
                      <td className="py-4">{log.action}</td>
                      <td className="py-4 text-slate-500">{log.target}</td>
                      <td className="py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar size={13} /> {log.time}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-150">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No matching audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
