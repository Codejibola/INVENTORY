/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";
import LOCAL_ENV from "../../ENV.js";
import { Plus, Edit, Trash2, Search, Package, Scan, X, Tag, Layers, DollarSign, Zap, CheckCircle2 } from "lucide-react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Html5Qrcode } from "html5-qrcode";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const scannerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", price: "", selling_price: "", stock: "", category: "", barcode: "", 
  });

  const [error, setError] = useState("");
  const [barcodeError, setBarcodeError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const toTitleCase = (str = "") =>
    str ? str.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "";

  // 1. DATA INITIALIZATION
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    if (!token) return;
    apiFetch(`${LOCAL_ENV.API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => console.error("Fetch error:", err));
  };

  // 2. SCANNER LOGIC
  useEffect(() => {
    let html5QrCode;
    if (isScanning && showForm) {
      const timer = setTimeout(async () => {
        try {
          const element = document.getElementById("modal-reader");
          if (!element) return;

          html5QrCode = new Html5Qrcode("modal-reader", { 
            verbose: false,
            experimentalFeatures: { useBarCodeDetectorIfSupported: true },
            willReadFrequently: true 
          });
          scannerRef.current = html5QrCode;

          const config = { 
            fps: 24, 
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.777778,
          };

          await html5QrCode.start(
            { facingMode: "environment" }, 
            config,
            (decodedText) => {
              if (navigator.vibrate) navigator.vibrate(100);
              setScanSuccess(true);
              setFormData(prev => ({ ...prev, barcode: decodedText }));
              setTimeout(() => {
                setScanSuccess(false);
                stopScanner();
              }, 600);
            }
          );
        } catch (err) {
          setError("Camera access denied.");
          setIsScanning(false);
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        if (html5QrCode?.isScanning) {
          html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
        }
      };
    }
  }, [isScanning, showForm]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) await scannerRef.current.stop();
        await scannerRef.current.clear();
        setIsScanning(false);
      } catch (err) { setIsScanning(false); }
    }
  };

  // 3. CRUD HANDLERS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBarcodeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, barcode: value }));

    if (!value) {
      setBarcodeError("");
      return;
    }

    if (/[a-zA-Z]/.test(value)) {
      setBarcodeError("Barcode is numeric only.");
      return;
    }

    if (!/^[0-9]+$/.test(value)) {
      setBarcodeError("Invalid barcode format.");
      return;
    }

    setBarcodeError("");
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setError("");
    if (barcodeError) {
      setError("Please fix barcode issues before saving.");
      return;
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      selling_price: parseFloat(formData.selling_price),
      stock: parseInt(formData.stock, 10),
      barcode: formData.barcode || null,
    };

    try {
      const url = editingId ? `${LOCAL_ENV.API_URL}/api/products/${editingId}` : `${LOCAL_ENV.API_URL}/api/products`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Could not save product.");
      fetchProducts();
      closeForm();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item permanently?")) return;
    try {
      const res = await apiFetch(`${LOCAL_ENV.API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) { alert(err.message); }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      selling_price: product.selling_price,
      stock: product.units ?? product.stock ?? 0, 
      category: product.category || "",
      barcode: product.barcode || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    stopScanner();
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", price: "", selling_price: "", stock: "", category: "", barcode: "" });
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(term) || (p.barcode && p.barcode.includes(term));
  });

  const allMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const currentMonthIndex = new Date().getMonth();
  const displayMonths = allMonths.slice(0, currentMonthIndex + 1).reverse();
  const groupedByMonth = displayMonths.reduce((acc, m) => {
    acc[m] = filteredProducts.filter((p) => allMonths[new Date(p.created_at || Date.now()).getMonth()] === m);
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
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter">Inventory</h1>
                <p className="text-gray-500 text-sm mt-1">Manage and track your commercial assets</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" placeholder="Search inventory..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 rounded-xl bg-[#111] border border-white/5 outline-none w-full md:w-64 text-sm focus:border-blue-500/50 transition-all" />
                </div>
                <button onClick={() => { setEditingId(null); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-transform"><Plus size={18} /> Add Item</button>
              </div>
            </div>

            {/* Monthly Groups */}
            <div className="space-y-12">
              {displayMonths.map((month) => groupedByMonth[month]?.length > 0 && (
                <section key={month} className="space-y-5">
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-600 border-b border-white/5 pb-2">{month}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {groupedByMonth[month].map((p) => {
                      const stockCount = Number(p.units ?? p.stock ?? 0);
                      return (
                        <div key={p.id} className="bg-[#0c0c0c] border border-white/5 rounded-[2rem] p-6 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="font-bold text-white text-lg leading-tight">{toTitleCase(p.name)}</h3>
                              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-black uppercase mt-2 inline-block tracking-tighter">{p.category || "General"}</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(p)} className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl text-gray-400 hover:text-blue-400 transition-all"><Edit size={16}/></button>
                              <button onClick={() => handleDelete(p.id)} className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-gray-400 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                            </div>
                          </div>

                          {/* Data Grid: Added Cost Price Column */}
                          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                            <div>
                              <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Cost</p>
                              <p className="text-gray-400 font-bold text-xs md:text-sm">₦{Number(p.price).toLocaleString()}</p>
                            </div>
                            <div className="border-x border-white/5 px-2">
                              <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Retail</p>
                              <p className="text-white font-black text-xs md:text-sm">₦{Number(p.selling_price).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Qty</p>
                              <p className={`font-black text-xs md:text-sm ${stockCount < 5 ? "text-red-500" : "text-green-500"}`}>
                                {stockCount}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* Modal Form */}
            <AnimatePresence>
              {showForm && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                  <motion.form onSubmit={handleSaveProduct} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-[#0f0f0f] border border-white/10 p-8 rounded-[3rem] w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-8 custom-scrollbar relative shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500"><Package size={24}/></div>
                         <h2 className="text-2xl font-black text-white">{editingId ? "Edit Item" : "New Item"}</h2>
                      </div>
                      <button type="button" onClick={closeForm} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"><X size={20}/></button>
                    </div>

                    <div className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5 space-y-5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-black text-blue-400 tracking-[0.2em] flex items-center gap-2"><Scan size={14}/> Barcode Protocol</label>
                        <button type="button" onClick={() => isScanning ? stopScanner() : setIsScanning(true)} className={`text-[10px] font-black px-5 py-2.5 rounded-xl uppercase transition-all ${isScanning ? 'bg-red-500/20 text-red-500' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'}`}>
                          {isScanning ? "Terminate Scan" : "Initialize Camera"}
                        </button>
                      </div>

                      {isScanning && (
                        <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-white/5 bg-black group">
                          <div id="modal-reader" className="w-full h-full"></div>
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                             <div className={`relative w-[260px] h-[150px] border-2 rounded-2xl transition-all duration-300 ${scanSuccess ? 'border-green-500 bg-green-500/20 scale-110' : 'border-blue-500/40 shadow-[0_0_0_999px_rgba(0,0,0,0.6)]'}`}>
                                {!scanSuccess && (
                                  <motion.div initial={{ top: "10%" }} animate={{ top: "90%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-[2px] bg-blue-400 shadow-[0_0_15px_blue]" />
                                )}
                             </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-600 uppercase ml-1">Manual SKU / Scanned Result</label>
                        <input name="barcode" placeholder="Enter barcode or scan" value={formData.barcode} onChange={handleBarcodeChange} className="w-full px-5 py-4 rounded-2xl bg-black border border-white/10 text-white font-mono text-sm focus:border-blue-500 outline-none transition-colors" />
                        {barcodeError && <p className="text-red-400 text-[10px] font-bold">{barcodeError}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Item Designation</label>
                        <input name="name" placeholder="Ex: Raw Silk Kaftan" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Cost (₦)</label>
                        <input name="price" type="number" placeholder="0" value={formData.price} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Retail (₦)</label>
                        <input name="selling_price" type="number" placeholder="0" value={formData.selling_price} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-blue-400 font-black outline-none focus:border-blue-500" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Stock Vol</label>
                        <input name="stock" type="number" placeholder="0" value={formData.stock} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Class</label>
                        <input name="category" placeholder="Apparel" value={formData.category} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500" />
                      </div>
                    </div>

                    <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-[1.5rem] font-black uppercase text-xs text-white shadow-xl shadow-blue-600/20 active:scale-[0.97] transition-all">
                      {editingId ? "Update System Records" : "Commit to Inventory"}
                    </button>
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