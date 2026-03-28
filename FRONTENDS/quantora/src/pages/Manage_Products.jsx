/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";
import LOCAL_ENV from "../../ENV.js";
import { Plus, Edit, Trash2, Search, Package, Scan, X, Tag, Layers, DollarSign, Info, Zap } from "lucide-react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Html5Qrcode } from "html5-qrcode";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const scannerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    selling_price: "",
    stock: "",
    category: "",
    barcode: "", 
  });

  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const toTitleCase = (str = "") =>
    str.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    fetchProducts();
  }, []);

  // STABLE & FAST BARCODE SCANNER LOGIC
  useEffect(() => {
    if (isScanning && showForm) {
      const html5QrCode = new Html5Qrcode("modal-reader");
      scannerRef.current = html5QrCode;

      // Optimizing for speed: Tight box and hardware acceleration
      const config = { 
        fps: 15, 
        qrbox: { width: 280, height: 160 },
        aspectRatio: 1.777778,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      // Forces back camera on mobile (environment)
      html5QrCode.start(
        { facingMode: "environment" }, 
        config,
        (decodedText) => {
          setFormData(prev => ({ ...prev, barcode: decodedText }));
          stopScanner();
        },
        (errorMessage) => { /* Ignore background noise */ }
      ).catch(err => {
        console.error("Scanner start error", err);
        // Fallback if 'environment' is too strict on some devices
        html5QrCode.start({ facingMode: "user" }, config, (text) => {
           setFormData(prev => ({ ...prev, barcode: text }));
           stopScanner();
        }).catch(e => console.error(e));
      });

      return () => {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().then(() => html5QrCode.clear()).catch(e => console.log(e));
        }
      };
    }
  }, [isScanning, showForm]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        setIsScanning(false);
      }
    } else {
      setIsScanning(false);
    }
  };

  const fetchProducts = () => {
    if (!token) return;
    apiFetch(`${LOCAL_ENV.API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
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
      stock: parseInt(formData.stock, 10), 
      category: formData.category,
      barcode: formData.barcode || null, 
    };

    try {
      const url = editingId
        ? `${LOCAL_ENV.API_URL}/api/products/${editingId}`
        : `${LOCAL_ENV.API_URL}/api/products`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save product");
      }
      
      fetchProducts();
      closeForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const closeForm = () => {
    stopScanner();
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", price: "", selling_price: "", stock: "", category: "", barcode: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await apiFetch(`${LOCAL_ENV.API_URL}/api/products/${id}`, {
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
      barcode: product.barcode || "",
    });
    setShowForm(true);
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.barcode && p.barcode.includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  });

  const allMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const currentMonthIndex = new Date().getMonth();
  const displayMonths = allMonths.slice(0, currentMonthIndex + 1).reverse();

  const groupedByMonth = displayMonths.reduce((acc, m) => {
    acc[m] = filteredProducts.filter((p) => allMonths[new Date(p.created_at).getMonth()] === m);
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
                    placeholder="Search by name or barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 rounded-xl bg-[#111] border border-white/5 focus:border-blue-500/50 outline-none w-full md:w-64 transition-all text-sm"
                  />
                </div>
                <button
                  onClick={() => { setEditingId(null); setFormData({ name: "", price: "", selling_price: "", stock: "", category: "", barcode: "" }); setShowForm(true); }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-white font-bold transition-all text-sm shadow-lg shadow-blue-600/20"
                >
                  <Plus size={18} /> Add Item
                </button>
              </div>
            </div>

            <div className="space-y-10">
              {displayMonths.map((month) => groupedByMonth[month]?.length > 0 && (
                <section key={month} className="space-y-4">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600 border-b border-white/5 pb-2">{month}</h2>
                  
                  {/* Table for Desktop */}
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
                              <div className="flex gap-2 items-center mt-1">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">{p.category || "General"}</span>
                                {p.barcode && <span className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5 font-mono">#{p.barcode}</span>}
                              </div>
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
                            <p className="text-sm font-bold text-blue-400">₦{Number(p.selling_price).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-600">Stock</p>
                            <p className={`text-sm font-bold ${Number(p.units) < 5 ? 'text-red-500' : 'text-green-500'}`}>{p.units} units</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <AnimatePresence>
              {showForm && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
                  <motion.form
                    onSubmit={handleSaveProduct}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#0f0f0f] border border-white/10 p-8 rounded-[2.5rem] w-full max-w-xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/20 text-blue-500 rounded-2xl"><Package size={24}/></div>
                        <h2 className="text-2xl font-black text-white">{editingId ? "Update Product" : "New Inventory Item"}</h2>
                      </div>
                      <button type="button" onClick={closeForm} className="text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
                    </div>

                    {error && <p className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl text-center font-bold">{error}</p>}

                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Scan size={16} className="text-blue-400" />
                          <label className="text-[10px] uppercase font-black text-blue-400 tracking-widest">Barcode Registration</label>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            if(isScanning) stopScanner();
                            else setIsScanning(true);
                          }}
                          className="text-[10px] font-black uppercase bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-white transition-all shadow-lg shadow-blue-600/20"
                        >
                          {isScanning ? "Cancel Scan" : "Scan to Link"}
                        </button>
                      </div>

                      {isScanning && (
                        <div className="space-y-4">
                          <div id="modal-reader" className="overflow-hidden rounded-2xl border-2 border-dashed border-blue-500/30 bg-black aspect-video"></div>
                          
                          {/* Troubleshooting Section */}
                          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 space-y-2">
                             <div className="flex items-center gap-2 text-blue-400">
                                <Zap size={14} />
                                <span className="text-[10px] font-black uppercase tracking-wider">Fast Scan Tips</span>
                             </div>
                             <ul className="text-[11px] text-gray-500 space-y-1 ml-1 list-disc list-inside">
                                <li><strong>Distance:</strong> Hold item <span className="text-gray-300">15-20cm</span> away (don't get too close).</li>
                                <li><strong>Lighting:</strong> Ensure the barcode has no bright glare/reflections.</li>
                                <li><strong>Laptop:</strong> Keep the product steady for 2 seconds to allow focus.</li>
                             </ul>
                          </div>
                        </div>
                      )}

                      <input 
                        name="barcode" 
                        placeholder="Scan or enter item barcode/SKU..." 
                        value={formData.barcode} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 focus:border-blue-500 outline-none text-white text-sm transition-all font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 flex items-center gap-2"><Tag size={12}/> Product Name</label>
                        <input name="name" placeholder="Ex: Raw Silk Kaftan Fabric" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white transition-all text-sm" required />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 flex items-center gap-2"><DollarSign size={12}/> Cost Price (₦)</label>
                        <input name="price" type="number" placeholder="0.00" value={formData.price} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white transition-all text-sm" required />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 flex items-center gap-2"><DollarSign size={12}/> Selling Price (₦)</label>
                        <input name="selling_price" type="number" placeholder="0.00" value={formData.selling_price} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-blue-400 font-bold transition-all text-sm" required />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 flex items-center gap-2"><Layers size={12}/> Stock Units</label>
                        <input name="stock" type="number" placeholder="0" value={formData.stock} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white transition-all text-sm" required />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 flex items-center gap-2"><Layers size={12}/> Category</label>
                        <input name="category" placeholder="Ex: Apparel" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white transition-all text-sm" />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-lg shadow-blue-600/20 transition-all">
                        {editingId ? "Update Product" : "Register Item"}
                      </button>
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