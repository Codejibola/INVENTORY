/* eslint-disable */
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();

  const links = [
    { name: "Dashboard", icon: "dashboard", to: "/dashboard" },
    { name: "Manage Products", icon: "inventory_2", to: "/Manage_Products" },
    { name: "Record Sales", icon: "edit_note", to: "/recordSales" },
    { name: "Invoices", icon: "receipt_long", to: "/invoices" },
    { name: "Notes", icon: "note_alt", to: "/notes" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin");
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-gray-900 border-r border-gray-800 p-6 space-y-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>

        <nav className="flex-1 space-y-4">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className="flex items-center gap-2 text-gray-300 hover:text-teal-400 transition font-medium"
            >
              <span className="material-icons">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-400 transition font-medium mt-auto"
        >
          <span className="material-icons">logout</span>
          Logout
        </button>
      </aside>

      {/* Mobile overlay + sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween" }}
            className="relative h-full w-64 bg-gray-900 border-r border-gray-800 shadow-xl p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="material-icons text-white mb-4 hover:text-teal-400"
            >
              close
            </button>

            <h1 className="text-2xl font-bold text-white mb-6">
              Dashboard
            </h1>

            <nav className="flex-1 space-y-4">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-gray-300 hover:text-teal-400 transition font-medium"
                >
                  <span className="material-icons">{link.icon}</span>
                  {link.name}
                </Link>
              ))}
            </nav>

            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 text-red-500 hover:text-red-400 transition font-medium mt-auto"
            >
              <span className="material-icons">logout</span>
              Logout
            </button>
          </motion.aside>
        </div>
      )}
    </>
  );
}
