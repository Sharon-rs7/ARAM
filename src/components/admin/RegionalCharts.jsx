import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

const COLORS = ["#163D32", "#1F5948", "#2E7D5B", "#C58A25", "#B96845", "#C94B4B", "#7E948B"];

export default function RegionalCharts({ data }) {
  if (!data) return <div className="text-[#65736D] text-sm">Loading charts...</div>;

  // Process data for Recharts
  const trendData = data.complaintTrend || [];
  const statusData = Object.entries(data.statusDistribution || {}).map(([key, val]) => ({
    name: key.replace(/_/g, " "),
    value: val
  }));
  const categoryData = Object.entries(data.categoryDistribution || {}).map(([key, val]) => ({
    name: key.replace(/_/g, " "),
    count: val
  }));
  const priorityData = Object.entries(data.priorityDistribution || {}).map(([key, val]) => ({
    name: key,
    count: val
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Chart 1: Complaint Trend */}
      <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm">
        <h3 className="text-[#163D32] text-sm font-extrabold mb-4 uppercase tracking-wider">
          Grievance Submission Trend
        </h3>
        <div className="h-64">
          {trendData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[#65736D] text-xs font-medium">
              No trend records available for selected period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E1D8" />
                <XAxis dataKey="date" stroke="#65736D" fontSize={11} />
                <YAxis stroke="#65736D" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#FFFDF8", borderColor: "#E6E1D8", borderRadius: "12px", color: "#18332B" }} />
                <Area type="monotone" dataKey="count" stroke="#163D32" fill="#DCEBDD" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Status Distribution */}
      <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm">
        <h3 className="text-[#163D32] text-sm font-extrabold mb-4 uppercase tracking-wider">
          Case Status Distribution
        </h3>
        <div className="h-64 flex items-center justify-center">
          {statusData.length === 0 ? (
            <div className="text-[#65736D] text-xs font-medium">No status data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#FFFDF8", borderColor: "#E6E1D8", borderRadius: "12px", color: "#18332B" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 3: Category Distribution */}
      <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm">
        <h3 className="text-[#163D32] text-sm font-extrabold mb-4 uppercase tracking-wider">
          Legal Case Categories
        </h3>
        <div className="h-64">
          {categoryData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[#65736D] text-xs font-medium">
              No category data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E1D8" />
                <XAxis dataKey="name" stroke="#65736D" fontSize={10} angle={-20} textAnchor="end" height={50} />
                <YAxis stroke="#65736D" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#FFFDF8", borderColor: "#E6E1D8", borderRadius: "12px", color: "#18332B" }} />
                <Bar dataKey="count" fill="#1F5948" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 4: Priority Breakdown */}
      <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm">
        <h3 className="text-[#163D32] text-sm font-extrabold mb-4 uppercase tracking-wider">
          Priority Level Breakdown
        </h3>
        <div className="h-64">
          {priorityData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[#65736D] text-xs font-medium">
              No priority data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E1D8" />
                <XAxis dataKey="name" stroke="#65736D" fontSize={11} />
                <YAxis stroke="#65736D" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#FFFDF8", borderColor: "#E6E1D8", borderRadius: "12px", color: "#18332B" }} />
                <Bar dataKey="count" fill="#C58A25" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
