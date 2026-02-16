/* eslint-disable */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Package, Tag, Layers, ArrowUpRight, X, AlertCircle } from "lucide-react";

export default function AvailableProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    selling_price: "",
    stock: "",
    category: "",
  });

  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch products");
      const rows = Array.isArray(data) ? data : data.products || [];
      const normalized = rows.map((r) => ({ ...r, stock: r.stock ?? r.units }));
      setProducts(normalized);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      const stockNum = Number(formData.stock);
      if (Number.isNaN(stockNum)) throw new Error("Stock must be a number");
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          selling_price: Number(formData.selling_price),
          stock: stockNum,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");
      setShowForm(false);
      setFormData({ name: "", price: "", selling_price: "", stock: "", category: "" });
      fetchProducts();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const titleCase = (s) => {
    if (!s) return "—";
    return s.toString().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (p.name?.toString().toLowerCase().includes(term) || p.category?.toString().toLowerCase().includes(term));
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Package className="text-blue-500" size={28} /> INVENTORY SYSTEM
          </h2>
          <p className="text-slate-500 text-sm font-medium">Manage and track available store items</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* MOBILE LIST */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-slate-600 text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">No items found</div>
        ) : (
          filteredProducts.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0A0A0B] rounded-2xl p-5 border border-slate-800"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-white font-bold">{titleCase(p.name)}</h3>
                <ArrowUpRight size={16} className="text-slate-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Stock</p>
                  <p className={`font-bold ${p.stock < 5 ? 'text-red-400' : 'text-slate-300'}`}>{p.stock ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest text-right">Selling Price</p>
                  <p className="text-right font-black text-blue-400">₦{Number(p.selling_price).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden sm:block overflow-hidden bg-[#0A0A0B] rounded-[2rem] border border-slate-800 shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50">
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Details</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Stock Level</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Unit Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredProducts.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-600 font-medium tracking-tight">Your inventory is empty.</td></tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-blue-600/5 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-white font-bold group-hover:text-blue-400 transition-colors">{titleCase(p.name)}</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">SKU: QNT-{p.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-xs text-slate-400 font-medium">
                      {titleCase(p.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${p.stock < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                      <span className={`font-bold ${p.stock < 5 ? 'text-red-400' : 'text-slate-300'}`}>{p.stock ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-black text-white italic">₦{Number(p.selling_price).toLocaleString()}</p>
                    <p className="text-[9px] text-slate-600 uppercase font-black">Cost: ₦{Number(p.price).toLocaleString()}</p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD PRODUCT MODAL */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-slate-900 w-full max-w-xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden p-8 sm:p-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white tracking-tight italic">NEW ITEM</h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="text-slate-500" /></button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Product Name</label>
                    <div className="relative group">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={16} />
                      <input name="name" placeholder="E.g. Coca-Cola" value={formData.name} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-700" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                    <div className="relative group">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={16} />
                      <input name="category" placeholder="E.g. Drinks" value={formData.category} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-700" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Cost (₦)</label>
                    <input name="price" type="number" value={formData.price} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-5 py-3.5 focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Sell (₦)</label>
                    <input name="selling_price" type="number" value={formData.selling_price} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-5 py-3.5 focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Initial Stock</label>
                    <input name="stock" type="number" value={formData.stock} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-5 py-3.5 focus:border-blue-600 outline-none transition-all" />
                  </div>
                </div>

                {formError && <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase bg-red-500/10 p-3 rounded-xl border border-red-500/20"><AlertCircle size={14} /> {formError}</div>}

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all uppercase tracking-widest text-xs">Save Inventory Item</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}