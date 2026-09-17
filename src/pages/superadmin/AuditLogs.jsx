import DashboardLayout from "@/components/common/DashboardLayout";
import { useState, useEffect } from "react";
import { Shield, Search, Filter, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { adminService } from "@/services/adminService";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({
        page,
        size: 10,
        action: search,
        role: roleFilter,
        from,
        to
      });
      setLogs(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, roleFilter, from, to]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadLogs();
  };

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
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />

            <input
              type="text"
              placeholder="Search actions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 h-12 w-full rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
              className="px-4 h-12 w-full rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">All Actor Roles</option>
              <option value="CITIZEN">Public User</option>
              <option value="HELPER">Legal Guide</option>
              <option value="ADMIN">Admin</option>
              <option value="SYSTEM">System AI</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 uppercase font-semibold">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(0);
              }}
              className="px-3 h-12 w-full rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 uppercase font-semibold">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(0);
              }}
              className="px-3 h-12 w-full rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm bg-white"
            />
          </div>
        </form>

        {/* Logs Table */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="text-blue-600" size={26} />
              <h2 className="text-2xl font-bold text-slate-900">Security Audit Logs</h2>
            </div>
            <span className="text-sm font-semibold text-slate-500">
              Total: {totalElements} logs
            </span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-slate-500 font-semibold">
                Loading audit logs...
              </div>
            ) : (
              <>
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
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition">
                          <td className="py-4 font-mono font-semibold">LOG{log.id}</td>
                          <td className="py-4 font-medium text-slate-800">{log.performedBy}</td>
                          <td className="py-4">{log.action}</td>
                          <td className="py-4 text-slate-500">{log.details}</td>
                          <td className="py-4 whitespace-nowrap">
                            <span className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Calendar size={13} /> {log.timestamp ? log.timestamp.replace('T', ' ').substring(0, 19) : ""}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              log.status === "FAILED" ? "bg-red-50 text-red-700 border-red-150" : "bg-green-50 text-green-700 border-green-150"
                            }`}>
                              {log.status || "SUCCESS"}
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

                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 mt-6 pt-6">
                  <span className="text-sm text-slate-500">
                    Page {page + 1} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
