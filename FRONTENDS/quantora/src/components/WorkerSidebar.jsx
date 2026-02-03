import { NavLink } from "react-router-dom";

export default function WorkerSidebar() {
  return (
    <aside className="w-60 bg-slate-800 p-6 flex flex-col gap-6">
      <h2 className="text-xl font-bold mb-6">Worker Menu</h2>
      <NavLink
        to="record-sales"
        className={({ isActive }) =>
          `block px-4 py-2 rounded-lg ${
            isActive ? "bg-blue-600" : "hover:bg-slate-700"
          }`
        }
      >
        Record Sales
      </NavLink>
      <NavLink
        to="available-products"
        className={({ isActive }) =>
          `block px-4 py-2 rounded-lg ${
            isActive ? "bg-blue-600" : "hover:bg-slate-700"
          }`
        }
      >
        Available Products
      </NavLink>
    </aside>
  );
}
