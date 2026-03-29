/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";
import LOCAL_ENV from "../../ENV.js";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { ShoppingCart, Package, DollarSign, TrendingUp, History, Receipt, Trash2, Download, Scan, CheckCircle2 } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Html5Qrcode } from "html5-qrcode";
import logo from "../assets/logo.webp";
import signatureStamp from "../assets/signature.webp";

const toTitleCase = (str = "") =>
  str.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export default function RecordSales() {
  const token = localStorage.getItem("token");
  const [isScanning, setIsScanning] = useState(false);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState("");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [basket, setBasket] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [scanSuccess, setScanSuccess] = useState(false);
  
  const scannerRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    fetchProducts();
    fetchSales();
  }, [token]);

  const fetchProducts = () => {
    apiFetch(`${LOCAL_ENV.API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.products || []))
      .catch(() => setError("Failed to load products"));
  };

  const fetchSales = () => {
    apiFetch(`${LOCAL_ENV.API_URL}/api/sales`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : data.sales || data || [];
        const todayStr = new Date().toLocaleDateString('en-CA');
        setSales(all.filter(s => s.created_at && new Date(s.created_at).toLocaleDateString('en-CA') === todayStr));
      })
      .catch(() => setError("Failed to load sales"));
  };

  // --- HARDENED BACK CAMERA SCANNER ---
  useEffect(() => {
    let html5QrCode;
    if (isScanning) {
      const initScanner = async () => {
        try {
          html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;
          
          await html5QrCode.start(
            { facingMode: "environment" }, // FORCES BACK CAMERA
            { fps: 20, qrbox: { width: 250, height: 150 }, aspectRatio: 1.77 },
            (decodedText) => {
              if (navigator.vibrate) navigator.vibrate(100);
              setScanSuccess(true);
              handleBarcodeMatch(decodedText);
              
              setTimeout(() => {
                setScanSuccess(false);
                stopScanner();
              }, 800);
            },
            () => {} // Silent noise errors
          );
        } catch (err) {
          setError("Camera access denied. Use manual selection.");
          setIsScanning(false);
        }
      };
      initScanner();
    }
    return () => stopScanner();
  }, [isScanning]);

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
      setIsScanning(false);
    }
  };

  const handleBarcodeMatch = (code) => {
    const found = products.find(p => p.barcode === code);
    if (found) {
      setSelected(found.id);
      setQuantity(1);
      setTotalPrice(found.selling_price);
    } else {
      setError(`SKU ${code} not found in inventory.`);
    }
  };

  // Auto-calculate price on selection
  useEffect(() => {
    if (selected) {
      const product = products.find(p => p.id === Number(selected));
      if (product) setTotalPrice(product.selling_price * quantity);
    }
  }, [selected, quantity, products]);

  const addToBasket = () => {
    if (!selected || !quantity) return setError("Select an item first.");
    const product = products.find(p => p.id === Number(selected));
    if (quantity > (product.units || product.stock)) return setError("Insufficient stock.");

    setBasket([...basket, {
      productId: Number(selected),
      name: product.name,
      quantity: Number(quantity),
      price: Number(totalPrice) / Number(quantity), // store unit price
      subtotal: Number(totalPrice)
    }]);
    
    setSelected("");
    setQuantity(1);
    setTotalPrice("");
  };

  const finalizeReceipt = async () => {
    setLoading(true);
    try {
      for (const item of basket) {
        await apiFetch(`${LOCAL_ENV.API_URL}/api/sales`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.productId, quantity: item.quantity, price: item.subtotal }),
        });
      }

      generatePDF();
      setBasket([]);
      setCustomerName("");
      setShowToast(true);
      fetchProducts();
      fetchSales();
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      setError("Failed to sync sales. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const accent = [37, 99, 235];
    const grandTotal = basket.reduce((acc, i) => acc + i.subtotal, 0);

    // Header logic
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, 210, 40, 'F');
    if (logo) doc.addImage(logo, 'PNG', 15, 10, 20, 20);
    doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(accent[0], accent[1], accent[2]);
    doc.text(currentUser?.shop_name?.toUpperCase() || "QUANTORA", 195, 20, { align: "right" });

    // Table
    autoTable(doc, {
      startY: 50,
      head: [['DESCRIPTION', 'QTY', 'UNIT', 'AMOUNT']],
      body: basket.map(i => [toTitleCase(i.name), i.quantity, `N${i.price.toLocaleString()}`, `N${i.subtotal.toLocaleString()}`]),
      headStyles: { fillColor: accent },
      theme: 'striped'
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFillColor(accent[0], accent[1], accent[2]).rect(140, finalY, 55, 12, 'F');
    doc.setTextColor(255).setFontSize(12).text(`TOTAL: N${grandTotal.toLocaleString()}`, 167, finalY + 8, { align: "center" });
    
    doc.save(`Receipt_${customerName || 'Sale'}.pdf`);
  };

  const basketTotal = basket.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <HelmetProvider>
      <Helmet><title>Checkout | Quantora</title></Helmet>
      <div className="flex min-h-screen bg-[#050505] text-gray-200">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />
          
          <main className="p-6 lg:p-10 space-y-8 max-w-[1200px] mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Terminal Checkout</h1>
                <p className="text-gray-500 text-sm mt-1">Live inventory sync active</p>
              </div>
              <div className="bg-blue-600/10 border border-blue-500/20 px-6 py-4 rounded-3xl flex items-center gap-4">
                <TrendingUp className="text-blue-400" size={24} />
                <div>
                  <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest">Revenue Today</p>
                  <p className="text-xl font-black text-white">₦{sales.reduce((acc, s) => acc + Number(s.price), 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* CHECKOUT COLUMN */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#0c0c0c] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Add to Order</h2>
                    <button onClick={() => setIsScanning(!isScanning)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${isScanning ? 'bg-red-500/20 text-red-500' : 'bg-blue-600 text-white'}`}>
                      <Scan size={14} /> {isScanning ? "STOP CAMERA" : "ACTIVATE SCANNER"}
                    </button>
                  </div>

                  {isScanning && (
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-white/5 bg-black mb-6">
                      <div id="reader" className="w-full h-full"></div>
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className={`w-[240px] h-[140px] border-2 rounded-2xl transition-all ${scanSuccess ? 'border-green-500 bg-green-500/20' : 'border-blue-500/30'}`}>
                           {scanSuccess && <CheckCircle2 className="text-green-500 mx-auto mt-10" size={40}/>}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-blue-500 transition-all appearance-none">
                      <option value="">Select product or scan barcode...</option>
                      {products.map(p => <option key={p.id} value={p.id} className="bg-black">{p.name} ({p.units || p.stock} available)</option>)}
                    </select>

                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm" />
                      <input type="text" placeholder="Price" value={`₦${Number(totalPrice).toLocaleString()}`} readOnly className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-blue-400 font-bold" />
                    </div>

                    <button onClick={addToBasket} className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase text-xs rounded-2xl transition-all">
                      Add to Basket
                    </button>
                  </div>
                </div>

                {basket.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-600/30">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black uppercase text-xs tracking-tighter">Current Receipt</h3>
                      <button onClick={() => setBasket([])} className="text-white/60 hover:text-white"><Trash2 size={18}/></button>
                    </div>
                    <div className="space-y-3 mb-6 max-h-40 overflow-y-auto pr-2">
                      {basket.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{item.name} <span className="text-white/50 text-[10px]">x{item.quantity}</span></span>
                          <span className="font-black">₦{item.subtotal.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/20 pt-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-medium opacity-70">Total Payable</span>
                        <span className="text-3xl font-black tracking-tighter">₦{basketTotal.toLocaleString()}</span>
                      </div>
                      <input type="text" placeholder="Customer Name (Optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/40 outline-none" />
                      <button onClick={finalizeReceipt} disabled={loading} className="w-full py-4 bg-white text-blue-600 font-black uppercase text-xs rounded-xl shadow-lg active:scale-95 transition-all">
                        {loading ? "PROCESSING..." : "FINALIZE & PRINT RECEIPT"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* RECENT SALES COLUMN */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-4">
                  <History size={16} className="text-gray-500" />
                  <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Today's Sales Ledger</h2>
                </div>
                <div className="bg-[#0c0c0c] border border-white/5 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/[0.02] text-[9px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">
                      <tr>
                        <th className="px-6 py-5">Product Info</th>
                        <th className="px-6 py-5">Qty</th>
                        <th className="px-6 py-5">Value</th>
                        <th className="px-6 py-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sales.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.01]">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-white">{toTitleCase(s.product_name)}</p>
                            <p className="text-[10px] text-gray-600">{new Date(s.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">×{s.quantity}</td>
                          <td className="px-6 py-4 text-sm font-black text-white">₦{Number(s.price).toLocaleString()}</td>
                          <td className={`px-6 py-4 text-right text-[10px] font-black ${Number(s.profit_loss) >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {Number(s.profit_loss) >= 0 ? "+ PROFIT" : "- LOSS"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} className="fixed top-24 right-8 bg-green-600 p-5 rounded-2xl shadow-2xl flex items-center gap-4 z-[100] border border-green-400/20">
            <Receipt className="text-white" />
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Sale Recorded</p>
              <p className="text-xs text-white/80">Inventory updated and receipt generated.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </HelmetProvider>
  );
}