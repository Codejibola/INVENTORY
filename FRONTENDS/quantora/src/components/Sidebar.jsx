/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.webp";
import { 
  LayoutDashboard, 
  Package, 
  Edit3, 
  Receipt, 
  Settings as SettingsIcon, 
  MessageSquare, 
  Crown, 
  LogOut, 
  X 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const links = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, to: "/dashboard" },
    { name: "Manage Products", icon: <Package size={18} />, to: "/Manage_Products" },
    { name: "Record Sales", icon: <Edit3 size={18} />, to: "/recordSales" },
    { name: "Invoices", icon: <Receipt size={18} />, to: "/invoices" },
    { name: "Subscription", icon: <Crown size={18} />, to: "/subscription" },
    { name: "Feedback", icon: <MessageSquare size={18} />, to: "/feedback" },
    { name: "Settings", icon: <SettingsIcon size={18} />, to: "/settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const NavLink = ({ link, onClick, isMobile = false }) => {
    const isActive = location.pathname === link.to;
    
    return (
      <Link
        to={link.to}
        onClick={onClick}
        className={`group flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl transition-all duration-200 relative ${
          isActive 
            ? "bg-blue-600/10 text-blue-400 font-bold" 
            : "text-gray-500 hover:text-white hover:bg-white/5"
        }`}
      >
        {isActive && (
          <motion.div 
            layoutId={isMobile ? "mobile-indicator" : "sidebar-indicator"}
            className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          />
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
      <aside className="hidden md:flex flex-col w-64 bg-[#050505] border-r border-white/5 p-6 h-screen sticky top-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-10 px-2">
          <img src={logo} alt="Quantora Logo" className="w-8 h-8" />
          <h2 className="text-xl font-black text-white tracking-tighter italic uppercase">
              Q<span className="text-blue-500 font-bold not-italic">uantora</span>
          </h2>
        </div>

        {/* Scrollable middle part */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] px-4 mb-4">Core Menu</p>
          {links.map((link) => (
            <NavLink key={link.name} link={link} isMobile={false} />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all font-bold group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em]">Sign Out System</span>
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
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative h-[100dvh] w-72 bg-[#080808] border-r border-white/10 shadow-2xl p-6 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <img src={logo} alt="Quantora Logo" className="w-8 h-8" />
                   <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Q<span className="text-blue-500 font-bold not-italic">uantora</span></h2>
                   <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-full text-gray-400">
                    <X size={20} />
                  </button>
                </div>

                {/* Nav links are now scrollable if they exceed screen height */}
                <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
                  {links.map((link) => (
                    <NavLink 
                      key={link.name} 
                      link={link} 
                      isMobile={true} 
                      onClick={() => setIsOpen(false)} 
                    />
                  ))}
                </nav>
              </div>

              {/* Pinned Logout Button */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-red-600/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
