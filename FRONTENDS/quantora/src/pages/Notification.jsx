/* eslint-disable */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, UserCheck, History, Clock } from "lucide-react";
import apiFetch from "../utils/apiFetch";
import LOCAL_ENV from "../../ENV.js";
import { Helmet } from "react-helmet-async";

export default function Notification() {
  const [lowStock, setLowStock] = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  const [activeWorker, setActiveWorker] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Helper function to convert text to titlecase
  const toTitleCase = (str) => {
    if (!str) return "";
    return str.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  useEffect(() => {
    fetchLowStock();
    syncStaffData();
  }, []);

  //  Pulls directly from specified LocalStorage keys 
  function syncStaffData() {
    // Get the worker currently in session (e.g., "jibs")
    const current = localStorage.getItem("quantora_active_user") || "No one currently active";
    setActiveWorker(current);

    // Get the history of logins
    const logs = JSON.parse(localStorage.getItem("quantora_activity_log") || "[]");
    setLoginLogs(logs);
  }

  async function fetchLowStock() {
    setLoading(true);
    try {
      if (!token) return;
      const res = await apiFetch(`${LOCAL_ENV.API_URL}/api/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const products = Array.isArray(data) ? data : data.products || [];
        const low = products.filter((p) => Number(p.units ?? p.stock) < 3);
        setLowStock(low);
      }
    } catch (err) {
      console.error("Stock fetch failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Shop Notifications | Quantora</title>
      </Helmet>

      <main className="p-6 bg-black min-h-screen text-white font-sans">
        <nav className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all">
            <ArrowLeft size={18} />
            <span className="text-sm font-semibold tracking-wide uppercase">Back to Dashboard</span>
          </button>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white">Notifications</h1>
          <p className="text-slate-500 mt-2 font-medium">Monitoring shop activity and inventory status.</p>
        </header>

        {/* --- STAFF LOGIN MONITOR (OWNER VIEW) --- */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-blue-500 rounded-full" />
            <h2 className="text-xl font-bold tracking-tight">Staff Attendance</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Status Card */}
            <div className="lg:col-span-1 p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-black border border-white/10 shadow-2xl flex flex-col justify-between">
              <div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                  Live Status
                </span>
                <h3 className="text-slate-400 text-sm font-medium mt-4">Currently Logged In:</h3>
                <p className="text-3xl font-black mt-1 text-white truncate">
                  {activeWorker === "Admin" ? "You (Admin)" : "You (Admin)"}
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                System Online
              </div>
            </div>

            {/* Login History List */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <History size={16} /> Login History
                </h3>
              </div>

              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {loginLogs.length > 0 ? (
                  loginLogs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                          <UserCheck size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{toTitleCase(log.name || log.worker)}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                            Mode: {log.role?.title || "Worker"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-blue-400">
                          {new Date(log.timestamp || log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[9px] text-slate-600 font-medium">
                          {new Date(log.timestamp || log.time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-600 italic text-sm">
                    No login activity recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- LOW STOCK ALERTS --- */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-red-500 rounded-full" />
            <h2 className="text-xl font-bold tracking-tight">Stock Warnings</h2>
          </div>

          {loading ? (
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 w-full bg-white/5 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : lowStock.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStock.map((product) => (
                <div key={product.id} className="p-5 rounded-2xl bg-red-500/[0.03] border border-red-500/10 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white uppercase text-xs tracking-wider">{product.name}</h4>
                    <AlertTriangle size={16} className="text-red-500" />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-black text-red-500">{product.units} <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Units left</span></p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white/5 border border-white/5 text-center text-slate-500 text-sm font-medium">
              Inventory levels are looking good. No alerts.
            </div>
          )}
        </section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </>
  );
}