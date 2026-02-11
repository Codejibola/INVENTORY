import { NavLink, useNavigate } from "react-router-dom";
import { X, LogOut } from "lucide-react";

export default function WorkerSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          w-60 bg-slate-800 border-r border-slate-700
          p-6 flex flex-col gap-4
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          md:rounded-none
          h-auto
        `}
      >
        {/* Mobile close button */}
        <div className="flex justify-between items-center md:hidden mb-4">
          <h2 className="text-lg font-bold text-white">Worker Menu</h2>
          <button onClick={onClose}>
            <X className="text-gray-300" />
          </button>
        </div>

        <h2 className="text-xl font-bold mb-6 text-white hidden md:block">
          Worker Menu
        </h2>

        <NavLink
          to="/worker/record-sales"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-slate-700"
            }`
          }
          onClick={onClose}
        >
          Record Sales
        </NavLink>

        <NavLink
          to="/worker/available-products"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-slate-700"
            }`
          }
          onClick={onClose}
        >
          Available Products
        </NavLink>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>
    </>
  );
}
