import { Outlet } from "react-router-dom";
import WorkerSidebar from "../components/WorkerSidebar";
import WorkerTopbar from "../components/WorkerTopbar";

export default function WorkerDashboard() {
  return (
    <div className="flex min-h-screen bg-[#0f172a] text-gray-200">
      <WorkerSidebar />

      <div className="flex-1 flex flex-col">
        <WorkerTopbar />
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
