/* eslint-disable */
import { NavLink, useNavigate } from "react-router-dom";
import { X, LogOut, ShoppingCart, Box, RefreshCw } from "lucide-react";
import logo from "../assets/logo.png";

export default function WorkerSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSwitchMode = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      delete user.activeRole;
      localStorage.setItem("user", JSON.stringify(user));
    }
    navigate("/select-mode");
    onClose();
  };

  const navLinkStyles = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
      isActive
        ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
    }`;

  return (
    <>
      {/* Mobile overlay - Improved backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50
          w-72 bg-[#0A0A0B] border-r border-slate-800/50
          p-5 flex flex-col justify-between
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 h-[100dvh]
        `}
      >
        {/* TOP SECTION: Logo + Nav */}
        <div className="flex flex-col overflow-y-auto">
          {/* Logo Area */}
          <div className="flex justify-between items-center mb-8 pt-2">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Quantora Logo" className="w-8 h-8" />
              <h2 className="text-xl font-bold tracking-tight text-white">
                Quantora<span className="text-blue-500">.</span>
              </h2>
            </div>
            <button onClick={onClose} className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-500">
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-4 mb-3">Workstation</p>
            
            <NavLink to="/worker/record-sales" className={navLinkStyles} onClick={onClose}>
              <ShoppingCart size={20} />
              <span className="font-semibold text-sm">Record Sales</span>
            </NavLink>

            <NavLink to="/worker/available-products" className={navLinkStyles} onClick={onClose}>
              <Box size={20} />
              <span className="font-semibold text-sm">Inventory List</span>
            </NavLink>
          </nav>
        </div>

        {/* BOTTOM SECTION: Actions (Always Visible) */}
        <div className="pt-4 mt-4 border-t border-slate-800/50 flex flex-col gap-2 pb-2">
          <button
            onClick={handleSwitchMode}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all"
          >
            <RefreshCw size={18} className="text-blue-500" />
            <span className="font-bold text-xs uppercase tracking-wider">Switch Mode</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all group shadow-sm"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-black text-xs uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}