import { useEffect, useState } from "react";

export default function WorkerTopbar() {
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

        // persist once so other components can reuse it
        localStorage.setItem("user", JSON.stringify(data.user));

        setShopName(data.user?.shop_name || "Shop");
      } catch {
        // silent fail – keep fallback
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="w-full bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
      <h1 className="text-lg font-semibold text-white">
        {shopName} <span className="text-slate-400 text-sm">– Worker Mode</span>
      </h1>
    </header>
  );
}
