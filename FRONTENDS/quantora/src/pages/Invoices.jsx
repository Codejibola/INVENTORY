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
      .then((res) => res.json())
      .then((data) => setDailySales(data))
      .catch(() => {});
  }, [year, token]);

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

  const formatDate = (d) => new Date(d).toISOString().split("T")[0];

  const handleView = async (date) => {
    setViewLoading(true);
    setSelectedDate(date);

    try {
      const res = await apiFetch(
        `http://localhost:5000/api/sales/daily/${formatDate(date)}/view`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setSelectedSales(data);
      setViewModalOpen(true);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownload = async (date) => {
    const res = await fetch(
      `http://localhost:5000/api/sales/daily/${date}/excel`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-${date}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredSales.slice(indexOfFirst, indexOfLast);

  const totalForSelectedDate = selectedSales.reduce(
    (acc, s) => acc + Number(s.price),
    0
  );

  return (
    <>
      <Helmet>
        <title>Invoices</title>
      </Helmet>

      <div className="flex min-h-screen bg-[#0d1117] text-gray-300">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div className="flex-1 flex flex-col">
          <Topbar
            onMenuClick={() => setMenuOpen(true)}
            userName={currentUser?.name}
          />

          <main className="px-3 sm:px-4 md:px-6 py-6 space-y-6">
            <h1 className="text-2xl font-semibold text-white">Invoices</h1>

            {/* ===== MOBILE CARDS ===== */}
            <div className="md:hidden space-y-3">
              {currentData.map((row, index) => (
                <div
                  key={row.date}
                  className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex justify-between"
                >
                  {/* LEFT: INFO */}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">
                      #{indexOfFirst + index + 1}
                    </p>
                    <p className="font-medium text-white">
                      {new Date(row.date).toLocaleDateString()}
                    </p>
                    <p className="text-blue-400 font-semibold">
                      Amount: ₦{Number(row.total_sales ?? 0).toLocaleString()}
                    </p>
                  </div>

                  {/* RIGHT: ACTIONS */}
                  <div className="flex flex-col gap-3 items-end">
                    <button
                      onClick={() => handleView(row.date)}
                      className="flex items-center gap-1 text-blue-400"
                    >
                      <Eye size={16} /> View
                    </button>

                    <button
                      onClick={() => handleDownload(formatDate(row.date))}
                      className="flex items-center gap-1 text-blue-400"
                    >
                      <Download size={16} /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== DESKTOP TABLE (UNCHANGED) ===== */}
            <div className="hidden md:block overflow-x-auto bg-[#161b22] rounded-xl border border-[#30363d]">
              <table className="min-w-full">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left">S/N</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, index) => (
                    <tr
                      key={row.date}
                      className="border-b border-[#30363d]"
                    >
                      <td className="py-3 px-4">
                        {indexOfFirst + index + 1}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-blue-400 font-semibold">
                        ₦{Number(row.total_sales ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => handleView(row.date)}>
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDownload(formatDate(row.date))}
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===== VIEW MODAL ===== */}
            {viewModalOpen && (
              <div
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                onClick={() => setViewModalOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0d1117] rounded-xl p-6 max-w-3xl w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-xl font-semibold mb-4">
                    Sales for {new Date(selectedDate).toLocaleDateString()}
                  </h2>

                  <table className="w-full text-sm">
                    <thead className="bg-blue-700 text-white">
                      <tr>
                        <th className="py-2 px-3 text-left">Product</th>
                        <th className="py-2 px-3">Qty</th>
                        <th className="py-2 px-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSales.map((s) => (
                        <tr key={s.id} className="border-b border-[#30363d]">
                          <td className="py-2 px-3">{s.product_name}</td>
                          <td className="py-2 px-3">{s.quantity}</td>
                          <td className="py-2 px-3 font-semibold">
                            ₦{Number(s.price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4 text-right font-semibold text-blue-400">
                    Total: ₦{totalForSelectedDate.toLocaleString()}
                  </div>
                </motion.div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
