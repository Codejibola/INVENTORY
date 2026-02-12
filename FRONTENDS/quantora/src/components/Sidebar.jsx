/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Edit3, 
  Receipt, 
  Settings as SettingsIcon, 
  LogOut, 
  X 
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, to: "/dashboard" },
    { name: "Manage Products", icon: <Package size={20} />, to: "/Manage_Products" },
    { name: "Record Sales", icon: <Edit3 size={20} />, to: "/recordSales" },
    { name: "Invoices", icon: <Receipt size={20} />, to: "/invoices" },
    { name: "Settings", icon: <SettingsIcon size={20} />, to: "/settings" }, // New Settings Route
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const NavLink = ({ link, onClick, isMobile = false }) => {
    const isActive = location.pathname === link.to;
    
    return (
      <Link
        to={link.to}
        onClick={onClick}
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
          isActive 
            ? "bg-blue-600/10 text-blue-400 font-bold" 
            : "text-gray-500 hover:text-white hover:bg-white/5"
        }`}
      >
        {/* Active Indicator - Desktop */}
        {isActive && !isMobile && (
          <motion.div 
            layoutId="sidebar-indicator"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)] origin-center"
          />
        )}
        
        {/* Active Indicator - Mobile */}
        {isActive && isMobile && (
          <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />
        )}

        <span className={`transition-colors ${isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}`}>
          {link.icon}
        </span>
        <span className="text-sm tracking-wide">{link.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#050505] border-r border-white/5 p-6 shadow-2xl relative z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-lg shadow-blue-600/20">Q</div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase">Quantora</h1>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] px-4 mb-4">Core Menu</p>
          {links.map((link) => (
            <NavLink key={link.name} link={link} isMobile={false} />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all font-bold group border border-transparent hover:border-red-500/10"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative h-full w-72 bg-[#080808] border-r border-white/10 shadow-2xl p-8 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-10">
                 <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic underline decoration-blue-600 underline-offset-8">Quantora</h1>
                 <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-3">
                {links.map((link) => (
                  <NavLink 
                    key={link.name} 
                    link={link} 
                    isMobile={true} 
                    onClick={() => setIsOpen(false)} 
                  />
                ))}
              </nav>

              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-red-600/10 text-red-500 rounded-2xl transition-all font-black text-xs uppercase tracking-[0.2em] mt-auto"
              >
                <LogOut size={18} />
                Logout
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}