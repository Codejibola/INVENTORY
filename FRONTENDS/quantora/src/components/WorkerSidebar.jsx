import { NavLink, useNavigate } from "react-router-dom";
import { X, LogOut, ShoppingCart, Box, RefreshCw } from "lucide-react";

export default function WorkerSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSwitchMode = () => {
    // We clear the activeRole so they have to verify the password again 
    // to get back into Admin or Worker mode.
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      delete user.activeRole;
      localStorage.setItem("user", JSON.stringify(user));
    }
    navigate("/select-mode");
    onClose();
  };

  const navLinkStyles = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      isActive
        ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50
          w-72 bg-[#0A0A0B] border-r border-slate-800/50
          p-6 flex flex-col
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 h-screen
        `}
      >
        {/* Logo / Brand Area */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">Q</div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Quantora<span className="text-blue-500">.</span>
            </h2>
          </div>
          <button onClick={onClose} className="md:hidden p-2 hover:bg-slate-800 rounded-lg">
            <X className="text-slate-400" />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-2 mb-2">Main Menu</p>
          
          <NavLink to="/worker/record-sales" className={navLinkStyles} onClick={onClose}>
            <ShoppingCart size={20} />
            <span className="font-medium">Record Sales</span>
          </NavLink>

          <NavLink to="/worker/available-products" className={navLinkStyles} onClick={onClose}>
            <Box size={20} />
            <span className="font-medium">Inventory List</span>
          </NavLink>
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={handleSwitchMode}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all border border-transparent hover:border-slate-700"
          >
            <RefreshCw size={20} />
            <span className="font-medium text-sm">Switch Mode</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}