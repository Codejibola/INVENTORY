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
  const [barcodeError, setBarcodeError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const toTitleCase = (str = "") =>
    str ? str.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "General";

  // 1. INITIALIZATION
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

  // 2. PDF GENERATION WITH LOADING UI
const generatePDF = async () => {
  if (isDownloading) return;
  setIsDownloading(true);

  // Set the accent color (Quantora Blue)
  const accent = [37, 99, 235]; 

  setTimeout(() => {
    try {
      const doc = new jsPDF();
      const available = products.filter(p => Number(p.units ?? p.stock ?? 0) > 0);
      
      // 1. Header & Branding (Matching your WorkerRecordSales style)
      doc.setFillColor(252, 252, 252);
      doc.rect(0, 0, 210, 50, 'F');
      
      // Add the Logo
      if (logo) {
        doc.addImage(logo, 'WEBP', 15, 12, 25, 25);
      }

      // Add the Store Name (Logic: uses currentUser.shop_name or fallback to QUANTORA)
      doc.setFont("helvetica", "bold").setFontSize(26).setTextColor(accent[0], accent[1], accent[2]);
      const storeDisplayName = currentUser?.shop_name?.toUpperCase() || "QUANTORA";
      doc.text(storeDisplayName, 195, 25, { align: "right" });
      
      // Sub-header and Timestamp
      doc.setFontSize(10).setTextColor(100).setFont("helvetica", "normal");
      doc.text("Official Inventory Stock Report", 195, 32, { align: "right" });
      
      const now = new Date();
      const fullTimestamp = `${now.toLocaleDateString()} | ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      doc.text(`Generated: ${fullTimestamp}`, 195, 38, { align: "right" });

      // 2. Information Section
      doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(50);
      doc.text("INVENTORY SUMMARY", 15, 65);
      
      doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(100);
      doc.text(`Total Unique Items: ${available.length}`, 15, 72);

      // 3. Table with proper alignment
      autoTable(doc, {
        startY: 80,
        head: [['PRODUCT DESCRIPTION', 'CATEGORY', 'PRICE', 'STOCK']],
        body: available.map(p => [
          toTitleCase(p.name),
          toTitleCase(p.category),
          `N ${Number(p.selling_price).toLocaleString()}`,
          p.units ?? p.stock ?? 0
        ]),
        headStyles: { 
          fillColor: accent, 
          textColor: [255, 255, 255], 
          fontSize: 10,
          cellPadding: 4,
          halign: 'left'
        },
        columnStyles: {
          0: { halign: 'left' },
          1: { halign: 'left' },
          2: { halign: 'right', cellWidth: 35 },
          3: { halign: 'right', cellWidth: 25 }
        },
        // Ensure price and stock headers align right to match columns
        didParseCell: (data) => {
          if (data.section === 'head') {
            if (data.column.index === 2 || data.column.index === 3) {
              data.cell.styles.halign = 'right';
            }
          }
        },
        theme: 'grid',
        styles: { lineColor: [240, 240, 240], textColor: 80, cellPadding: 4 }
      });

      // 4. Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9).setTextColor(150).setFont("helvetica", "normal");
        doc.text(
          `${storeDisplayName} - Page ${i} of ${pageCount}`, 
          105, 287, 
          { align: "center" }
        );
      }

      doc.save(`${storeDisplayName.replace(/\s+/g, '_')}_Stock_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      setIsDownloading(false);
    }
  }, 800);
};

  // 3. SCANNER LOGIC
  useEffect(() => {
    let html5QrCode;
    if (isScanning && showForm) {
      const timer = setTimeout(async () => {
        try {
          const element = document.getElementById("modal-reader");
          if (!element) return;
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

  // 4. CRUD HANDLERS
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      selling_price: parseFloat(formData.selling_price),
      stock: parseInt(formData.stock, 10),
    };
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete item?")) return;
    apiFetch(`${LOCAL_ENV.API_URL}/api/products/${id}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${token}` } 
    }).then(() => fetchProducts());
  };

  // 5. FILTERING & GROUPING
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(term) || (p.barcode && p.barcode.includes(term));
  });

  const availableProducts = products.filter(p => Number(p.units ?? p.stock ?? 0) > 0);
  const allMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const displayMonths = allMonths.slice(0, new Date().getMonth() + 1).reverse();
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter">Inventory</h1>
                <p className="text-gray-500 text-sm mt-1">Manage and track your commercial assets</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 rounded-xl bg-[#111] border border-white/5 outline-none w-48 lg:w-64 text-sm focus:border-blue-500/50 transition-all" />
                </div>
                <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2.5 rounded-xl text-white font-bold text-sm">
                  <Eye size={18} /> Preview Stock
                </button>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg active:scale-95 transition-transform">
                  <Plus size={18} /> Add Item
                </button>
              </div>
            </div>

            {/* MONTHLY GROUPS */}
            <div className="space-y-12">
              {displayMonths.map((month) => groupedByMonth[month]?.length > 0 && (
                <section key={month} className="space-y-5">
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-600 border-b border-white/5 pb-2">{month}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {groupedByMonth[month].map((p) => {
                      const stockCount = Number(p.units ?? p.stock ?? 0);
                      return (
                        <div key={p.id} className="bg-[#0c0c0c] border border-white/5 rounded-[2rem] p-6 hover:border-blue-500/30 transition-all">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="font-bold text-white text-lg leading-tight">{toTitleCase(p.name)}</h3>
                              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-black uppercase mt-2 inline-block tracking-tighter">{toTitleCase(p.category)}</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(p)} className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl text-gray-400"><Edit size={16}/></button>
                              <button onClick={() => handleDelete(p.id)} className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-gray-400"><Trash2 size={16}/></button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                            <div><p className="text-[9px] text-gray-600 font-black uppercase mb-1">Cost</p><p className="text-gray-400 font-bold text-sm">₦{Number(p.price).toLocaleString()}</p></div>
                            <div className="border-x border-white/5 px-2"><p className="text-[9px] text-gray-600 font-black uppercase mb-1">Retail</p><p className="text-white font-black text-sm">₦{Number(p.selling_price).toLocaleString()}</p></div>
                            <div className="text-right"><p className="text-[9px] text-gray-600 font-black uppercase mb-1">Qty</p><p className={`font-black text-sm ${stockCount < 5 ? "text-red-500" : "text-green-500"}`}>{stockCount}</p></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* PREVIEW MODAL */}
            <AnimatePresence>
              {showPreview && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[70] p-4">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0f0f0f] border border-white/10 w-full max-w-4xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center">
                      <div><h2 className="text-2xl font-black text-white">Stock Report</h2></div>
                      <div className="flex gap-3">
                        <button onClick={generatePDF} disabled={isDownloading} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-black text-xs uppercase shadow-lg transition-all ${isDownloading ? "bg-blue-800 opacity-80" : "bg-blue-600 hover:bg-blue-500"}`}>
                          {isDownloading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={18}/></motion.div> : <Download size={18}/>}
                          {isDownloading ? "Generating..." : "Download PDF"}
                        </button>
                        <button onClick={() => setShowPreview(false)} className="p-3 bg-white/5 rounded-full text-gray-400"><X size={20}/></button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                      <table className="w-full text-left">
                        <thead><tr className="text-[10px] uppercase font-black text-gray-500 border-b border-white/5"><th className="pb-4">Item</th><th>Class</th><th>Price</th><th className="text-right">Qty</th></tr></thead>
                        <tbody>
                          {availableProducts.map((p) => (
                            <tr key={p.id} className="border-b border-white/[0.02]">
                              <td className="py-4 font-bold text-white">{toTitleCase(p.name)}</td>
                              <td className="py-4 text-gray-400 text-sm">{toTitleCase(p.category)}</td>
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
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[80] p-4">
                  <motion.form onSubmit={handleSaveProduct} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#0f0f0f] border border-white/10 p-8 rounded-[3rem] w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-black text-white">{editingId ? "Update Item" : "New Item"}</h2>
                      <button type="button" onClick={closeForm} className="p-2 bg-white/5 rounded-full text-gray-500"><X size={20}/></button>
                    </div>

                    <div className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-black text-blue-400 tracking-widest flex items-center gap-2"><Scan size={14}/> Scanner</label>
                        <button type="button" onClick={() => isScanning ? stopScanner() : setIsScanning(true)} className="text-[10px] font-black px-4 py-2 rounded-xl bg-blue-600 text-white">
                          {isScanning ? "Stop" : "Scan Barcode"}
                        </button>
                      </div>
                      {isScanning && <div className="aspect-video rounded-2xl overflow-hidden bg-black"><div id="modal-reader" className="w-full h-full"></div></div>}
                      <input name="barcode" placeholder="Barcode SKU" value={formData.barcode} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-black border border-white/10 text-white font-mono" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2"><input name="name" placeholder="Item Name" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white" required /></div>
                      <div><input name="price" type="number" placeholder="Cost" value={formData.price} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white" required /></div>
                      <div><input name="selling_price" type="number" placeholder="Retail" value={formData.selling_price} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-blue-400" required /></div>
                      <div><input name="stock" type="number" placeholder="Stock" value={formData.stock} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white" required /></div>
                      <div><input name="category" placeholder="Category" value={formData.category} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white" /></div>
                    </div>

                    <button type="submit" className="w-full py-5 bg-blue-600 rounded-[1.5rem] font-black uppercase text-xs text-white">
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