/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import LOCAL_ENV from "../../ENV.js";
import apiFetch from "../utils/apiFetch.js";
import { Helmet } from "react-helmet-async";
import { FiPlus, FiShoppingBag, FiHash, FiCalendar, FiBox, FiTrash2, FiDownload,} from "react-icons/fi";
import { FaReceipt } from "react-icons/fa";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.webp";
import signatureStamp from "../assets/signature.webp";

export default function WorkerRecordSales() {
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [basket, setBasket] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    fetchProducts();
    fetchSales();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiFetch(`${LOCAL_ENV.API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch {
      setError("Failed to load products");
    }
  };

 const fetchSales = async () => {
    try {
      const res = await apiFetch(`${LOCAL_ENV.API_URL}/api/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      // Handle different possible data structures from the API
      const allSales = Array.isArray(data) ? data : data.sales || data || [];
      
      // Get today's date in YYYY-MM-DD format (en-CA is the standard for this)
      const todayStr = new Date().toLocaleDateString('en-CA');

      const filtered = allSales.filter((s) => {
        if (!s.created_at) return false;
        
        // Convert the sale's timestamp to the same YYYY-MM-DD format for comparison
        const saleDate = new Date(s.created_at).toLocaleDateString('en-CA');
        return saleDate === todayStr;
      });

      setSales(filtered);
    } catch (err) {
      setError("Failed to load sales activity");
    }
  };

  const toTitle = (str) => {
    if (!str) return "";
    return String(str).toLowerCase().split(" ").map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : "")).join(" ");
  };

  const addToBasket = () => {
    if (!selected || !quantity || !totalPrice) return setError("Fill all fields first.");
    const product = products.find((p) => p.id === Number(selected));
    if (quantity > product.units) return setError(`Only ${product.units} units left.`);

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
    setError("");
  };

  const finalizeReceipt = async () => {
    setLoading(true);
    setError("");
    const successfulItems = [];

    try {
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

      const grandTotal = successfulItems.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
      const doc = new jsPDF();
      const shopName = currentUser?.shop_name || "Quantora Merchant";
      const accentColor = [37, 99, 235];

      // PDF Design
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

      doc.setTextColor(50);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("BILLED TO", 14, 55);
      doc.text("DATE & TIME", 120, 55);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(customerName || "Walking Customer", 14, 61);
      doc.text(new Date().toLocaleString(), 120, 61);

      const tableData = successfulItems.map(item => [
        toTitle(item.name),
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
        columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right', fontStyle: 'bold' } },
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 },
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFillColor(37, 99, 235);
      doc.rect(130, finalY, 66, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL: N${grandTotal.toLocaleString()}`, 163, finalY + 9, { align: "center" });

      if (signatureStamp) doc.addImage(signatureStamp, 'PNG', 145, finalY + 20, 35, 18);

      doc.save(`Receipt_${customerName || 'Sale'}.pdf`);

      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      fetchProducts();
      fetchSales();
      setBasket([]);
      setCustomerName("");
    } catch (err) {
      setError(`Receipt Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!selected) return setError("Select a product");
    if (quantity < 1) return setError("Quantity must be at least 1");
    if (!totalPrice || totalPrice <= 0) return setError("Enter a valid total price");

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
      setError("Failed to record sale");
    } finally {
      setLoading(false);
    }
  };

  const totalToday = sales.reduce((a, s) => a + Number(s.price), 0);
  const basketTotal = basket.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const suggestedPrice = selected ? products.find(p => p.id === Number(selected))?.selling_price * quantity : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 pb-10">
      <Helmet><title>Quantora | Terminal</title></Helmet>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* HEADER STAT */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sales Terminal</h1>
            <p className="text-slate-500 text-sm">Welcome back, {currentUser?.name || 'Worker'}</p>
          </div>
          <div className="bg-blue-600/10 border border-blue-500/20 px-6 py-3 rounded-2xl text-center">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-bold">Today's Revenue</p>
            <p className="text-2xl font-black text-white">₦{totalToday.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FORM SECTION */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5">
            <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-xl p-8 rounded-[32px] sticky top-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiPlus className="text-blue-500" /> New Transaction
              </h2>

              {error && <p className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-3 rounded-xl mb-4 text-center font-bold">{error}</p>}

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 mb-2 block">Product</label>
                  <div className="relative">
                    <FiShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                      value={selected}
                      onChange={(e) => { setSelected(e.target.value); setTotalPrice(""); }}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm focus:border-blue-500/50 outline-none transition-all appearance-none"
                    >
                      <option value="">Select Item</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900">{toTitle(p.name)} ({p.units} in stock)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 mb-2 block">Qty</label>
                    <div className="relative">
                      <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 mb-2 block">Price (₦)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₦</span>
                      <input type="number" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} placeholder={suggestedPrice || "0.00"} className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm outline-none" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] transition-all border border-white/10">
                    {loading ? "..." : "Record Single Sale"}
                  </button>
                  <button onClick={addToBasket} className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-blue-600/20">
                    Add to Receipt Basket
                  </button>
                </div>

                {/* BASKET PREVIEW */}
                <AnimatePresence>
                  {basket.length > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-8 pt-6 border-t border-slate-800 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black uppercase text-blue-400">Current Receipt ({basket.length})</h3>
                        <button onClick={() => setBasket([])} className="text-red-500 hover:text-red-400"><FiTrash2 size={16}/></button>
                      </div>
                      
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {basket.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <span>{toTitle(item.name)} (x{item.quantity})</span>
                            <span className="font-bold text-blue-400">₦{item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl flex justify-between items-center">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-blue-400 tracking-widest">Grand Total</p>
                          <p className="text-lg font-black text-white">₦{basketTotal.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <input type="text" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" />
                        <button onClick={finalizeReceipt} disabled={loading} className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                          <FiDownload size={16}/> {loading ? "Syncing..." : "Generate Receipt"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* ACTIVITY SECTION */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-7">
            <div className="bg-slate-900/50 border border-slate-800 rounded-[32px] overflow-hidden backdrop-blur-xl">
              <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                <FiBox className="text-indigo-400" />
                <h3 className="font-bold text-white uppercase text-xs tracking-widest">Recent Activity</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950/50 text-slate-500 uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-6 py-4 text-left">Product</th>
                      <th className="px-6 py-4 text-center">Qty</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {sales.length === 0 ? (
                      <tr><td colSpan="3" className="py-20 text-center text-slate-600 text-xs italic">No transactions recorded today.</td></tr>
                    ) : (
                      sales.map((s) => (
                        <tr key={s.id} className="hover:bg-blue-500/5 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-white">{toTitle(s.product_name)}</p>
                            <p className="text-[10px] text-slate-500">{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </td>
                          <td className="px-6 py-4 text-center text-slate-400">{s.quantity}</td>
                          <td className="px-6 py-4 text-right font-bold text-blue-400">₦{Number(s.price).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }} className="fixed top-24 right-6 z-[100] bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <FaReceipt size={20} />
            <p className="font-bold text-xs uppercase tracking-widest">Receipt Generated!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}