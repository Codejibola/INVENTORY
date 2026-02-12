/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";
import { Plus, Edit, Trash2, Search, Package, Tag, Layers } from "lucide-react";
import { Helmet, HelmetProvider } from "react-helmet-async";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    selling_price: "",
    stock: "",
    category: "",
  });
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const toTitleCase = (str = "") =>
    str
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    if (!token) return;
    apiFetch("http://localhost:5000/api/products", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or server error");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      selling_price: parseFloat(formData.selling_price),
      stock: Math.max(0, parseInt(formData.stock, 10)),
      category: formData.category,
    };

    try {
      const url = editingId
        ? `http://localhost:5000/api/products/${editingId}`
        : "http://localhost:5000/api/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save product");
      fetchProducts();
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", price: "", selling_price: "", stock: "", category: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await apiFetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      selling_price: product.selling_price,
      stock: product.units,
      category: product.category || "",
    });
    setShowForm(true);
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  });

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const groupedByMonth = months.reduce((acc, m) => {
    acc[m] = filteredProducts.filter((p) => months[new Date(p.created_at).getMonth()] === m);
    return acc;
  }, {});

  return (
    <HelmetProvider>
      <Helmet><title>Inventory | Quantora</title></Helmet>

      <div className="flex min-h-screen bg-[#050505] text-gray-200">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />

          <main className="p-6 lg:p-10 space-y-8 max-w-[1400px] mx-auto w-full">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white">Inventory</h1>
                <p className="text-gray-500 text-sm mt-1">Manage and track your shop stock levels</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 rounded-xl bg-[#111] border border-white/5 focus:border-blue-500/50 outline-none w-full md:w-64 transition-all text-sm"
                  />
                </div>
                <button
                  onClick={() => { setEditingId(null); setFormData({ name: "", price: "", selling_price: "", stock: "", category: "" }); setShowForm(true); }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-white font-bold transition-all text-sm shadow-lg shadow-blue-600/20"
                >
                  <Plus size={18} /> Add Item
                </button>
              </div>
            </div>

            {/* Product List */}
            <div className="space-y-10">
              {months.map((month) => groupedByMonth[month]?.length > 0 && (
                <section key={month} className="space-y-4">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600 border-b border-white/5 pb-2">{month}</h2>
                  
                  <div className="hidden md:block overflow-hidden bg-[#111] border border-white/5 rounded-2xl shadow-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/[0.02] text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-white/5">
                          <th className="px-6 py-4">Product Details</th>
                          <th className="px-6 py-4">Cost Price</th>
                          <th className="px-6 py-4">Selling Price</th>
                          <th className="px-6 py-4">Stock Status</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {groupedByMonth[month].map((p) => (
                          <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-4">
                              <p className="font-bold text-white text-sm">{toTitleCase(p.name)}</p>
                              <p className="text-[10px] text-gray-500 uppercase font-bold mt-0.5">{p.category || "General"}</p>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-400">₦{Number(p.price).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm font-bold text-blue-400">₦{Number(p.selling_price).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${Number(p.units) < 5 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
                                {p.units} in stock
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(p)} className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-400 transition-colors"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"><Trash2 size={16}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden grid grid-cols-1 gap-4">
                    {groupedByMonth[month].map((p) => (
                      <div key={p.id} className="bg-[#111] border border-white/5 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-white">{toTitleCase(p.name)}</h3>
                            <p className="text-xs text-gray-500">{toTitleCase(p.category || "General")}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(p)} className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-500/10 rounded-lg text-red-500"><Trash2 size={16}/></button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-600">Price</p>
                            <p className="text-sm font-bold text-blue-400">₦{p.selling_price}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-600">Stock</p>
                            <p className={`text-sm font-bold ${p.units < 5 ? 'text-red-500' : 'text-green-500'}`}>{p.units} units</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
              {showForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <motion.form
                    onSubmit={handleSaveProduct}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl space-y-6"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl"><Package size={24}/></div>
                      <h2 className="text-2xl font-black text-white">{editingId ? "Update Product" : "New Product"}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Name</label>
                        <input name="name" placeholder="Ex: Smartwatch Ultra" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white transition-all" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Cost Price</label>
                        <input name="price" type="number" placeholder="₦0.00" value={formData.price} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white transition-all" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Selling Price</label>
                        <input name="selling_price" type="number" placeholder="₦0.00" value={formData.selling_price} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white transition-all" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Stock Units</label>
                        <input name="stock" type="number" placeholder="0" value={formData.stock} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white transition-all" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
                        <input name="category" placeholder="Ex: Electronics" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white transition-all" />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-gray-400 transition-all">Cancel</button>
                      <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 transition-all">Save Changes</button>
                    </div>
                  </motion.form>
                </div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </HelmetProvider>
  );
}