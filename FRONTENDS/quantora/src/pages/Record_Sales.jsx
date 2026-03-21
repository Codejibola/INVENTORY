/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";
import LOCAL_ENV from "../../ENV.js";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { ShoppingCart, Package, DollarSign, TrendingUp, History, Receipt, Trash2, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.webp";
import signatureStamp from "../assets/signature.webp";

const toTitleCase = (str = "") =>
  str.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export default function RecordSales() {
  const token = localStorage.getItem("token");

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

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const fetchProducts = () => {
    apiFetch(`${LOCAL_ENV.API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list);
      })
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
        const filtered = all.filter((s) => {
          if (!s.created_at) return false;
          const saleDate = new Date(s.created_at).toLocaleDateString('en-CA');
          return saleDate === todayStr;
        });
        setSales(filtered);
      })
      .catch(() => setError("Failed to load sales"));
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [token]);

  const addToBasket = () => {
    if (!selected || !quantity || !totalPrice) return setError("Fill all fields first.");
    const product = products.find((p) => p.id === Number(selected));

    const newItem = {
      productId: Number(selected),
      name: product.name,
      quantity: Number(quantity),
      price: Number(totalPrice),
    };

    setBasket([...basket, newItem]);
    setSelected("");
    setQuantity(1);
    setTotalPrice("");
  };

  const finalizeReceipt = async () => {
    setLoading(true);
    setError("");
    const successfulItems = [];

    try {
      // 1. Record each item in the backend
      for (const item of basket) {
        const response = await apiFetch(`${LOCAL_ENV.API_URL}/api/sales`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }),
        });
        if (response.ok) successfulItems.push(item);
      }

      if (successfulItems.length === 0) throw new Error("Could not record sales.");

      // 2. Calculate Grand Total (Sum of all line items)
      const grandTotal = successfulItems.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);

      // 3. Initialize PDF
      const doc = new jsPDF();
      const shopName = currentUser?.shop_name || "Quantora Merchant";
      const accentColor = [37, 99, 235];

      // Header UI
      doc.setFillColor(250, 250, 250);
      doc.rect(0, 0, 210, 45, 'F');
      if (logo) doc.addImage(logo, 'PNG', 14, 10, 22, 22);

      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(shopName.toUpperCase(), 200, 22, { align: "right" });

      doc.setTextColor(100);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Official Transaction Receipt", 200, 28, { align: "right" });
      doc.text(`Ref: QT-${Math.floor(Date.now() / 1000)}`, 200, 33, { align: "right" });

      // Customer Info
      doc.setTextColor(50);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("BILLED TO", 14, 55);
      doc.text("DATE & TIME", 120, 55);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(customerName || "Walking Customer", 14, 61);
      doc.text(new Date().toLocaleString(), 120, 61);

      // Table Data
      const tableData = successfulItems.map(item => [
        toTitleCase(item.name),
        `${item.quantity}`,
        `N ${item.price.toLocaleString()}`,
        `N ${(item.quantity * item.price).toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: 70,
        head: [['ITEM DESCRIPTION', 'QTY', 'UNIT PRICE', 'SUBTOTAL']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: accentColor, fontSize: 9, fontStyle: 'bold', halign: 'center' },
        columnStyles: { 
          0: { cellWidth: 80 }, 
          1: { halign: 'center' }, 
          2: { halign: 'right' }, 
          3: { halign: 'right', fontStyle: 'bold' } 
        },
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 },
      });

      // 4. THE FIX: Rendering the Grand Total Box
      const finalY = doc.lastAutoTable.finalY + 10;
      
      doc.setFillColor(37, 99, 235); // Blue background
      doc.rect(130, finalY, 66, 14, 'F'); // x, y, width, height
      
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      // This line centers the text inside the blue box
      doc.text(`TOTAL: N${grandTotal.toLocaleString()}`, 163, finalY + 9, { align: "center" });

      // Signature
      if (signatureStamp) doc.addImage(signatureStamp, 'PNG', 145, finalY + 20, 35, 18);

      doc.save(`Receipt_${customerName || 'Sale'}.pdf`);

      // UI Cleanup
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      await fetchProducts();
      await fetchSales();
      setBasket([]);
      setCustomerName("");
      setLoading(false);

    } catch (err) {
      setError(`Receipt Error: ${err.message}`);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selected) return setError("Please select a product.");
    if (!quantity || quantity < 1) return setError("Quantity must be at least 1.");
    if (!totalPrice || totalPrice <= 0) return setError("Total price must be greater than 0.");

    const product = products.find((p) => p.id === Number(selected));
    if (quantity > product.units) return setError(`Only ${product.units} units left.`);

    setLoading(true);
    try {
      await apiFetch(`${LOCAL_ENV.API_URL}/api/sales`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: Number(selected),
          quantity: Number(quantity),
          price: Number(totalPrice),
        }),
      });
      fetchProducts();
      fetchSales();
      setSelected("");
      setQuantity(1);
      setTotalPrice("");
    } catch {
      setError("Error recording sale.");
    } finally {
      setLoading(false);
    }
  };

  const totalToday = sales.reduce((acc, s) => acc + Number(s.price), 0);
  const suggestedPrice = selected ? products.find(p => p.id === Number(selected))?.selling_price * quantity : 0;
  const basketTotal = basket.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  return (
    <HelmetProvider>
      <Helmet><title>Record Sale | Quantora</title></Helmet>
      <div className="flex min-h-screen bg-[#050505] text-gray-200">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />
          
          <main className="p-6 lg:p-10 space-y-8 max-w-[1200px] mx-auto w-full">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Record Sales</h1>
                <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
              </div>
              <div className="bg-blue-600/10 border border-blue-500/20 px-6 py-3 rounded-2xl flex items-center gap-4">
                <TrendingUp className="text-blue-400" size={24} />
                <div>
                  <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest">Today's Revenue</p>
                  <p className="text-xl font-black text-white">₦{totalToday.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* TRANSACTION FORM */}
              <motion.div className="lg:col-span-5 bg-[#111] border border-white/5 p-8 rounded-3xl shadow-2xl relative">
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg"><Package size={20}/></div>
                    <h2 className="text-lg font-bold text-white uppercase tracking-tight">New Transaction</h2>
                  </div>

                  {error && <p className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl text-center font-bold">{error}</p>}

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-500">Product</label>
                    <select
                      value={selected}
                      onChange={(e) => { setSelected(e.target.value); setTotalPrice(""); }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    >
                      <option value="">Choose a product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#111]">{toTitleCase(p.name)} ({p.units} left)</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-gray-500">Qty</label>
                      <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-gray-500">Price (₦)</label>
                      <input type="number" value={totalPrice} onChange={(e) => setTotalPrice(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" placeholder={suggestedPrice || "0.00"}/>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs transition-all border border-white/10">
                      {loading ? "..." : "Record Single Sale"}
                    </button>
                    
                    <button type="button" onClick={addToBasket} className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-600/20">
                      Add to Receipt Basket
                    </button>
                  </div>
                </form>

                {/* BASKET PREVIEW SECTION */}
                <AnimatePresence>
                  {basket.length > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-8 pt-8 border-t border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase text-blue-400">Current Receipt ({basket.length})</h3>
                        <button onClick={() => setBasket([])} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                      </div>
                      
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {basket.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs bg-white/5 p-2 rounded-lg">
                            <span>{toTitleCase(item.name)} (x{item.quantity})</span>
                            <span className="font-bold">₦{item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* --- NEW GRAND TOTAL PREVIEW --- */}
                      <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-2xl flex justify-between items-center">
                        <div>
                          <p className="text-[9px] uppercase font-black text-blue-400 tracking-widest">Basket Total</p>
                          <p className="text-lg font-black text-white">₦{basketTotal.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
                           ₦
                        </div>
                      </div>
                      {/* ------------------------------- */}

                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Customer Name (Optional)" 
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                        />
                        <button 
                          onClick={finalizeReceipt} 
                          disabled={loading}
                          className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                          <Download size={16}/> {loading ? "Syncing..." : "Finalize & Download Receipt"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              {/* COLOR LEGEND */}
<div className="flex gap-4 mb-2">
  <div className="flex items-center gap-1.5">
    <div className="w-2 h-2 rounded-full bg-green-500"></div>
    <span className="text-[10px] uppercase font-bold text-gray-400">Green = Profit</span>
  </div>
  <div className="flex items-center gap-1.5">
    <div className="w-2 h-2 rounded-full bg-red-500"></div>
    <span className="text-[10px] uppercase font-bold text-gray-400">Red = Loss</span>
  </div>
</div>

              {/* SALES TABLE SECTION */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-gray-500" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Today's Activity</h2>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-3xl shadow-xl overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left min-w-[500px]">
                      <thead className="bg-white/[0.02] text-[10px] uppercase font-black text-gray-500 tracking-widest border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4">Item</th>
                          <th className="px-6 py-4">Qty</th>
                          <th className="px-6 py-4">Total</th>
                          <th className="px-6 py-4 text-right">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {sales.length > 0 ? sales.map((s) => (
                          <tr key={s.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-white text-xs md:text-sm">{toTitleCase(s.product_name)}</p>
                              <p className="text-[9px] md:text-[10px] text-gray-600 uppercase">
                                {new Date(s.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-gray-400">×{s.quantity}</td>
                            <td className="px-6 py-4 font-bold text-white">₦{Number(s.price).toLocaleString()}</td>
                            <td className={`px-6 py-4 text-right font-black text-xs md:text-sm ${Number(s.profit_loss) >= 0 ? "text-green-500" : "text-red-500"}`}>
                              ₦{Math.abs(Number(s.profit_loss)).toLocaleString()}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-10 text-center text-gray-600 italic">No transactions recorded today.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed top-24 right-6 z-[100] bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-green-400/20"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <Receipt size={20} />
            </div>
            <div>
              <p className="font-black text-xs uppercase tracking-widest text-white">Transaction Success</p>
              <p className="text-[10px] opacity-80 text-white">Sales recorded & Receipt downloaded.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </HelmetProvider>
  );
}
