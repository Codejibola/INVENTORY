import { useState } from "react";
import { Outlet } from "react-router-dom";
import WorkerSidebar from "../components/WorkerSidebar";
import WorkerTopbar from "../components/WorkerTopbar";

export default function WorkerDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    /* 1. h-screen + overflow-hidden prevents the whole body from scrolling unnecessarily */
    <div className="flex h-screen bg-[#0A0A0B] text-slate-200 overflow-hidden relative">
      
      {/* BACKGROUND DECORATION: pointer-events-none is crucial so they don't interfere with layout */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* Sidebar: Z-index keeps it above the glows */}
      <div className="relative z-30">
        <WorkerSidebar
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      </div>

      {/* Main Content Area: flex-1 takes up remaining width */}
      <div className="flex-1 flex flex-col relative z-20 min-w-0">
        
        {/* Topbar: Fixed at the top of this container */}
        <WorkerTopbar onMenuClick={() => setMenuOpen(true)} />

        {/* 2. Scrollable Container: This is the ONLY part that should scroll */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
          
          {/* Status Bar: Placed inside the scroll area or at the bottom */}
          <footer className="mt-12 mb-4 text-center text-[10px] text-slate-700 uppercase tracking-[0.2em] pointer-events-none">
            Quantora Terminal v2.0 • Secured Session
          </footer>
        </main>
      </div>
    </div>
  );
}