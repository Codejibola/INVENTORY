import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import LOCAL_ENV from '../../ENV.js';
import logo from '../assets/logo.webp';
import signature from '../assets/signature.webp';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { 
  FileText, Download, Search, Loader2, 
  Printer, CheckCircle2, AlertCircle, ArrowLeft
} from 'lucide-react';

const ReceiptTerminal = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user: currentUser } = useAuth();
  
  // States
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail' for mobile responsiveness

  // Helpers
  const toTitleCase = (str) => {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const safeNumber = (value, fallback = 0) => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  };

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${LOCAL_ENV.API_URL}/api/receipts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = Array.isArray(response.data) ? response.data : response.data?.rows || [];

      const parsedReceipts = data.map((receipt) => {
        const itemsRaw = typeof receipt.items === 'string' ? JSON.parse(receipt.items || '[]') : receipt.items || [];
        const parsedItems = itemsRaw.map(item => ({
          ...item,
          name: toTitleCase(item.name),
          price: safeNumber(item.unitPrice || item.price),
          quantity: safeNumber(item.quantity, 1)
        }));
        const calculatedTotal = parsedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return {
          ...receipt,
          customer_name: toTitleCase(receipt.customer_name),
          worker_name: toTitleCase(receipt.worker_name),
          items: parsedItems,
          total_amount: safeNumber(receipt.total_amount) || calculatedTotal
        };
      });

      setReceipts(parsedReceipts);
      if (window.innerWidth >= 1024) {
        setSelectedReceipt(parsedReceipts[0] || null);
      }
    } catch (err) {
      setError("Failed to sync with Quantora Ledger.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  // COMPLETE PDF FUNCTION
  const downloadPDF = async (receipt) => {
    if (!receipt || downloadingPDF) return;
    setDownloadingPDF(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const doc = new jsPDF();
      const accent = [37, 99, 235]; 

      // Header Background
      doc.setFillColor(245, 247, 250);
      doc.rect(0, 0, 210, 45, 'F');
      
      if (logo) {
        try { doc.addImage(logo, 'WEBP', 15, 10, 22, 22); } catch(e) {}
      }

      doc.setFont("helvetica", "bold").setFontSize(22).setTextColor(accent[0], accent[1], accent[2]);
      doc.text("QUANTORA RETAIL", 195, 22, { align: "right" });
      doc.setFontSize(9).setTextColor(100).setFont("helvetica", "normal");
      doc.text(`Official Receipt: QT-${receipt.id}`, 195, 28, { align: "right" });

      // Info Section
      doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(40);
      doc.text("CUSTOMER", 15, 60);
      doc.text("DATE", 120, 60);
      doc.setFont("helvetica", "normal").setTextColor(80);
      doc.text(receipt.customer_name || "General Merchant", 15, 66);
      doc.text(new Date(receipt.created_at).toLocaleString(), 120, 66);

      // Table
      doc.autoTable({
        startY: 75,
        head: [['DESCRIPTION', 'QTY', 'PRICE', 'TOTAL']],
        body: receipt.items.map(i => [i.name, i.quantity, `N${i.price.toLocaleString()}`, `N${(i.quantity * i.price).toLocaleString()}`]),
        headStyles: { fillColor: accent, halign: 'center' },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 3: { halign: 'right' } }
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFillColor(accent[0], accent[1], accent[2]).rect(130, finalY, 65, 12, 'F');
      doc.setTextColor(255).setFontSize(12).setFont("helvetica", "bold");
      doc.text(`TOTAL: N${receipt.total_amount.toLocaleString()}`, 162.5, finalY + 8, { align: "center" });

      if (signature) {
        try { doc.addImage(signature, 'WEBP', 145, finalY + 20, 30, 15); } catch(e) {}
        doc.setDrawColor(accent[0], accent[1], accent[2]).setLineWidth(0.5);
        doc.line(140, finalY + 36, 180, finalY + 36);
        doc.setTextColor(accent[0], accent[1], accent[2]).setFontSize(7).text("AUTHORIZED", 160, finalY + 40, { align: "center" });
      }

      doc.save(`Receipt_QT_${receipt.id}.pdf`);
    } catch (err) {
      console.error("PDF Error", err);
    } finally { setDownloadingPDF(false); }
  };

  const handleSelect = (receipt) => {
    setSelectedReceipt(receipt);
    setViewMode('detail');
  };

  const filteredReceipts = receipts.filter(r => 
    r.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <HelmetProvider>
      <Helmet><title>Terminal | Quantora</title></Helmet>
      <div className="min-h-screen bg-[#0A0A0B] flex text-slate-200 overflow-hidden">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />
          
          <main className="flex-1 p-2 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto overflow-hidden">
            <div className="flex h-[82vh] bg-[#111113] overflow-hidden rounded-2xl border border-white/5 shadow-2xl relative">
              
              {/* LEFT: MASTER LIST - Hidden on mobile if detail is open */}
              <div className={`w-full lg:w-1/2 flex flex-col border-r border-white/5 bg-[#0D0D0F] transition-all duration-300 ${viewMode === 'detail' ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-4 md:p-6 border-b border-white/5">
                  <h1 className="text-sm font-black tracking-[0.2em] text-white/40 mb-4 uppercase">Internal Ledger</h1>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search ID or Customer..." 
                      className="w-full pl-10 pr-4 py-3 bg-[#1A1A1E] border border-white/10 rounded-xl text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30">
                      <Loader2 className="animate-spin mb-2" />
                      <span className="text-[10px] font-bold">SYNCING...</span>
                    </div>
                  ) : filteredReceipts.map(receipt => (
                    <div 
                      key={receipt.id}
                      onClick={() => handleSelect(receipt)}
                      className={`p-4 md:p-6 border-b border-white/[0.03] cursor-pointer transition-all ${
                        selectedReceipt?.id === receipt.id ? 'bg-blue-600 text-white' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[10px] font-bold opacity-60">#QT-{receipt.id}</span>
                        <span className="text-sm font-black">₦{receipt.total_amount.toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-bold truncate">{receipt.customer_name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: DETAIL VIEW - Full screen on mobile if detail is open */}
              <div className={`w-full lg:w-1/2 flex flex-col bg-[#050506] transition-all duration-300 ${viewMode === 'list' ? 'hidden lg:flex' : 'flex'}`}>
                {selectedReceipt ? (
                  <div className="flex flex-col h-full relative">
                    {/* Mobile Back Button */}
                    <button 
                      onClick={() => setViewMode('list')}
                      className="lg:hidden absolute top-4 left-4 z-20 p-2 bg-white/5 rounded-full text-white"
                    >
                      <ArrowLeft size={20} />
                    </button>

                    <div className="p-4 md:p-8 flex flex-col h-full">
                      <div className="bg-[#111113] rounded-2xl p-6 md:p-8 flex-1 flex flex-col border border-white/5 shadow-inner">
                        <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6">
                          <div>
                            <h2 className="text-lg font-black text-white italic tracking-tighter">RECEIPT</h2>
                            <p className="text-[10px] font-bold text-slate-500">REF: {selectedReceipt.id}</p>
                          </div>
                          <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-white">QUANTORA CORE</p>
                            <p className="text-[9px] text-blue-500 font-bold">v1.0.4</p>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                          <table className="w-full text-xs md:text-sm">
                            <thead className="text-slate-500 border-b border-white/5">
                              <tr>
                                <th className="py-3 text-left font-bold uppercase text-[9px]">Item</th>
                                <th className="py-3 text-center font-bold uppercase text-[9px]">Qty</th>
                                <th className="py-3 text-right font-bold uppercase text-[9px]">Sub</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                              {selectedReceipt.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="py-4 font-bold text-slate-200">{item.name}</td>
                                  <td className="py-4 text-center font-mono opacity-50">{item.quantity}</td>
                                  <td className="py-4 text-right font-bold text-white">₦{(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                          <div className="flex justify-between items-end mb-6">
                            <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[9px] uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full">
                              <CheckCircle2 size={12} /> Satisfies
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Grand Total</p>
                              <p className="text-3xl font-black text-white tracking-tighter leading-none">₦{selectedReceipt.total_amount.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <button 
                              onClick={() => downloadPDF(selectedReceipt)}
                              disabled={downloadingPDF}
                              className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50"
                            >
                              {downloadingPDF ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                              {downloadingPDF ? "GENERATING..." : "EXPORT PDF"}
                            </button>
                            <button className="hidden sm:flex px-6 items-center justify-center bg-[#1A1A1E] border border-white/10 rounded-xl text-slate-400">
                              <Printer size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-800">
                    <FileText size={48} strokeWidth={1} className="mb-4 opacity-10" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Audit Standby</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </HelmetProvider>
  );
};

export default ReceiptTerminal;