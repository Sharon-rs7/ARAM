import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock3,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialNotifications = [
  {
    id: 1,
    title: "Complaint Submitted",
    message: "Your complaint CMP1023 has been submitted successfully.",
    type: "success",
    time: "5 mins ago",
    read: false,
  },
  {
    id: 2,
    title: "Officer Assigned",
    message: "Municipality Officer has been assigned to your complaint.",
    type: "info",
    time: "30 mins ago",
    read: false,
  },
  {
    id: 3,
    title: "AI Analysis Completed",
    message: "AI has generated legal recommendations.",
    type: "warning",
    time: "1 hour ago",
    read: true,
  },
  {
    id: 4,
    title: "Complaint Resolved",
    message: "Complaint CMP1018 has been marked as resolved.",
    type: "success",
    time: "Yesterday",
    read: true,
  },
];

const Notifications = () => {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllRead = () => {

    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    );

  };

  const clearAll = () => {

    setNotifications([]);

  };

  const getIcon = (type) => {

    switch (type) {

      case "success":
        return (
          <CheckCircle2
            className="text-green-600"
            size={24}
          />
        );

      case "warning":
        return (
          <AlertTriangle
            className="text-yellow-600"
            size={24}
          />
        );

      default:
        return (
          <Info
            className="text-blue-600"
            size={24}
          />
        );

    }

  };

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold">

              Notifications

            </h1>

            <p className="mt-2 text-slate-500">

              Stay updated with your complaint progress.

            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={() => navigate("/citizen/dashboard")}
              className="rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-100"
            >

              Dashboard

            </button>

            <button
              onClick={markAllRead}
              className="rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-100"
            >

              Mark All Read

            </button>

            <button
              onClick={clearAll}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-white hover:bg-red-600"
            >

              <Trash2 size={18} />

              Clear

            </button>

          </div>

        </div>

        {/* Notification List */}

        <div className="space-y-5">

          {notifications.map((item) => (

            <div
              key={item.id}
              onClick={() => navigate("/citizen/complaint/1")}
              className={`cursor-pointer rounded-3xl border-l-4 bg-white p-6 shadow-sm transition hover:bg-slate-50 ${
                item.read
                  ? "border-slate-300"
                  : "border-blue-600"
              }`}
            >

              <div className="flex items-start gap-5">

                <div>

                  {getIcon(item.type)}

                </div>

                <div className="flex-1">

                  <div className="flex items-center justify-between">

                    <h3 className="text-xl font-semibold">

                      {item.title}

                    </h3>

                    {!item.read && (

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">

                        NEW

                      </span>

                    )}

                  </div>

                  <p className="mt-3 leading-7 text-slate-600">

                    {item.message}

                  </p>

                  <div className="mt-5 flex items-center gap-2 text-slate-400">

                    <Clock3 size={16} />

                    {item.time}

                  </div>

                </div>

              </div>

            </div>

          ))}        </div>

        {/* Empty State */}

        {notifications.length === 0 && (

          <div className="rounded-3xl bg-white p-16 text-center shadow-sm">

            <Bell
              size={70}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-6 text-2xl font-bold">

              No Notifications

            </h2>

            <p className="mt-3 text-slate-500">

              You're all caught up.
              New complaint updates will appear here.

            </p>

            <button
              onClick={() => navigate("/citizen/dashboard")}
              className="mt-8 rounded-xl bg-blue-600 px-8 py-3 text-white transition hover:bg-blue-700"
            >

              Go to Dashboard

            </button>

          </div>

        )}

      </div>

    </DashboardLayout>

  );

};

export default Notifications;