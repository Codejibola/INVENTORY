/* eslint-disable */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";
import { Helmet } from "react-helmet-async";

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

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const fetchProducts = () => {
    apiFetch("http://localhost:5000/api/products", {
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
    apiFetch("http://localhost:5000/api/sales", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : data.sales || data || [];
        const today = new Date().toISOString().split("T")[0];
        setSales(all.filter((s) => s.created_at?.startsWith(today)));
      })
      .catch(() => setError("Failed to load sales"));
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [token]);

  const getSuggestedPrice = () => {
    if (!selected) return 0;
    const product = products.find((p) => p.id === Number(selected));
    if (!product) return 0;
    return product.selling_price * quantity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selected) return setError("Please select a product.");
    if (!quantity || quantity < 1)
      return setError("Quantity must be at least 1.");
    if (!totalPrice || totalPrice <= 0)
      return setError("Total price must be greater than 0.");

    const product = products.find((p) => p.id === Number(selected));
    if (!product) return setError("Invalid product selected.");

    if (quantity > product.units) {
      return setError(`Only ${product.units} units left.`);
    }

    setLoading(true);

    try {
      await apiFetch("http://localhost:5000/api/sales", {
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

  const totalToday = sales.reduce(
    (acc, s) => acc + Number(s.price),
    0
  );

  const suggestedPrice = getSuggestedPrice();

  return (
    <>
      <Helmet>
        <title>Record Sales</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex min-h-screen bg-[#0f172a] text-gray-200 overflow-x-hidden">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div className="flex-1 flex flex-col">
          <Topbar
            onMenuClick={() => setMenuOpen(true)}
            userName={currentUser?.name}
          />

          <main className="p-4 sm:p-6 space-y-6">
            {error && (
              <p className="text-red-400 text-center font-medium">{error}</p>
            )}

            {/* FORM */}
            <motion.form
              onSubmit={handleSubmit}
              className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 max-w-xl mx-auto space-y-4"
            >
              <h2 className="text-lg font-semibold">Record Sale</h2>

              <select
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setTotalPrice("");
                }}
                className="w-full border border-gray-600 bg-[#0f172a] rounded px-3 py-2"
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.units})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(Number(e.target.value));
                    setTotalPrice("");
                  }}
                  className="border border-gray-600 bg-[#0f172a] rounded px-3 py-2"
                  placeholder="Quantity"
                />

                <input
                  type="number"
                  min="1"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  className="border border-gray-600 bg-[#0f172a] rounded px-3 py-2"
                  placeholder={
                    selected
                      ? `Suggested: ₦${suggestedPrice.toLocaleString()}`
                      : ""
                  }
                />
              </div>

              <button
                disabled={loading}
                className={`w-full py-2 rounded font-semibold ${
                  loading
                    ? "bg-gray-600 text-gray-400"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {loading ? "Saving…" : "Add Sale"}
              </button>
            </motion.form>

            {/* MOBILE SALES CARDS */}
            <div className="md:hidden space-y-4">
              {sales.length === 0 ? (
                <p className="text-center text-gray-400">No sales today.</p>
              ) : (
                sales.map((s, i) => {
                  const profitLoss = Number(s.profit_loss || 0);

                  return (
                    <div
                      key={s.id}
                      className="bg-[#1e293b] border border-gray-700 rounded-xl p-4 space-y-2"
                    >
                      <p className="font-semibold text-lg">
                        Product: <span className="text-gray-300">{s.product_name}</span>
                      </p>

                      <p>Quantity: <span className="text-gray-300">{s.quantity}</span></p>

                      <p>
                        Unit Price:{" "}
                        <span className="text-gray-300">
                          ₦{(s.price / s.quantity).toLocaleString()}
                        </span>
                      </p>

                      <p>
                        Total Price:{" "}
                        <span className="font-semibold">
                          ₦{Number(s.price).toLocaleString()}
                        </span>
                      </p>

                      <p
                        className={`font-semibold ${
                          profitLoss > 0
                            ? "text-green-400"
                            : profitLoss < 0
                            ? "text-red-400"
                            : "text-gray-300"
                        }`}
                      >
                        Profit / Loss:{" "}
                        {profitLoss < 0
                          ? `-₦${Math.abs(profitLoss).toLocaleString()}`
                          : profitLoss > 0
                          ? `+₦${profitLoss.toLocaleString()}`
                          : "₦0"}
                      </p>

                      <p className="text-sm text-gray-400">
                        Date: {new Date(s.created_at).toLocaleString()}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto bg-[#1e293b] border border-gray-700 rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] border-b border-gray-700">
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Quantity</th>
                    <th className="px-4 py-3 text-left">Unit Price</th>
                    <th className="px-4 py-3 text-left">Total Price</th>
                    <th className="px-4 py-3 text-left">Profit / Loss</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                        No sales today.
                      </td>
                    </tr>
                  ) : (
                    sales.map((s) => {
                      const profitLoss = Number(s.profit_loss || 0);
                      return (
                        <tr key={s.id} className="border-b border-gray-700 hover:bg-[#0f172a]/50">
                          <td className="px-4 py-3">{s.product_name}</td>
                          <td className="px-4 py-3">{s.quantity}</td>
                          <td className="px-4 py-3">₦{(s.price / s.quantity).toLocaleString()}</td>
                          <td className="px-4 py-3 font-semibold">₦{Number(s.price).toLocaleString()}</td>
                          <td className={`px-4 py-3 font-semibold ${
                            profitLoss > 0 ? "text-green-400" : profitLoss < 0 ? "text-red-400" : "text-gray-300"
                          }`}>{
                            profitLoss < 0
                              ? `-₦${Math.abs(profitLoss).toLocaleString()}`
                              : profitLoss > 0
                              ? `+₦${profitLoss.toLocaleString()}`
                              : "₦0"
                          }</td>
                          <td className="px-4 py-3">{new Date(s.created_at).toLocaleString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-right font-semibold">
              Today’s Total Sales: ₦{totalToday.toLocaleString()}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
