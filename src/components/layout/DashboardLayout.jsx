import { Outlet, useLocation } from "react-router-dom";
import Topbar from "./Topbar";
import useActivityTracker from "../../hooks/useActivityTracker";

import CitizenSidebar from "./CitizenSidebar";
import VolunteerSidebar from "./VolunteerSidebar";
import AdminSidebar from "./AdminSidebar";

const DashboardLayout = ({ children }) => {
  useActivityTracker();
  const location = useLocation();

  const renderSidebar = () => {

    if (location.pathname.startsWith("/admin")) {
      return <AdminSidebar />;
    }

    if (location.pathname.startsWith("/volunteer")) {
      return <VolunteerSidebar />;
    }

    return <CitizenSidebar />;
  };

  return (

    <div className="min-h-screen bg-[#F6F8FC]">

      <div className="flex">

        {renderSidebar()}

        <div className="flex flex-1 flex-col">

          <Topbar />

          <main className="flex-1 p-8">

            {children ? children : <Outlet />}

          </main>

        </div>

      </div>

    </div>

  );

};

export default DashboardLayout;