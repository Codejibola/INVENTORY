/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Download, Eye, Calendar, FileText, X, Loader2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";
import LOCAL_ENV from "../../ENV.js";
import { Helmet, HelmetProvider } from "react-helmet-async";
import logo from "../assets/logo.webp";
import signatureStamp from "../assets/signature.webp";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export default function Invoices() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState("");
  const [years, setYears] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSales, setSelectedSales] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [viewLoading, setViewLoading] = useState(false);
  const [downloadingDate, setDownloadingDate] = useState(null);
  const token = localStorage.getItem("token");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // --- REUSABLE FETCH FUNCTION ---
  const fetchDailySales = useCallback(() => {
    if (!token) return;
    apiFetch(`${LOCAL_ENV.API_URL}/api/sales/daily?year=${year}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setDailySales(data))
      .catch((err) => console.error(err));
  }, [year, token]);

  // --- MIDNIGHT AUTO-REFRESH LOGIC ---
  useEffect(() => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Target next 12:00:00 AM

    const msUntilMidnight = midnight.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      console.log("New day detected. Refreshing invoice records...");
      fetchDailySales();
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, [dailySales, fetchDailySales]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    const current = new Date().getFullYear();
    setYears(Array.from({ length: 5 }, (_, i) => current - i));
  }, []);

  useEffect(() => {
    fetchDailySales();
  }, [fetchDailySales]);

  useEffect(() => {
    let filtered = dailySales;
    if (month !== "") {
      filtered = filtered.filter((item) => new Date(item.date).getMonth() === month);
    }
    setFilteredSales(filtered);
    setCurrentPage(1);
  }, [month, dailySales]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleView = async (date) => {
    setViewLoading(true);
    setSelectedDate(date);
    try {
      const res = await apiFetch(`${LOCAL_ENV.API_URL}/api/sales/daily/${formatDate(date)}/view`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSelectedSales(data);
      setViewModalOpen(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setViewLoading(false);
    }
  };


const handleDownload = async (date) => {
  setDownloadingDate(date);
  try {
    const res = await apiFetch(`${LOCAL_ENV.API_URL}/api/sales/daily/${date}/data`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { shopName, sales } = await res.json();

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- 1. BRAND WATERMARK ---
    doc.setTextColor(245, 245, 245); 
    doc.setFontSize(60);
    doc.setFont("helvetica", "bold");
    doc.text("QUANTORA", pageWidth / 2, 150, { align: "center", angle: 45 });

    // --- 2. HEADER SECTION ---
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageWidth, 45, "F");
    
    if (logo) {
      doc.addImage(logo, "PNG", 15, 8, 20, 20); 
    }

    doc.setTextColor(255, 255, 255); 
    doc.setFontSize(20);
    doc.text(shopName.toUpperCase(), 40, 22); 
    doc.setFontSize(10);
    doc.text(`SALES REPORT | DATE: ${date}`, 40, 32);

    // --- 3. TABLE SECTION ---
    const tableRows = sales.map((r, i) => [
      i + 1,
      r.product_name.toUpperCase(),
      `N${(Number(r.price) / Number(r.quantity)).toLocaleString()}`,
      r.quantity,
      `N${Number(r.price).toLocaleString()}`,
      `${Number(r.profit_loss) >= 0 ? '+' : ''}N${Number(r.profit_loss).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['#', 'Product', 'Unit Price', 'Qty', 'Total', 'Profit/Loss']],
      body: tableRows,
      headStyles: { fillColor: [15, 23, 42], fontSize: 9, halign: 'center' },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right' },
      },
      styles: { fontSize: 8, cellPadding: 5, fillColor: false, fillColor: false },
      didParseCell: function (data) {
        if (data.column.index === 5 && data.section === 'body') {
          const val = data.cell.raw;
          if (val && val.includes('-')) data.cell.styles.textColor = [220, 38, 38]; // Red for loss
          else if (val) data.cell.styles.textColor = [22, 163, 74]; // Green for profit
        }
      }
    });

    // --- 4. TOTALS & SIGNATURE ---
    let currentY = doc.lastAutoTable.finalY + 15;
    
    // CALCULATIONS
    const totalRev = sales.reduce((acc, s) => acc + Number(s.price), 0);
    const totalPL = sales.reduce((acc, s) => acc + Number(s.profit_loss), 0);

    // Render Grand Total Revenue
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`GRAND TOTAL: N${totalRev.toLocaleString()}`, pageWidth - 15, currentY, { align: "right" });

    // Render Total Profit/Loss (Color coded)
    currentY += 8; // Move down slightly
    if (totalPL >= 0) {
      doc.setTextColor(22, 163, 74); // Green
      doc.text(`TOTAL PROFIT: +N${totalPL.toLocaleString()}`, pageWidth - 15, currentY, { align: "right" });
    } else {
      doc.setTextColor(220, 38, 38); // Red
      doc.text(`TOTAL LOSS: N${totalPL.toLocaleString()}`, pageWidth - 15, currentY, { align: "right" });
    }

    // Reset for signature
    if (signatureStamp) {
  doc.addImage(signatureStamp, "PNG", pageWidth - 55, currentY + 5, 40, 25);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100);
  
  doc.text("Authorized Signature", pageWidth - 35, currentY + 35, { align: "center" });
}

    // --- 5. FOOTER ---
    doc.setFontSize(7);
    doc.setTextColor(180);
    doc.text(`Generated by Quantora Systems at ${new Date().toLocaleString()}`, pageWidth / 2, 285, { align: "center" });

    doc.save(`Invoice-${formatDate(date)}.pdf`);

  } catch (err) {
    console.error("PDF Error:", err);
    alert("Could not generate PDF.");
  } finally{
    setDownloadingDate(null);
  }
};

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredSales.slice(indexOfFirst, indexOfLast);
  const totalForSelectedDate = selectedSales.reduce((acc, s) => acc + Number(s.price), 0);

  return (
    <HelmetProvider>
      <Helmet><title>Invoices | Quantora</title></Helmet>

      <div className="flex min-h-screen bg-[#050505] text-gray-300">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />

          <main className="p-6 lg:p-10 space-y-8 max-w-6xl mx-auto w-full">
            <header>
              <h1 className="text-3xl font-black text-white tracking-tight">Sales Invoices</h1>
              <p className="text-gray-500 text-sm">Review and export daily transaction reports. System resets at 12 AM.</p>
            </header>

            {/* FILTERS */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#111] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl"><Calendar size={20}/></div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Year</p>
                  <select 
                    value={year} 
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="bg-transparent text-white font-bold outline-none w-full"
                  >
                    {years.map(y => <option key={y} value={y} className="bg-[#111]">{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-[#111] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-purple-600/10 text-purple-500 rounded-xl"><FileText size={20}/></div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Month</p>
                  <select 
                    value={month} 
                    onChange={(e) => setMonth(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-transparent text-white font-bold outline-none w-full"
                  >
                    <option value="" className="bg-[#111]">All Months</option>
                    {months.map((m, idx) => <option key={m} value={idx} className="bg-[#111]">{m}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* TABLE */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
            >
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Total Revenue</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode='popLayout'>
                    {currentData.length === 0 ? (
                      <motion.tr 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        key="empty"
                      >
                        <td colSpan="3" className="px-6 py-20 text-center text-gray-600 italic">No invoice records found for this period.</td>
                      </motion.tr>
                    ) : (
                      currentData.map((row) => (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          key={row.date} 
                          className="group hover:bg-white/[0.01] transition-colors"
                        >
                          <td className="px-6 py-4 font-bold text-gray-300">
                            {new Date(row.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                          </td>
                          <td className="px-6 py-4 font-black text-blue-400">
                            ₦{Number(row.total_sales ?? 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleView(row.date)}
                                className="p-2 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 rounded-lg transition-all"
                              >
                                <Eye size={18} />
                              </button>
                             <button 
                              disabled={downloadingDate === formatDate(row.date)}
                              onClick={() => handleDownload(formatDate(row.date))}
                              className="p-2 hover:bg-green-500/10 text-gray-400 hover:text-green-400 rounded-lg transition-all disabled:opacity-50"
                            >
                             {downloadingDate === formatDate(row.date) ? (
                                <Loader2 className="animate-spin" size={18} />
                             ) : (
                              <Download size={18} />
                              )}
                            </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>
          </main>
        </div>

        {/* MODAL SECTION REMAINS THE SAME AS BEFORE */}
        <AnimatePresence>
          {viewModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setViewModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#0d0d0d] border border-white/10 w-full max-w-2xl rounded-3xl shadow-3xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <h2 className="text-xl font-black text-white">Daily Report</h2>
                  <button onClick={() => setViewModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X/></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                   <div className="mb-6">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Transaction Date</p>
                      <p className="text-lg font-bold text-blue-400">{new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                   </div>

                   <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[10px] font-black text-gray-500 uppercase border-b border-white/5">
                          <th className="pb-3">Product</th>
                          <th className="pb-3">Qty</th>
                          <th className="pb-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedSales.map((s) => (
                          <tr key={s.id}>
                            <td className="py-3 font-bold text-gray-300 capitalize">{s.product_name?.toLowerCase() || s.product_name}</td>
                            <td className="py-3 text-gray-500">×{s.quantity}</td>
                            <td className="py-3 text-right font-bold text-white">₦{Number(s.price).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase">Grand Total</p>
                    <p className="text-2xl font-black text-white">₦{totalForSelectedDate.toLocaleString()}</p>
                  </div>
                  
                  <button 
  disabled={downloadingDate === formatDate(selectedDate)}
  onClick={() => handleDownload(formatDate(selectedDate))}
  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 disabled:bg-blue-800"
>
  {downloadingDate === formatDate(selectedDate) ? (
    <>
      <Loader2 className="animate-spin" size={16} />
      Downloading...
    </>
  ) : (
    "Download PDF"
  )}
</button>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </HelmetProvider>
  );
}
