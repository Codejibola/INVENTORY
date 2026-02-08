import { useState } from "react";
import { Outlet } from "react-router-dom";
import WorkerSidebar from "../components/WorkerSidebar";
import WorkerTopbar from "../components/WorkerTopbar";

export default function WorkerDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-gray-200 overflow-x-hidden">
      {/* Sidebar */}
      <WorkerSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <WorkerTopbar onMenuClick={() => setMenuOpen(true)} />

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
