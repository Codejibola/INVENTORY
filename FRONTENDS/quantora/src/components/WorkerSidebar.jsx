import { NavLink } from "react-router-dom";

export default function WorkerSidebar() {
  return (
    <aside className="w-60 bg-slate-800 border-r border-slate-700 p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-6 text-white">
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
      >
        Available Products
      </NavLink>
    </aside>
  );
}
