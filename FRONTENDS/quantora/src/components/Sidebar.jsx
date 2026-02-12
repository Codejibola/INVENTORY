/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation(); // Used to highlight the active link

  const links = [
    { name: "Dashboard", icon: "dashboard", to: "/dashboard" },
    { name: "Manage Products", icon: "inventory_2", to: "/Manage_Products" },
    { name: "Record Sales", icon: "edit_note", to: "/recordSales" },
    { name: "Invoices", icon: "receipt_long", to: "/invoices" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const NavLink = ({ link, onClick }) => {
    const isActive = location.pathname === link.to;
    return (
      <Link
        to={link.to}
        onClick={onClick}
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
          isActive 
            ? "bg-blue-600/10 text-blue-400 font-bold" 
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        {/* Active side-bar indicator */}
        {isActive && (
          <motion.div 
            layoutId="indicator"
            className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
          />
        )}
        <span className={`material-icons transition-colors ${isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}`}>
          {link.icon}
        </span>
        <span className="text-sm tracking-wide">{link.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0A0A0A] border-r border-white/5 p-6 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-sm">Q</div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase">Quantora</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] px-4 mb-4">Menu</p>
          {links.map((link) => (
            <NavLink key={link.name} link={link} />
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold mt-auto group"
        >
          <span className="material-icons group-hover:rotate-180 transition-transform duration-300">logout</span>
          <span className="text-sm uppercase tracking-wider">Logout</span>
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar content */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative h-full w-72 bg-[#0A0A0A] border-r border-white/10 shadow-xl p-6 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                 <h1 className="text-xl font-black text-white uppercase tracking-tighter">Quantora</h1>
                 <button
                  onClick={() => setIsOpen(false)}
                  className="material-icons text-gray-500 hover:text-white"
                >
                  close
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {links.map((link) => (
                  <NavLink key={link.name} link={link} onClick={() => setIsOpen(false)} />
                ))}
              </nav>

              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold mt-auto"
              >
                <span className="material-icons">logout</span>
                <span className="text-sm uppercase tracking-wider">Logout</span>
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}