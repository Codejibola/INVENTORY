/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { ShoppingCart, Package, DollarSign, TrendingUp, History } from "lucide-react";

const toTitleCase = (str = "") =>
  str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function RecordSales() {
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState("");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const fetchProducts = () => {
    apiFetch("http://localhost:5000/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list);
      })
      .catch(() => setError("Failed to load products"));
  };

  const fetchSales = () => {
    apiFetch("http://localhost:5000/api/sales", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : data.sales || data || [];
        const today = new Date().toISOString().split("T")[0];
        setSales(all.filter((s) => s.created_at?.startsWith(today)));
      })
      .catch(() => setError("Failed to load sales"));
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [token]);

  const getSuggestedPrice = () => {
    if (!selected) return 0;
    const product = products.find((p) => p.id === Number(selected));
    if (!product) return 0;
    return product.selling_price * quantity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selected) return setError("Please select a product.");
    if (!quantity || quantity < 1) return setError("Quantity must be at least 1.");
    if (!totalPrice || totalPrice <= 0) return setError("Total price must be greater than 0.");

    const product = products.find((p) => p.id === Number(selected));
    if (!product) return setError("Invalid product selected.");
    if (quantity > product.units) return setError(`Only ${product.units} units left.`);

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
      setError("Error recording sale.");
    } finally {
      setLoading(false);
    }
  };

  const totalToday = sales.reduce((acc, s) => acc + Number(s.price), 0);
  const suggestedPrice = getSuggestedPrice();

  return (
    <HelmetProvider>
      <Helmet><title>Record Sale | Quantora</title></Helmet>

      <div className="flex min-h-screen bg-[#050505] text-gray-200">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />

          <main className="p-6 lg:p-10 space-y-8 max-w-[1200px] mx-auto w-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Record Sales</h1>
                <p className="text-gray-500 text-sm mt-1">Transaction date: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="bg-blue-600/10 border border-blue-500/20 px-6 py-3 rounded-2xl flex items-center gap-4">
                <TrendingUp className="text-blue-400" size={24} />
                <div>
                  <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest">Today's Revenue</p>
                  <p className="text-xl font-black text-white">₦{totalToday.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* SALE FORM */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-5 bg-[#111] border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShoppingCart size={120} />
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg"><Package size={20}/></div>
                    <h2 className="text-lg font-bold text-white uppercase tracking-tight">New Transaction</h2>
                  </div>

                  {error && <p className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl text-center font-bold">{error}</p>}

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-500 ml-1">Product</label>
                    <select
                      value={selected}
                      onChange={(e) => { setSelected(e.target.value); setTotalPrice(""); }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="">Choose a product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#111]">
                          {toTitleCase(p.name)} ({p.units} units left)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-gray-500 ml-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => { setQuantity(Number(e.target.value)); setTotalPrice(""); }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-gray-500 ml-1">Price (₦)</label>
                      <input
                        type="number"
                        value={totalPrice}
                        onChange={(e) => setTotalPrice(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-gray-600 font-bold text-blue-400"
                        placeholder={selected ? `Suggest: ${suggestedPrice}` : "0.00"}
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Confirm Sale"}
                  </button>
                </form>
              </motion.div>

              {/* SALES HISTORY (Today) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <History size={18} className="text-gray-500" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Today's Activity</h2>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-white/[0.02] text-[10px] uppercase font-black text-gray-500 tracking-widest border-b border-white/5">
                          <th className="px-6 py-4">Item</th>
                          <th className="px-6 py-4">Qty</th>
                          <th className="px-6 py-4">Total</th>
                          <th className="px-6 py-4 text-right">Net Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {sales.length === 0 ? (
                          <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-600 italic">No transactions recorded yet today.</td></tr>
                        ) : (
                          sales.map((s) => {
                            const profitLoss = Number(s.profit_loss || 0);
                            return (
                              <tr key={s.id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-white">{toTitleCase(s.product_name)}</p>
                                    <p className="text-[10px] text-gray-600 uppercase font-bold">{new Date(s.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </td>
                                <td className="px-6 py-4 text-gray-400">×{s.quantity}</td>
                                <td className="px-6 py-4 font-bold text-white">₦{Number(s.price).toLocaleString()}</td>
                                <td className={`px-6 py-4 text-right font-black ${
                                  profitLoss >= 0 ? "text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]" : "text-red-500"
                                }`}>
                                  {profitLoss >= 0 ? "+" : "-"}₦{Math.abs(profitLoss).toLocaleString()}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </HelmetProvider>
  );
}