/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Download, Eye } from "lucide-react";
import apiFetch from "../utils/apiFetch.js";
import { Helmet } from "react-helmet-async";

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

  const token = localStorage.getItem("token");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // Get current user
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  // Set last 5 years
  useEffect(() => {
    const current = new Date().getFullYear();
    setYears(Array.from({ length: 5 }, (_, i) => current - i));
  }, []);

  // Fetch daily sales for selected year
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

  // Filter sales by month
  useEffect(() => {
    let filtered = dailySales;

    if (month !== "") {
      filtered = filtered.filter(
        (item) => new Date(item.date).getMonth() === month
      );
    }

    setFilteredSales(filtered);
    setCurrentPage(1);
  }, [month, dailySales]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-CA");

  // View daily sales
  const handleView = async (date) => {
    setViewLoading(true);
    setSelectedDate(date);

    try {
      const res = await apiFetch(
        `http://localhost:5000/api/sales/daily/${formatDate(date)}/view`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Failed to fetch sales");

      const data = await res.json();
      setSelectedSales(data);
      setViewModalOpen(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setViewLoading(false);
    }
  };

  // Download Invoice
   const handleDownload = async (date) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/sales/daily/${date}/excel`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-${date}.xlsx`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert(err.message);
  }
};


  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredSales.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const totalForSelectedDate = selectedSales.reduce(
    (acc, s) => acc + s.price * s.quantity,
    0
  );

  return (
    <>
      <Helmet>
        <title>Invoices</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex min-h-screen bg-[#0d1117] text-gray-300">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />

          <main className="px-3 sm:px-4 md:px-6 py-6 space-y-6">
            <h1 className="text-2xl font-semibold text-white mb-4">Invoices</h1>

            {/* Filters */}
            <section className="flex flex-wrap gap-4 mb-4">
              {/* Year */}
              <div className="flex flex-col">
                <label className="mb-1 text-gray-200">Select Year</label>
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="px-4 py-3 pr-12 rounded bg-[#161b22] border border-[#30363d] text-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 w-44"
                  >
                    {years.map((y) => (
                      <option key={y} value={y} className="bg-[#0d1117]">
                        {y}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    ⌄
                  </span>
                </div>
              </div>

              {/* Month */}
              <div className="flex flex-col">
                <label className="mb-1 text-gray-200">Select Month</label>
                <div className="relative">
                  <select
                    value={month}
                    onChange={(e) =>
                      setMonth(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="px-4 py-3 pr-12 rounded bg-[#161b22] border border-[#30363d] text-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 w-44"
                  >
                    <option value="">All Months</option>
                    {months.map((m, idx) => (
                      <option key={m} value={idx} className="bg-[#0d1117]">
                        {m}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    ⌄
                  </span>
                </div>
              </div>
            </section>

            {/* Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-x-auto bg-[#161b22] rounded-xl shadow-md border border-[#30363d]"
            >
              <table className="min-w-full text-sm sm:text-base text-gray-300">
                <thead>
                  <tr className="bg-blue-700 text-white text-left">
                    <th className="py-3 px-4">S/N</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-gray-400">
                        No sales found.
                      </td>
                    </tr>
                  ) : (
                    currentData.map((row, index) => (
                      <tr
                        key={row.date}
                        className="border-b border-[#30363d] hover:bg-[#1e2530]"
                      >
                        <td className="py-3 px-4">
                          {indexOfFirst + index + 1}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(row.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-blue-400">
                          ₦{Number(row.total_sales ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-3">
                            <button
                              disabled={viewLoading}
                              onClick={() => handleView(row.date)}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 disabled:opacity-40"
                            >
                              <Eye size={16} /> View
                            </button>

                            <button
                              onClick={() => handleDownload(formatDate(row.date))}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              <Download size={16} /> Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* View Modal */}
{viewModalOpen && (
  <section
    aria-label={`Sales details for ${new Date(selectedDate).toLocaleDateString()}`}
    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    onClick={() => setViewModalOpen(false)}
  >
    <motion.article
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
          className="text-gray-400 hover:text-red-500"
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
                <th className="py-2 px-3">Unit Price</th>
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
                    ₦{(Number(s.price) / s.quantity).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 font-semibold">
                    ₦{(Number(s.price)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end text-lg font-semibold text-blue-400">
            Total: ₦{totalForSelectedDate.toLocaleString()}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleDownload(formatDate(selectedDate))}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Download
            </button>
          </div>
        </>
      )}
    </motion.article>
  </section>
)}

            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
}
