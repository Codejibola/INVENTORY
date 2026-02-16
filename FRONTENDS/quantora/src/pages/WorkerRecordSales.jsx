/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import apiFetch from "../utils/apiFetch";
import { Helmet } from "react-helmet-async";
import { FiPlus, FiShoppingBag, FiHash, FiCalendar, FiBox } from "react-icons/fi";

export default function WorkerRecordSales() {
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await apiFetch("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch {
      setError("Failed to load products");
    }
  };

  const fetchSales = async () => {
    try {
      const res = await apiFetch("http://localhost:5000/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const today = new Date().toISOString().split("T")[0];
      const all = Array.isArray(data) ? data : data.sales || [];
      setSales(all.filter((s) => s.created_at?.startsWith(today)));
    } catch {
      setError("Failed to load sales");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  const suggestedPrice = (() => {
    const product = products.find((p) => p.id === Number(selected));
    return product ? product.selling_price * quantity : 0;
  })();

  // Helper: convert strings to Title Case
  const toTitle = (str) => {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .split(" ")
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
      .join(" ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!selected) return setError("Select a product");
    if (quantity < 1) return setError("Quantity must be at least 1");
    if (!totalPrice || totalPrice <= 0) return setError("Enter a valid total price");

    setLoading(true);
    try {
      await apiFetch("http://localhost:5000/api/sales", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: Number(selected),
          quantity: Number(quantity),
          price: Number(totalPrice),
        }),
      });
      fetchProducts();
      fetchSales();
      setSelected("");
      setQuantity(1);
      setTotalPrice("");
    } catch {
      setError("Failed to record sale");
    } finally {
      setLoading(false);
    }
  };

  const totalToday = sales.reduce((a, s) => a + Number(s.price), 0);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 pb-10">
      <Helmet>
        <title>Quantora | Terminal</title>
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* HEADER STAT */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sales Terminal</h1>
            <p className="text-slate-500 text-sm">Record transactions for {new Date().toLocaleDateString()}</p>
          </div>
          <div className="bg-blue-600/10 border border-blue-500/20 px-6 py-3 rounded-2xl text-center">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-bold">Today's Revenue</p>
            <p className="text-2xl font-black text-white">₦{totalToday.toLocaleString()}</p>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-center text-sm font-medium">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FORM SECTION */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5">
            <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 backdrop-blur-xl p-8 rounded-[32px] sticky top-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiPlus className="text-blue-500" /> New Transaction
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 mb-2 block">Product Selection</label>
                  <div className="relative">
                    <FiShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                      value={selected}
                      onChange={(e) => { setSelected(e.target.value); setTotalPrice(""); }}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm focus:border-blue-500/50 outline-none transition-all appearance-none"
                    >
                      <option value="">Select Item</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{toTitle(p.name)} ({p.units} in stock)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 mb-2 block">Quantity</label>
                    <div className="relative">
                      <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="number" min="1" value={quantity}
                        onChange={(e) => { setQuantity(Number(e.target.value)); setTotalPrice(""); }}
                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm focus:border-blue-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 mb-2 block">Sale Price (₦)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 -translate-y-1/2 text-slate-500">₦</span>
                      <input
                        type="number" value={totalPrice}
                        onChange={(e) => setTotalPrice(e.target.value)}
                        placeholder={suggestedPrice > 0 ? suggestedPrice : "0.00"}
                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all mt-4
                    ${loading ? "bg-slate-800 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/20"}`}
                >
                  {loading ? "Processing..." : "Complete Sale"}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* RECENT SALES TABLE/LIST */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-7">
            <div className="bg-slate-900/50 border border-slate-800 rounded-[32px] overflow-hidden backdrop-blur-xl">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <FiBox className="text-indigo-400" /> Recent Activity
                </h3>
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950/50 text-slate-500 uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-6 py-4 text-left">Product</th>
                      <th className="px-6 py-4 text-center">Qty</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-right text-xs"><FiCalendar className="inline mr-1"/> Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {sales.length === 0 ? (
                      <tr><td colSpan="4" className="py-20 text-center text-slate-600">No transactions recorded yet today.</td></tr>
                    ) : (
                      sales.map((s) => (
                        <tr key={s.id} className="hover:bg-blue-500/5 transition-colors">
                          <td className="px-6 py-4 font-medium text-white">{toTitle(s.product_name)}</td>
                          <td className="px-6 py-4 text-center text-slate-400">{s.quantity}</td>
                          <td className="px-6 py-4 text-right font-bold text-blue-400">₦{Number(s.price).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-slate-500 text-xs">{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="md:hidden divide-y divide-slate-800">
                {sales.map((s) => (
                  <div key={s.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white text-sm">{toTitle(s.product_name)}</p>
                      <p className="text-xs text-slate-500">{new Date(s.created_at).toLocaleTimeString()} • {s.quantity} units</p>
                    </div>
                    <p className="font-bold text-blue-400">₦{Number(s.price).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}