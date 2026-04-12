/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import apiFetch from "../utils/apiFetch.js";
import LOCAL_ENV from "../../ENV.js";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { TrendingUp, History, Trash2, Scan, CheckCircle2 } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Html5Qrcode } from "html5-qrcode";
import logo from "../assets/logo.webp";
import signature from "../assets/signature.webp";

const toTitleCase = (str = "") =>
  str.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export default function WorkerRecordSales() {
  const token = localStorage.getItem("token");
  const [isScanning, setIsScanning] = useState(false);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState(""); 
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const handleBarcodeInputChange = (value) => {
    setBarcodeInput(value);

    if (!value) {
      setError("");
      return;
    }

    if (/[a-zA-Z]/.test(value)) {
      setError("Barcode is numeric only. Please scan or enter barcode, not product name.");
      return;
    }

    if (!/^[0-9]+$/.test(value)) {
      setError("Invalid barcode format. Barcodes should not contain spaces or symbols.");
      return;
    }

    setError("");
  };

  const lookupBarcode = () => {
    const code = barcodeInput.trim();

    if (!code) {
      setError("Please enter a barcode.");
      return;
    }

    if (/[a-zA-Z]/.test(code)) {
      setError("Please use the barcode field for numeric barcode values, not product name.");
      return;
    }

    const found = products.find((p) => p.barcode === code);
    if (!found) {
      setError("Barcode not found. Ensure this is a valid product barcode, not a product name.");
      return;
    }

    setSelected(found.id);
    setQuantity(1);
    setCustomPrice(found.selling_price);
    setBarcodeInput("");
    setError("");
  };

  useEffect(() => {
    if (selected) {
      const product = products.find(p => p.id === Number(selected));
      if (product) setCustomPrice(product.selling_price * quantity);
    }
  }, [selected, quantity]);

  const addToBasket = () => {
    if (!selected || !quantity || !customPrice) return setError("Missing selection or price.");
    const product = products.find(p => p.id === Number(selected));
    if (quantity > (product.units || product.stock)) return setError("Insufficient stock.");

    setBasket([...basket, {
      productId: Number(selected),
      name: product.name,
      quantity: Number(quantity),
      unitPrice: Number(customPrice) / Number(quantity), 
      subtotal: Number(customPrice),
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
      for (const item of basket) {
        await apiFetch(`${LOCAL_ENV.API_URL}/api/sales`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.productId, quantity: item.quantity, price: item.subtotal }),
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
      head: [['ITEM DESCRIPTION', 'QTY', 'UNIT PRICE', 'SUBTOTAL']],
      body: basket.map(i => [
        toTitleCase(i.name), 
        i.quantity, 
        `N ${i.unitPrice.toLocaleString()}`, 
        `N ${i.subtotal.toLocaleString()}`
      ]),
      // Match head alignment with column alignment for balance
      headStyles: { 
        fillColor: accent, 
        textColor: [255, 255, 255], 
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 'auto' }, // Item name gets most space
        1: { halign: 'center', cellWidth: 25 }, 
        2: { halign: 'right', cellWidth: 35 }, 
        3: { halign: 'right', cellWidth: 35 }
      },
      // Ensure headers align with columns
      didParseCell: (data) => {
        if (data.section === 'head') {
            if (data.column.index === 1) data.cell.styles.halign = 'center';
            if (data.column.index === 2 || data.column.index === 3) data.cell.styles.halign = 'right';
        }
      },
      theme: 'grid',
      styles: { lineColor: [240, 240, 240], textColor: 80, cellPadding: 4 }
    });

    // 4. Totals & Signature Section
    const finalY = doc.lastAutoTable.finalY + 10;

    // Right-aligned Grand Total
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(40);
    doc.text(`Grand Total:`, 140, finalY);
    doc.text(`N ${grandTotal.toLocaleString()}`, 195, finalY, { align: "right" });

    // Signature Stamp
    const sigY = finalY + 15;
    if (signature) {
        // Label for signature
        doc.setFontSize(9).setFont("helvetica", "italic").setTextColor(150);
        doc.text("Authorized Signature", 195, sigY + 25, { align: "right" });
        
        // The Signature Image
        // (image, format, x, y, width, height)
        doc.addImage(signature, 'WEBP', 160, sigY, 35, 20); 
        
        // Optional: A small line under signature
        doc.setDrawColor(200);
        doc.line(160, sigY + 21, 195, sigY + 21);
    }

    // 5. Footer Note
    doc.setFontSize(9).setTextColor(150).setFont("helvetica", "normal");
    doc.text("Thank you for your business!", 105, 285, { align: "center" });

    doc.save(`Quantora_RECEIPT_${Date.now()}.pdf`);
};

  const basketTotal = basket.reduce((acc, item) => acc + item.subtotal, 0);
  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.price), 0);

  return (
    <HelmetProvider>
      <Helmet><title>Worker Terminal | Quantora</title></Helmet>
      <div className="min-h-screen bg-[#050505] text-gray-200">
        <main className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* REVENUE CARD */}
            <div className="bg-blue-600/10 border border-blue-500/20 px-6 py-5 rounded-[2rem] flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl"><TrendingUp className="text-white" size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest">Revenue Collected Today</p>
                <p className="text-xl font-black text-white">₦{totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            {/* ACTIVE SESSION CARD */}
            <div className="bg-white/5 border border-white/5 px-6 py-5 rounded-[2rem] flex items-center gap-4">
              <div className="p-3 bg-gray-700 rounded-2xl"><CheckCircle2 className="text-white" size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-tight">Active Session</p>
                <p className="text-xl font-black text-white uppercase tracking-tight">
                  {currentUser?.shop_name || "QUANTORA"} AUTHORIZED STAFF
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              {/* TERMINAL ENTRY */}
              <div className="bg-[#0c0c0c] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Terminal Entry</h2>
                  <button onClick={() => setIsScanning(!isScanning)} className="bg-blue-600 p-2 rounded-xl text-white hover:scale-105 transition-all"><Scan size={18} /></button>
                </div>

                {isScanning && <div id="reader" className="aspect-video rounded-3xl overflow-hidden mb-6"></div>}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => handleBarcodeInputChange(e.target.value)}
                      placeholder="Enter barcode (not product name)"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={lookupBarcode} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs uppercase font-black tracking-wide">Lookup Barcode</button>
                      <button onClick={() => setBarcodeInput("")} className="flex-1 py-3 border border-white/20 text-white rounded-xl text-xs uppercase font-black tracking-wide">Clear</button>
                    </div>
                    <p className="text-[10px] text-gray-400">If you type a product name, you will get a warning since this field expects barcode value only.</p>
                  </div>

                  <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none">
                    <option value="">Select Item...</option>
                    {products.map(p => <option key={p.id} value={p.id} className="bg-black">{p.name} ({p.units} in stock)</option>)}
                  </select>

                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none" placeholder="Qty" />
                    <input type="number" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-blue-400 outline-none" placeholder="Price" />
                  </div>
                  <button onClick={addToBasket} className="w-full py-5 bg-white text-black font-black uppercase text-xs rounded-2xl hover:bg-gray-200 transition-all">Add to Basket</button>

                  {error && <p className="text-red-400 text-xs font-bold">{error}</p>}
                </div>
              </div>

              {/* BASKET / CHECKOUT */}
              {basket.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-600 p-8 rounded-[2.5rem] text-white">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black uppercase text-[10px] tracking-widest opacity-70">Checkout List</h3>
                    <button onClick={() => setBasket([])}><Trash2 size={16} className="opacity-50 hover:opacity-100"/></button>
                  </div>
                  <div className="space-y-3 mb-6 max-h-40 overflow-y-auto pr-2">
                    {basket.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-bold">{item.name} <span className="text-white/50 text-[10px]">x{item.quantity}</span></span>
                        <span className="font-black">₦{item.subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/20 pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase font-medium opacity-70">Total Amount</span>
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

            {/* RECENT SALES TABLE */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-4 px-2">
                <History size={16} className="text-gray-500" />
                <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Session Activity</h2>
              </div>
              <div className="bg-[#0c0c0c] border border-white/5 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] text-[9px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">
                    <tr>
                      <th className="px-6 py-5">Item</th>
                      <th className="px-6 py-5 text-right">Amount Sold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sales.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.01]">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">{toTitleCase(s.product_name)}</p>
                          <p className="text-[9px] text-gray-600">QTY: {s.quantity} | {new Date(s.created_at).toLocaleTimeString()}</p>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-black text-white">₦{Number(s.price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sales.length === 0 && <p className="p-10 text-center text-xs text-gray-600 italic">No sales recorded yet this session.</p>}
              </div>
            </div>
          </div>
        </main>
      </div>
    </HelmetProvider>
  );
}