/* eslint-disable */
import { useState, useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";
import LOCAL_ENV from "../../ENV.js";
import { RefreshCcw, FileText, Users, ClipboardList } from "lucide-react";

export default function Receipts() {
  const token = localStorage.getItem("token");
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (token) fetchReceipts();
  }, [token]);

  const fetchReceipts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`${LOCAL_ENV.API_URL}/api/receipts`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Unable to load receipts");
      }
      setReceipts(Array.isArray(data) ? data : data.receipts || data);
    } catch (err) {
      setError(err.message || "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    try {
      return new Date(value).toLocaleString("en-CA", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return value;
    }
  };

  const receiptItems = selectedReceipt?.items ? JSON.parse(selectedReceipt.items) : [];

  return (
    <HelmetProvider>
      <Helmet>
        <title>Receipts | Quantora</title>
      </Helmet>
      <div className="flex min-h-screen bg-[#050505] text-gray-200">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setMenuOpen(true)} userName="Owner" />
          <main className="p-6 lg:p-10 space-y-8 max-w-[1200px] mx-auto w-full">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-blue-400 font-black">Owner Only</p>
                <h1 className="text-3xl font-black mt-2">Receipt Archive</h1>
                <p className="mt-2 text-sm text-slate-400 max-w-2xl">
                  All archived receipts are visible only to the shop owner. Select an entry to view full receipt details.
                </p>
              </div>
              <button
                onClick={fetchReceipts}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition"
              >
                <RefreshCcw size={16} /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
              <section className="bg-[#111827] border border-white/5 rounded-[2rem] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-slate-400 uppercase tracking-[0.3em] text-[10px] font-black">Receipt History</p>
                    <p className="mt-2 text-sm text-gray-300">{loading ? "Loading receipts..." : `${receipts.length} archived receipt${receipts.length === 1 ? "" : "s"}`}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 text-slate-300 text-xs">
                    <FileText size={16} /> Owner only
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-4 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  {receipts.length === 0 && !loading ? (
                    <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-slate-400">
                      No archived receipts found.
                    </div>
                  ) : (
                    receipts.map((receipt) => (
                      <button
                        key={receipt.id}
                        onClick={() => setSelectedReceipt(receipt)}
                        className={`w-full text-left p-4 rounded-3xl border transition-all ${selectedReceipt?.id === receipt.id ? "border-blue-500/50 bg-blue-600/10" : "border-white/5 bg-white/5 hover:border-blue-500/30 hover:bg-white/10"}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-white">{receipt.customer_name || "Walk-in Customer"}</p>
                            <p className="text-sm text-slate-400">Sold by {receipt.worker_name || "Admin"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-300">{receiptItems.length} item{receiptItems.length === 1 ? "" : "s"}</p>
                            <p className="text-xs text-slate-500">{formatDate(receipt.created_at)}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </section>

              <section className="bg-[#111827] border border-white/5 rounded-[2rem] p-6 min-h-[420px]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-slate-400 uppercase tracking-[0.3em] text-[10px] font-black">Receipt Preview</p>
                    <p className="mt-2 text-sm text-gray-300">View transaction details and item breakdown.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 text-slate-300 text-xs">
                    <ClipboardList size={16} /> Details
                  </div>
                </div>

                {!selectedReceipt ? (
                  <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-slate-500">
                    Select a receipt to preview its details.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Receipt ID</p>
                      <p className="text-lg font-black text-white">#{selectedReceipt.id}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-3xl bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Customer</p>
                        <p className="mt-2 font-bold text-white">{selectedReceipt.customer_name || "Walk-in Customer"}</p>
                      </div>
                      <div className="rounded-3xl bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Worker</p>
                        <p className="mt-2 font-bold text-white">{selectedReceipt.worker_name || "Admin"}</p>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Items</p>
                      <div className="mt-4 space-y-3">
                        {receiptItems.length === 0 ? (
                          <p className="text-sm text-slate-400">No item details available.</p>
                        ) : (
                          receiptItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center rounded-3xl bg-[#0f172a] p-3">
                              <div>
                                <p className="font-bold text-white">{item.name}</p>
                                <p className="text-xs text-slate-400">Qty {item.quantity}</p>
                              </div>
                              <p className="text-sm text-slate-300">N{Number(item.unitPrice).toLocaleString()}</p>
                              <p className="text-sm font-bold text-white">N{Number(item.subtotal).toLocaleString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-3xl bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Created At</p>
                        <p className="mt-2 text-sm text-slate-200">{formatDate(selectedReceipt.created_at)}</p>
                      </div>
                      <div className="rounded-3xl bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Item Total</p>
                        <p className="mt-2 text-lg font-black text-white">N{receiptItems.reduce((total, item) => total + Number(item.subtotal), 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </HelmetProvider>
  );
}
