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
  
  // --- SILENT ACCOUNTABILITY ---
  // We grab the name but we DO NOT display it in the UI return below.
  const [activeStaffName, setActiveStaffName] = useState("Unknown Staff");

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
    
    // Get the active staff name from localStorage
    const staffName = localStorage.getItem("quantora_active_user") || "Unknown Staff";
    setActiveStaffName(staffName);
    
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

  const normalizeBarcode = (value) => String(value ?? "").trim();

  const handleBarcodeMatch = (code) => {
    const normalizedCode = normalizeBarcode(code);
    const found = products.find((p) => normalizeBarcode(p.barcode) === normalizedCode);
    if (found) {
      setSelected(found.id);
      setQuantity(1);
      setCustomPrice(found.selling_price);
      setError("");
    } else {
      setError(`SKU ${normalizedCode} not found.`);
    }
  };

  const handleBarcodeInputChange = (value) => {
    setBarcodeInput(value);
    if (!value) { setError(""); return; }
    if (/[a-zA-Z]/.test(value)) { setError("Barcode is numeric only."); return; }
    setError("");
  };

  const lookupBarcode = () => {
    const code = normalizeBarcode(barcodeInput);
    if (!code) return;
    const found = products.find((p) => normalizeBarcode(p.barcode) === code);
    if (!found) {
      setError("Barcode not found.");
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
    if (!selected || !quantity || !customPrice) return setError("Missing selection.");
    const product = products.find(p => p.id === Number(selected));
    const availableStock = Number(product.units || product.stock || 0);
    
    if (availableStock <= 0) return setError("Product is out of stock and cannot be added.");
    if (quantity > availableStock) return setError("Insufficient stock.");

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
      for (let i = 0; i < basket.length; i++) {
        const item = basket[i];
        const payload = { 
          productId: item.productId, 
          quantity: item.quantity, 
          price: item.subtotal,
          // SENDING THE NAME SILENTLY TO THE BACKEND COLUMN
          soldBy: activeStaffName && activeStaffName !== "Unknown Staff" ? activeStaffName : "Worker"
        };

        // Send receiptData on the first item for archival (always, regardless of print)
        if (i === 0) {
          payload.receiptData = {
            customerName: customerName || "Walk-in Customer",
            workerName: activeStaffName && activeStaffName !== "Unknown Staff" ? activeStaffName : "Worker",
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
    doc.text(`N${grandTotal.toLocaleString()}`, 195, finalY, { align: "right" });

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

  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.price), 0);

  return (
    <HelmetProvider>
      <Helmet><title>Worker Terminal | Quantora</title></Helmet>
      <div className="min-h-screen bg-[#050505] text-gray-200">
        <main className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-600/10 border border-blue-500/20 px-6 py-5 rounded-[2rem] flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl"><TrendingUp size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest">Today's Revenue</p>
                <p className="text-xl font-black text-white">₦{totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 px-6 py-5 rounded-[2rem] flex items-center gap-4">
              <div className="p-3 bg-gray-700 rounded-2xl"><CheckCircle2 size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-tight">System Status</p>
                <p className="text-lg font-black text-white uppercase tracking-tight">{currentUser?.shopName || currentUser?.shop_name || "Shop"} Worker</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#0c0c0c] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Sales Entry</h2>
                  <button onClick={() => setIsScanning(!isScanning)} className="bg-blue-600 p-2 rounded-xl"><Scan size={18} /></button>
                </div>

                {isScanning && <div id="reader" className="aspect-video rounded-3xl overflow-hidden mb-6"></div>}

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={barcodeInput}
                        onChange={(e) => handleBarcodeInputChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            lookupBarcode();
                          }
                        }}
                        placeholder="Barcode"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none"
                      />
                      <button
                        type="button"
                        onClick={lookupBarcode}
                        className="px-5 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all"
                      >
                        Find
                      </button>
                    </div>
                    <p className="text-[10px] text-amber-400 font-medium mt-1 px-1">⚠️ Barcode only - not product name or any other text</p>
                  </div>
                  <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none">
                    <option value="">Select Product...</option>
                    {products.map(p => {
                      const stock = Number(p.units || p.stock || 0);
                      const isOutOfStock = stock <= 0;
                      return <option key={p.id} value={p.id} disabled={isOutOfStock} className="bg-black">{p.name} ({stock} left){isOutOfStock ? ' - OUT OF STOCK' : ''}</option>;
                    })}
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none" placeholder="Qty" />
                    <input type="number" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-bold text-blue-400 outline-none" />
                  </div>
                  <button onClick={addToBasket} className="w-full py-5 bg-white text-black font-black uppercase text-xs rounded-2xl">Add to Basket</button>
                  {error && <p className="text-red-400 text-xs font-bold">{error}</p>}
                </div>
              </div>

              {basket.length > 0 && (
                <div className="bg-blue-600 p-8 rounded-[2.5rem]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black uppercase text-[10px] tracking-widest">Current Basket</h3>
                    <button onClick={() => setBasket([])} className="text-white/70 hover:text-white transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3 mb-6">
                    {basket.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="font-black">₦{item.subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/20 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase opacity-80">Basket Total</span>
                      <span className="text-2xl font-black">₦{basket.reduce((acc, item) => acc + item.subtotal, 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <input type="text" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm mb-4 outline-none" />
                  <div className="space-y-3">
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
              )}
            </div>

            <div className="lg:col-span-7">
              <div className="bg-[#0c0c0c] border border-white/5 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] text-[9px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">
                    <tr>
                      <th className="px-6 py-5">Product</th>
                      <th className="px-6 py-5 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sales.map((s) => (
                      <tr key={s.id}>
                        <td className="px-6 py-4 text-sm font-bold">{toTitleCase(s.product_name)}</td>
                        <td className="px-6 py-4 text-right text-sm font-black">₦{Number(s.price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </HelmetProvider>
  );
}




