/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Download, Eye } from "lucide-react";
import apiFetch from "../utils/apiFetch.js";

export default function Invoices() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSales, setSelectedSales] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const current = new Date().getFullYear();
    setYears(Array.from({ length: 5 }, (_, i) => current - i));
  }, []);

  useEffect(() => {
    if (!token) return;

    apiFetch(`http://localhost:5000/api/sales/daily?year=${year}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch daily sales");
        return res.json();
      })
      .then((data) => setDailySales(data))
      .catch((err) => console.error(err));
  }, [year, token]);

  const handleDownload = async (date) => {
    try {
      const res = await apiFetch(
        `http://localhost:5000/api/sales/daily/${date}/pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `sales-${date}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleView = async (date) => {
    setViewLoading(true);
    setSelectedDate(date);

    try {
      const res = await apiFetch(
        `http://localhost:5000/api/sales/daily/${formatDate(date)}/view`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Failed to fetch sales for this date");

      const data = await res.json();
      setSelectedSales(data);
      setViewModalOpen(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setViewLoading(false);
    }
  };

  /* Calculate total for selected day */
  const totalForSelectedDate = selectedSales.reduce(
    (acc, s) => acc + s.price * s.quantity,
    0
  );

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-gray-300">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

      <div className="flex-1 flex flex-col">
        <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />

        <main className="px-3 sm:px-4 md:px-6 py-6 space-y-6">
          {/* Year Filter */}
          <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
            <label className="text-base sm:text-lg font-semibold text-gray-200 flex items-center gap-2">
              Select Year:
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="select-year px-4 py-2 rounded bg-[#161b22] border border-[#30363d] 
                text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-[#0d1117] text-gray-300">
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Sales Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-x-auto bg-[#161b22] rounded-xl shadow-md border border-[#30363d]"
          >
            <table className="min-w-full text-sm sm:text-base border-collapse text-gray-300">
              <thead>
                <tr className="bg-blue-700 text-white text-left">
                  <th className="py-3 px-4">S/N</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {dailySales.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 px-4 text-center text-gray-400">
                      No sales found for {year}.
                    </td>
                  </tr>
                ) : (
                  dailySales.map((row, index) => (
                    <tr
                      key={row.date}
                      className="border-b border-[#30363d] hover:bg-[#1e2530] transition"
                    >
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-400">
                        ₦{Number(row.total).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleView(row.date)}
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                          >
                            <Eye size={16} /> View
                          </button>

                          <button
                            onClick={() => handleDownload(formatDate(row.date))}
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                          >
                            <Download size={16} /> PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>

          {/* View Modal */}
          {viewModalOpen && (
            <div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setViewModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d1117] text-gray-300 rounded-xl shadow-lg w-full max-w-3xl p-6 overflow-auto max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Sales for {new Date(selectedDate).toLocaleDateString()}
                  </h2>
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    Close
                  </button>
                </div>

                {viewLoading ? (
                  <p className="text-center py-6">Loading...</p>
                ) : selectedSales.length === 0 ? (
                  <p className="text-center py-6 text-gray-400">
                    No sales for this date.
                  </p>
                ) : (
                  <>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-blue-700 text-white text-left">
                          <th className="py-2 px-3">S/N</th>
                          <th className="py-2 px-3">Product</th>
                          <th className="py-2 px-3">Quantity</th>
                          <th className="py-2 px-3">Price</th>
                          <th className="py-2 px-3">Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedSales.map((s, i) => (
                          <tr
                            key={s.id}
                            className="border-b border-[#30363d] hover:bg-[#1e2530]"
                          >
                            <td className="py-2 px-3">{i + 1}</td>
                            <td className="py-2 px-3">{s.product_name}</td>
                            <td className="py-2 px-3">{s.quantity}</td>
                            <td className="py-2 px-3">
                              ₦{Number(s.price).toLocaleString()}
                            </td>
                            <td className="py-2 px-3 font-semibold">
                              ₦{(s.price * s.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Total Amount for Selected Day */}
                    <div className="mt-4 flex justify-end text-lg font-semibold text-blue-400">
                      Total: ₦{totalForSelectedDate.toLocaleString()}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleDownload(formatDate(selectedDate))}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                      >
                        Download PDF
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
