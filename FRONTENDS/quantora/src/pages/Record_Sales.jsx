/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";
import LOCAL_ENV from "../../ENV.js";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { ShoppingCart, TrendingUp, History, Trash2, Download, Scan, CheckCircle2, Zap, Tag, AlertCircle, X } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Html5Qrcode } from "html5-qrcode";
import logo from "../assets/logo.webp";
import signature from "../assets/signature.webp"

const toTitleCase = (str = "") =>
  str.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export default function RecordSales() {
  const token = localStorage.getItem("token");
  const [isScanning, setIsScanning] = useState(false);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState(""); 
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

  // --- CAMERA LOGIC ---
  useEffect(() => {
    let html5QrCode;
    if (isScanning) {
      const initScanner = async () => {
        try {
          html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;
          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 20, qrbox: { width: 250, height: 150 }, aspectRatio: 1.77 },
            (decodedText) => {
              if (navigator.vibrate) navigator.vibrate(100);
              setScanSuccess(true);
              handleBarcodeMatch(decodedText.trim());
              setTimeout(() => { setScanSuccess(false); stopScanner(); }, 800);
            },
            () => {}
          );
        } catch (err) {
          setError("Camera access denied.");
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
      setCustomPrice(found.selling_price); 
      setError("");
    } else {
      setError(`SKU ${code} not found.`);
    }
  };

  useEffect(() => {
    if (selected) {
      const product = products.find(p => p.id === Number(selected));
      if (product) setCustomPrice(product.selling_price * quantity);
    }
  }, [selected, quantity]);

  const currentProduct = products.find(p => p.id === Number(selected));
  const isBelowCost = currentProduct && Number(customPrice) < (currentProduct.cost_price * quantity);
  const activeDiscount = currentProduct && !isBelowCost && Number(customPrice) < (currentProduct.selling_price * quantity);

  const addToBasket = () => {
    setError(""); 
    if (!selected || !quantity || !customPrice) return setError("Missing selection or price.");
    
    const product = products.find(p => p.id === Number(selected));
    const currentStock = Number(product.units ?? product.stock ?? 0);

    if (currentStock <= 0) {
        return setError("This product can't be added because it is not currently available (Out of stock).");
    }

    if (quantity > currentStock) return setError("Insufficient stock.");

    setBasket([...basket, {
      productId: Number(selected),
      name: product.name,
      quantity: Number(quantity),
      unitPrice: Number(customPrice) / Number(quantity), 
      subtotal: Number(customPrice),
      isDiscounted: Number(customPrice) < (product.selling_price * quantity),
      isLoss: Number(customPrice) < (product.cost_price * quantity)
    }]);
    
    setSelected("");
    setQuantity(1);
    setCustomPrice("");
    setError("");
  };

  const finalizeTransaction = async (shouldDownload) => {
    if (basket.length === 0) return;
    setLoading(true);
    try {
      for (let i = 0; i < basket.length; i++) {
        const item = basket[i];
        const payload = { 
          productId: item.productId, 
          quantity: item.quantity, 
          price: item.subtotal,
          soldBy: currentUser?.name || "Admin"
        };

        // Only send receiptData on the first item when downloading receipt
        if (shouldDownload && i === 0) {
          payload.receiptData = {
            customerName: customerName || "Walk-in Customer",
            workerName: currentUser?.name || "Admin",
            items: basket.map(b => ({
              name: b.name,
              quantity: b.quantity,
              unitPrice: b.unitPrice,
              subtotal: b.subtotal
            }))
          };
        }

        await apiFetch(`${LOCAL_ENV.API_URL}/api/sales`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (shouldDownload) generatePDF();
      setBasket([]);
      setCustomerName("");
      setShowToast(true);
      fetchProducts();
      fetchSales();
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      setError("Failed to sync sales.");
    } finally {
      setLoading(false);
    }
  };
 
const generatePDF = () => {
    const doc = new jsPDF();
    const accent = [37, 99, 235]; // Quantora Blue
    const grandTotal = basket.reduce((acc, i) => acc + i.subtotal, 0);
    
    // 1. Header & Branding
    doc.setFillColor(252, 252, 252);
    doc.rect(0, 0, 210, 50, 'F');
    if (logo) doc.addImage(logo, 'PNG', 15, 12, 25, 25);

    doc.setFont("helvetica", "bold").setFontSize(28).setTextColor(accent[0], accent[1], accent[2]);
    doc.text(currentUser?.shop_name?.toUpperCase() || "BELLO STORES", 195, 25, { align: "right" });
    
    doc.setFontSize(10).setTextColor(100).setFont("helvetica", "normal");
    doc.text("Official Transaction Receipt", 195, 32, { align: "right" });
    doc.text(`Ref: QT-${Math.floor(Math.random() * 1000000000)}`, 195, 38, { align: "right" });

    // 2. Info Section
    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(50);
    doc.text("BILLED TO", 15, 65);
    doc.text("DATE & TIME", 120, 65);
    
    doc.setFont("helvetica", "normal").setTextColor(100);
    doc.text(customerName || "Walk-in Customer", 15, 72);
    doc.text(new Date().toLocaleString(), 120, 72);

    // 3. Properly Aligned Table
    autoTable(doc, {
      startY: 80,
      head: [['ITEM DESCRIPTION', 'QTY', 'UNIT PRICE (N)', 'SUBTOTAL (N)']],
      body: basket.map(i => [
        toTitleCase(i.name), 
        i.quantity, 
        `N${i.unitPrice.toLocaleString()}`, 
        `N${i.subtotal.toLocaleString()}`
      ]),
      headStyles: { fillColor: accent, textColor: [255, 255, 255], fontSize: 10, halign: 'center' },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'right' }
      },
      theme: 'grid',
      styles: { lineColor: [240, 240, 240], textColor: 80, cellPadding: 4 }
    });

    const finalY = doc.lastAutoTable.finalY + 15;

    // 4. Total Price Box
    doc.setFillColor(accent[0], accent[1], accent[2]).rect(125, finalY, 70, 15, 'F');
    doc.setTextColor(255).setFontSize(14).setFont("helvetica", "bold");
    doc.text(`TOTAL: N${grandTotal.toLocaleString()}`, 160, finalY + 9.5, { align: "center" });

    // 5. THE SIGNATURE SECTION (Exact Match to your Design)
    if (signature) {
      const sigCenterX = 160; // Aligned with the center of the Total box
      const sigY = finalY + 25;
      
      // The Stamp/Signature Image
      // Positioned to be centered relative to the Total box above it
      doc.addImage(signature, 'PNG', sigCenterX - 17.5, sigY, 35, 18); 
      
      // Thick Blue Underline
      doc.setDrawColor(accent[0], accent[1], accent[2]).setLineWidth(0.8);
      doc.line(sigCenterX - 20, sigY + 21, sigCenterX + 20, sigY + 21); 
      
      // Bold Blue Label
      doc.setTextColor(accent[0], accent[1], accent[2]).setFontSize(8).setFont("helvetica", "bold");
      doc.text("AUTHORIZED SIGNATURE", sigCenterX, sigY + 26, { align: "center" });
    }

    doc.save(`Receipt_${customerName || 'Sale'}.pdf`);
  };
  const basketTotal = basket.reduce((acc, item) => acc + item.subtotal, 0);
  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.price), 0);
  const totalProfit = sales.reduce((acc, s) => acc + (Number(s.profit_loss) || 0), 0);

  const profitColorClass = totalProfit > 0 
    ? "text-green-400 bg-green-600/10 border-green-500/20" 
    : totalProfit < 0 
      ? "text-red-400 bg-red-600/10 border-red-500/20" 
      : "text-amber-400 bg-amber-600/10 border-amber-500/20";
  
  const profitIconBg = totalProfit > 0 ? "bg-green-600" : totalProfit < 0 ? "bg-red-600" : "bg-amber-600";
  const profitSign = totalProfit > 0 ? "+" : totalProfit < 0 ? "-" : "";

  return (
    <HelmetProvider>
      <Helmet><title>Terminal | Quantora</title></Helmet>
      <div className="flex min-h-screen bg-[#050505] text-gray-200">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />
          
          <main className="p-6 lg:p-10 space-y-8 max-w-[1200px] mx-auto w-full">
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center justify-between text-red-500 mb-6"
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle size={20} />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                        <button onClick={() => setError("")} className="hover:bg-red-500/20 p-1 rounded-lg">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-600/10 border border-blue-500/20 px-6 py-5 rounded-[2rem] flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl"><TrendingUp className="text-white" size={20} /></div>
                <div>
                  <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest">Revenue Today</p>
                  <p className="text-xl font-black text-white">₦{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
              
              <div className={`border px-6 py-5 rounded-[2rem] flex items-center gap-4 transition-colors duration-500 ${profitColorClass}`}>
                <div className={`p-3 rounded-2xl transition-colors duration-500 ${profitIconBg}`}>
                  <Zap className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-80">Net Profit Today</p>
                  <p className="text-xl font-black text-white">
                    {profitSign}₦{Math.abs(totalProfit).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#0c0c0c] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Add Items</h2>
                    <button onClick={() => setIsScanning(!isScanning)} className="bg-blue-600 p-2 rounded-xl text-white hover:scale-105 transition-all"><Scan size={18} /></button>
                  </div>

                  {isScanning && <div id="reader" className="aspect-video rounded-3xl overflow-hidden mb-6"></div>}

                  <div className="space-y-4">
                    <select 
                        value={selected} 
                        onChange={(e) => { setSelected(e.target.value); setError(""); }} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none appearance-none"
                    >
                      <option value="">Choose product...</option>
                      {products.map(p => {
                        const stockCount = Number(p.units ?? p.stock ?? 0);
                        return (
                          <option 
                            key={p.id} 
                            value={p.id} 
                            className={`bg-black ${stockCount <= 0 ? 'text-gray-600' : ''}`}
                          >
                            {p.name} ({stockCount} left)
                          </option>
                        );
                      })}
                    </select>

                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" value={quantity} onChange={(e) => { setQuantity(e.target.value); setError(""); }} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm" placeholder="Qty" />
                      <div className="relative">
                        <input 
                          type="number" 
                          value={customPrice} 
                          onChange={(e) => setCustomPrice(e.target.value)} 
                          className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300 ${isBelowCost ? 'border-red-500 text-red-500' : activeDiscount ? 'border-amber-500 text-amber-500' : 'border-white/10 text-blue-400'}`} 
                          placeholder="Price" 
                        />
                        <AnimatePresence>
                          {isBelowCost && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-3 right-2 flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-lg">
                              <AlertCircle size={10}/> Capital Loss
                            </motion.div>
                          )}
                          {activeDiscount && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-3 right-2 flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-lg">
                              <Tag size={10}/> Discounting
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <button onClick={addToBasket} className="w-full py-5 bg-white text-black font-black uppercase text-xs rounded-2xl hover:bg-gray-200 transition-all">Add to Basket</button>
                  </div>
                </div>

                {basket.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-600 p-8 rounded-[2.5rem] text-white">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black uppercase text-[10px] tracking-widest opacity-70">Checkout List</h3>
                      <button onClick={() => setBasket([])}><Trash2 size={16} className="opacity-50 hover:opacity-100"/></button>
                    </div>
                    <div className="space-y-3 mb-6 max-h-40 overflow-y-auto pr-2">
                      {basket.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex flex-col">
                            <span className="font-bold">{item.name} <span className="text-white/50 text-[10px]">x{item.quantity}</span></span>
                            {item.isLoss ? <span className="text-[8px] font-black bg-red-500 px-1.5 rounded w-fit uppercase">Selling at Loss</span> : item.isDiscounted && <span className="text-[8px] font-black bg-white/20 px-1.5 rounded w-fit uppercase">Discounted</span>}
                          </div>
                          <span className="font-black">₦{item.subtotal.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/20 pt-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-medium opacity-70">Total Payable</span>
                        <span className="text-3xl font-black tracking-tighter">₦{basketTotal.toLocaleString()}</span>
                      </div>
                      <input type="text" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/40 outline-none" />
                      
                      <div className="space-y-2">
                        <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Choose finalization option:</p>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="space-y-1">
                            <button onClick={() => finalizeTransaction(false)} disabled={loading} className="w-full py-3 bg-white/10 border border-white/10 rounded-xl font-bold text-[10px] tracking-widest uppercase text-white hover:bg-white/20 transition-all">⚡ Fast Record (No Receipt)</button>
                            <p className="text-[8px] text-gray-400 px-2">Finalize sale instantly without printing a receipt</p>
                          </div>
                          <div className="space-y-1">
                            <button onClick={() => finalizeTransaction(true)} disabled={loading} className="w-full py-4 bg-white text-blue-600 rounded-xl font-black text-[10px] tracking-widest uppercase shadow-xl hover:bg-gray-100 transition-all">📄 Record & Print Receipt</button>
                            <p className="text-[8px] text-gray-400 px-2">Finalize sale and generate receipt for customer</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-4 px-2">
                  <History size={16} className="text-gray-500" />
                  <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Today's Activity Ledger</h2>
                </div>
                <div className="bg-[#0c0c0c] border border-white/5 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/[0.02] text-[9px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">
                      <tr>
                        <th className="px-6 py-5">Item</th>
                        <th className="px-6 py-5">Price</th>
                        <th className="px-6 py-5 text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sales.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.01]">
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-bold text-white">{toTitleCase(s.product_name)}</p>
                              <p className="text-[9px] text-gray-600">QTY: {s.quantity}</p>
                              <p className="text-[9px] text-gray-500">Sold by: {toTitleCase((!s.sold_by || ['unknown', 'uknown'].includes(String(s.sold_by).toLowerCase())) ? 'Admin' : s.sold_by)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-black text-white">₦{Number(s.price).toLocaleString()}</td>
                          <td className={`px-6 py-4 text-right text-[10px] font-black ${Number(s.profit_loss) >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {Number(s.profit_loss) >= 0 ? `+₦${Number(s.profit_loss).toLocaleString()}` : `-₦${Math.abs(s.profit_loss).toLocaleString()}`}
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
    </HelmetProvider>
  );
}