import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import LOCAL_ENV from '../../ENV.js';
import logo from '../assets/logo.webp';
import signature from '../assets/signature.webp';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { 
  FileText, Download, Search, Loader2, 
  Printer, CheckCircle2, ArrowLeft
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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

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
      if (window.innerWidth >= 1024 && parsedReceipts.length > 0) {
        setSelectedReceipt(parsedReceipts[0]);
      }
    } catch (err) {
      setError("Failed to sync with Quantora Ledger.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  const downloadPDF = async (receiptData) => {
    if (!receiptData || downloadingPDF) return;
    
    setDownloadingPDF(true);
    
    try {
      // Small delay to allow React to render the loading state
      await new Promise(resolve => setTimeout(resolve, 300));

      const doc = new jsPDF();
      const accent = [37, 99, 235]; // Quantora Blue
      
      // 1. Header & Branding
      doc.setFillColor(252, 252, 252);
      doc.rect(0, 0, 210, 50, 'F');
      if (logo) doc.addImage(logo, 'PNG', 15, 12, 25, 25);

      doc.setFont("helvetica", "bold").setFontSize(24).setTextColor(accent[0], accent[1], accent[2]);
      doc.text(currentUser?.shop_name?.toUpperCase() || "QUANTORA MERCHANT", 195, 25, { align: "right" });
      
      doc.setFontSize(10).setTextColor(100).setFont("helvetica", "normal");
      doc.text("Official Transaction Receipt", 195, 32, { align: "right" });
      doc.text(`Ref: QT-${receiptData.id}`, 195, 38, { align: "right" });

      // 2. Info Section
      doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(50);
      doc.text("BILLED TO", 15, 65);
      doc.text("DATE & TIME", 120, 65);
      
      doc.setFont("helvetica", "normal").setTextColor(100);
      doc.text(receiptData.customer_name || "Walk-in Customer", 15, 72);
      doc.text(new Date(receiptData.created_at || Date.now()).toLocaleString(), 120, 72);

      // 3. Table
      autoTable(doc, {
        startY: 80,
        head: [['ITEM DESCRIPTION', 'QTY', 'UNIT PRICE (N)', 'SUBTOTAL (N)']],
        body: receiptData.items.map(i => [
          i.name, 
          i.quantity, 
          `N${i.price.toLocaleString()}`, 
          `N${(i.price * i.quantity).toLocaleString()}`
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
      doc.text(`TOTAL: N${receiptData.total_amount.toLocaleString()}`, 160, finalY + 9.5, { align: "center" });

      // 5. Signature Section
      if (signature) {
        const sigCenterX = 160;
        const sigY = finalY + 25;
        doc.addImage(signature, 'PNG', sigCenterX - 17.5, sigY, 35, 18); 
        doc.setDrawColor(accent[0], accent[1], accent[2]).setLineWidth(0.8);
        doc.line(sigCenterX - 20, sigY + 21, sigCenterX + 20, sigY + 21); 
        doc.setTextColor(accent[0], accent[1], accent[2]).setFontSize(8).setFont("helvetica", "bold");
        doc.text("AUTHORIZED SIGNATURE", sigCenterX, sigY + 26, { align: "center" });
      }

      doc.save(`Receipt_QT-${receiptData.id}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
    } finally {
      setDownloadingPDF(false);
    }
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
              
              {/* LEFT: MASTER LIST */}
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

              {/* RIGHT: DETAIL VIEW */}
              <div className={`w-full lg:w-1/2 flex flex-col bg-[#050506] transition-all duration-300 ${viewMode === 'list' ? 'hidden lg:flex' : 'flex'}`}>
                {selectedReceipt ? (
                  <div className="flex flex-col h-full relative">
                    
                    {/* RESPONSIVE BACK BUTTON */}
                    <button 
                      onClick={() => setViewMode('list')}
                      className="lg:hidden absolute top-6 left-6 z-30 flex items-center justify-center w-10 h-10 bg-[#1A1A1E] border border-white/10 rounded-full text-white shadow-xl active:scale-95 transition-transform"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <div className="p-4 md:p-8 flex flex-col h-full">
                      <div className="bg-[#111113] rounded-2xl p-6 md:p-8 flex-1 flex flex-col border border-white/5 shadow-inner">
                        <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6 mt-12 lg:mt-0">
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