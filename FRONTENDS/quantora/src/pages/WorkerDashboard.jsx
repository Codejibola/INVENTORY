import { Outlet } from "react-router-dom";
import WorkerSidebar from "../components/WorkerSidebar";
import WorkerTopbar from "../components/WorkerTopbar";

export default function WorkerDashboard() {
  return (
    <div className="min-h-screen flex bg-slate-900 text-white">
      {/* Sidebar */}
      <WorkerSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <WorkerTopbar />
        <main className="flex-1 p-6">
          <Outlet /> {/* Nested routes render here */}
        </main>
      </div>
    </div>
  );
}
