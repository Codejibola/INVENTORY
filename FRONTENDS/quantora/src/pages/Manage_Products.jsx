/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";
import LOCAL_ENV from "../../ENV.js";
import { 
  Plus, Edit, Trash2, Search, Package, Scan, X, 
  Download, Eye, Loader2, Tag, Layers, DollarSign 
} from "lucide-react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Html5Qrcode } from "html5-qrcode";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.webp";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const scannerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", price: "", selling_price: "", stock: "", category: "", barcode: "", 
  });

  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const toTitleCase = (str = "") =>
    str ? str.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "General";

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
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => console.error("Fetch error:", err));
  };

  const generatePDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    const accent = [37, 99, 235]; 

    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const available = products.filter(p => Number(p.units ?? p.stock ?? 0) > 0);
        doc.setFillColor(252, 252, 252);
        doc.rect(0, 0, 210, 50, 'F');
        if (logo) doc.addImage(logo, 'WEBP', 15, 12, 25, 25);

        doc.setFont("helvetica", "bold").setFontSize(26).setTextColor(accent[0], accent[1], accent[2]);
        const storeDisplayName = currentUser?.shop_name?.toUpperCase() || "QUANTORA";
        doc.text(storeDisplayName, 195, 25, { align: "right" });
        
        doc.setFontSize(10).setTextColor(100).setFont("helvetica", "normal");
        doc.text("Official Inventory Stock Report", 195, 32, { align: "right" });
        
        const now = new Date();
        const fullTimestamp = `${now.toLocaleDateString()} | ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        doc.text(`Generated: ${fullTimestamp}`, 195, 38, { align: "right" });

        doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(50);
        doc.text("INVENTORY SUMMARY", 15, 65);
        doc.text(`Total Unique Items: ${available.length}`, 15, 72);

        autoTable(doc, {
          startY: 80,
          head: [['PRODUCT DESCRIPTION', 'CATEGORY', 'PRICE', 'STOCK']],
          body: available.map(p => [
            toTitleCase(p.name),
            toTitleCase(p.category),
            `N ${Number(p.selling_price).toLocaleString()}`,
            p.units ?? p.stock ?? 0
          ]),
          headStyles: { fillColor: accent, textColor: [255, 255, 255], fontSize: 10, cellPadding: 4 },
          columnStyles: { 0: { halign: 'left' }, 2: { halign: 'right', cellWidth: 35 }, 3: { halign: 'right', cellWidth: 25 } },
          theme: 'grid',
          styles: { lineColor: [240, 240, 240], textColor: 80, cellPadding: 4 }
        });

        doc.save(`${storeDisplayName.replace(/\s+/g, '_')}_Stock_${Date.now()}.pdf`);
      } catch (err) { console.error(err); } finally { setIsDownloading(false); }
    }, 800);
  };

  useEffect(() => {
    let html5QrCode;
    if (isScanning && showForm) {
      const timer = setTimeout(async () => {
        try {
          html5QrCode = new Html5Qrcode("modal-reader");
          scannerRef.current = html5QrCode;
          await html5QrCode.start(
            { facingMode: "environment" }, 
            { fps: 24, qrbox: { width: 280, height: 160 } },
            (decodedText) => {
              if (navigator.vibrate) navigator.vibrate(100);
              setScanSuccess(true);
              setFormData(prev => ({ ...prev, barcode: decodedText }));
              setTimeout(() => { setScanSuccess(false); stopScanner(); }, 600);
            }
          );
        } catch (err) { setIsScanning(false); }
      }, 500);
      return () => {
        clearTimeout(timer);
        if (html5QrCode?.isScanning) html5QrCode.stop().catch(() => {});
      };
    }
  }, [isScanning, showForm]);

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = { ...formData, price: parseFloat(formData.price), selling_price: parseFloat(formData.selling_price), stock: parseInt(formData.stock, 10) };
    try {
      const url = editingId ? `${LOCAL_ENV.API_URL}/api/products/${editingId}` : `${LOCAL_ENV.API_URL}/api/products`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) { fetchProducts(); closeForm(); }
    } catch (err) { console.error(err); }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({ name: product.name, price: product.price, selling_price: product.selling_price, stock: product.units ?? product.stock ?? 0, category: product.category || "", barcode: product.barcode || "" });
    setShowForm(true);
  };

  const closeForm = () => {
    stopScanner();
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", price: "", selling_price: "", stock: "", category: "", barcode: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete item?")) return;
    apiFetch(`${LOCAL_ENV.API_URL}/api/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).then(() => fetchProducts());
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(term) || (p.barcode && p.barcode.includes(term));
  });

  const availableProducts = products.filter(p => Number(p.units ?? p.stock ?? 0) > 0);
  const allMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const currentMonthIdx = new Date().getMonth();
  const displayMonths = allMonths.slice(0, currentMonthIdx + 1).reverse();
  const groupedByMonth = displayMonths.reduce((acc, m) => {
    acc[m] = filteredProducts.filter((p) => allMonths[new Date(p.created_at || Date.now()).getMonth()] === m);
    return acc;
  }, {});

  return (
    <HelmetProvider>
      <Helmet><title>Inventory | Quantora</title></Helmet>
      <div className="flex min-h-screen bg-[#050505] text-gray-200 overflow-x-hidden">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />
          
          <main className="p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 max-w-[1400px] mx-auto w-full">
            {/* Header Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">Inventory</h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage and track your commercial assets</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full sm:w-48 lg:w-64 pl-9 pr-4 py-2.5 rounded-xl bg-[#111] border border-white/5 outline-none text-sm focus:border-blue-500/50 transition-all" 
                  />
                </div>
                <button onClick={() => setShowPreview(true)} className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm transition-colors">
                  <Eye size={16} /> <span className="hidden sm:inline">Available products</span><span className="sm:hidden">Available products</span>
                </button>
                <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 bg-blue-600 px-4 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-lg active:scale-95 transition-transform">
                  <Plus size={16} /> Add Item
                </button>
              </div>
            </div>

            {/* Inventory List */}
            <div className="space-y-10 lg:space-y-12">
              {displayMonths.map((month) => groupedByMonth[month]?.length > 0 && (
                <section key={month} className="space-y-5">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 border-b border-white/5 pb-2">{month}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {groupedByMonth[month].map((p) => {
                      const stockCount = Number(p.units ?? p.stock ?? 0);
                      return (
                        <div key={p.id} className="bg-[#0c0c0c] border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 hover:border-blue-500/30 transition-all">
                          <div className="flex justify-between items-start mb-5 sm:mb-6">
                            <div className="min-w-0 flex-1 pr-2">
                              <h3 className="font-bold text-white text-base sm:text-lg leading-tight truncate">{toTitleCase(p.name)}</h3>
                              <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-black uppercase mt-2 inline-block tracking-tighter">{toTitleCase(p.category)}</span>
                            </div>
                            <div className="flex gap-1.5 sm:gap-2 shrink-0">
                              <button onClick={() => handleEdit(p)} className="p-2 sm:p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-lg sm:rounded-xl text-gray-400"><Edit size={14}/></button>
                              <button onClick={() => handleDelete(p.id)} className="p-2 sm:p-2.5 bg-white/5 hover:bg-red-500/20 rounded-lg sm:rounded-xl text-gray-400"><Trash2 size={14}/></button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                            <div><p className="text-[8px] text-gray-600 font-black uppercase mb-0.5">Cost</p><p className="text-gray-400 font-bold text-xs sm:text-sm">₦{Number(p.price).toLocaleString()}</p></div>
                            <div className="border-x border-white/5 px-2"><p className="text-[8px] text-gray-600 font-black uppercase mb-0.5">Retail</p><p className="text-white font-black text-xs sm:text-sm">₦{Number(p.selling_price).toLocaleString()}</p></div>
                            <div className="text-right"><p className="text-[8px] text-gray-600 font-black uppercase mb-0.5">Qty</p><p className={`font-black text-xs sm:text-sm ${stockCount < 5 ? "text-red-500" : "text-green-500"}`}>{stockCount}</p></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
              {filteredProducts.length === 0 && (
                <div className="py-20 text-center text-gray-600">No products found matching your search.</div>
              )}
            </div>

            {/* PREVIEW MODAL */}
            <AnimatePresence>
              {showPreview && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[70] p-3 sm:p-6">
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0f0f0f] border border-white/10 w-full max-w-4xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-5 sm:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <h2 className="text-xl sm:text-2xl font-black text-white text-center sm:text-left">Stock Report</h2>
                      <div className="flex gap-2 justify-center">
                        <button onClick={generatePDF} disabled={isDownloading} className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-white font-black text-[10px] sm:text-xs uppercase transition-all ${isDownloading ? "bg-blue-800 opacity-80" : "bg-blue-600 hover:bg-blue-500"}`}>
                          {isDownloading ? <Loader2 className="animate-spin" size={16}/> : <Download size={16}/>}
                          {isDownloading ? "Generating..." : "Download PDF"}
                        </button>
                        <button onClick={() => setShowPreview(false)} className="p-2.5 sm:p-3 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"><X size={20}/></button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4 sm:p-8">
                      <table className="w-full text-left min-w-[500px]">
                        <thead><tr className="text-[10px] uppercase font-black text-gray-500 border-b border-white/5"><th className="pb-4">Item</th><th>Class</th><th>Price</th><th className="text-right">Qty</th></tr></thead>
                        <tbody>
                          {availableProducts.map((p) => (
                            <tr key={p.id} className="border-b border-white/[0.02] text-sm">
                              <td className="py-4 font-bold text-white">{toTitleCase(p.name)}</td>
                              <td className="py-4 text-gray-400">{toTitleCase(p.category)}</td>
                              <td className="py-4 text-blue-400 font-mono font-bold">₦{Number(p.selling_price).toLocaleString()}</td>
                              <td className="py-4 text-right font-black text-green-500">{p.units ?? p.stock ?? 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* FORM MODAL */}
            <AnimatePresence>
              {showForm && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[80] p-3 sm:p-4">
                  <motion.form onSubmit={handleSaveProduct} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#0f0f0f] border border-white/10 p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] w-full max-w-xl max-h-[95vh] overflow-y-auto space-y-5 sm:space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl sm:text-2xl font-black text-white">{editingId ? "Update Item" : "New Item"}</h2>
                      <button type="button" onClick={closeForm} className="p-2 bg-white/5 rounded-full text-gray-500"><X size={18}/></button>
                    </div>

                    <div className="bg-white/[0.03] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] sm:text-[10px] uppercase font-black text-blue-400 tracking-widest flex items-center gap-2"><Scan size={14}/> Barcode</label>
                        <button type="button" onClick={() => isScanning ? stopScanner() : setIsScanning(true)} className="text-[9px] font-black px-3 py-1.5 rounded-lg bg-blue-600 text-white uppercase">
                          {isScanning ? "Stop" : "Scan"}
                        </button>
                      </div>
                      {isScanning && <div className="aspect-video rounded-xl overflow-hidden bg-black"><div id="modal-reader" className="w-full h-full"></div></div>}
                      <input name="barcode" placeholder="Barcode SKU" value={formData.barcode} onChange={handleChange} className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-black border border-white/10 text-white font-mono text-sm" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="sm:col-span-2"><input name="name" placeholder="Item Name" value={formData.name} onChange={handleChange} className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm" required /></div>
                      <div><input name="price" type="number" placeholder="Cost Price" value={formData.price} onChange={handleChange} className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm" required /></div>
                      <div><input name="selling_price" type="number" placeholder="Selling Price" value={formData.selling_price} onChange={handleChange} className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/5 border border-white/10 text-blue-400 text-sm" required /></div>
                      <div><input name="stock" type="number" placeholder="Stock Level" value={formData.stock} onChange={handleChange} className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm" required /></div>
                      <div><input name="category" placeholder="Category" value={formData.category} onChange={handleChange} className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm" /></div>
                    </div>

                    <button type="submit" className="w-full py-4 sm:py-5 bg-blue-600 rounded-[1.2rem] sm:rounded-[1.5rem] font-black uppercase text-[10px] sm:text-xs text-white shadow-xl hover:bg-blue-500 active:scale-[0.98] transition-all">
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