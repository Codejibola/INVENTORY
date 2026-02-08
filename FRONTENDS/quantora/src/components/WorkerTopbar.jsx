import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export default function WorkerTopbar({ onMenuClick }) {
  const [shopName, setShopName] = useState("Shop");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        setShopName(data.user?.shop_name || "Shop");
      } catch {
        // silent fail
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="w-full bg-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-700">
      {/* Left: Hamburger (mobile only) + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-300 hover:text-white"
        >
          <Menu size={26} />
        </button>

        <h1 className="text-lg font-semibold text-white">
          {shopName}
          <span className="text-slate-400 text-sm ml-1">
            – Worker Mode
          </span>
        </h1>
      </div>
    </header>
  );
}
