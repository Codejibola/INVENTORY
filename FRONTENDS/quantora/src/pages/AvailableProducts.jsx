import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AvailableProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    selling_price: "",
    stock: "",
    category: "",
  });

  const token = localStorage.getItem("token");

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch products");

      const rows = Array.isArray(data) ? data : data.products || [];
      const normalized = rows.map((r) => ({ ...r, stock: r.stock ?? r.units }));
      setProducts(normalized);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------------- FORM HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError("");

    try {
      const stockNum = Number(formData.stock);
      if (Number.isNaN(stockNum)) throw new Error("Stock must be a number");

      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          selling_price: Number(formData.selling_price),
          stock: stockNum,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");

      setShowForm(false);
      setFormData({
        name: "",
        price: "",
        selling_price: "",
        stock: "",
        category: "",
      });
      fetchProducts();
    } catch (err) {
      setFormError(err.message);
    }
  };

  /* ---------------- UTILS ---------------- */
  const titleCase = (s) => {
    if (!s) return "—";
    return s
      .toString()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  if (loading) return <p className="text-gray-300">Loading products…</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Available Products
          </h2>
          <p className="text-sm text-gray-400">
            Monitor and manage your shop inventory
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2
                     bg-green-600 hover:bg-green-500
                     px-4 py-2 rounded-lg text-white text-sm font-medium"
        >
          + Add Product
        </button>
      </div>

      {/* MOBILE CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {products.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            No products yet. Add your first product.
          </p>
        ) : (
          products.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-xl p-4 shadow border border-slate-700"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-white font-medium">{titleCase(p.name)}</h3>
                <span className="text-blue-400 font-semibold tabular-nums">
                  ₦{Number(p.selling_price).toLocaleString()}
                </span>
              </div>

              <div className="mt-2 text-xs text-gray-400 space-y-1">
                <p>Category: {titleCase(p.category)}</p>
                <p>Stock: {p.stock ?? "—"}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden sm:block overflow-x-auto bg-slate-800 rounded-xl border border-slate-700">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-gray-400 text-sm">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3 text-right">Stock</th>
              <th className="px-6 py-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-t border-slate-700 text-gray-200 hover:bg-slate-700/40"
              >
                <td className="px-6 py-3 font-medium">{titleCase(p.name)}</td>
                <td className="px-6 py-3 text-sm text-gray-400">{titleCase(p.category)}</td>
                <td className="px-6 py-3 text-right">{p.stock ?? "—"}</td>
                <td className="px-6 py-3 text-right text-blue-400 font-semibold tabular-nums">
                  ₦{Number(p.selling_price).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD PRODUCT MODAL */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={handleAddProduct}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 w-full max-w-lg rounded-xl p-6 space-y-5 border border-slate-700"
            >
              <h3 className="text-xl font-semibold text-white">Add New Product</h3>

              {formError && <p className="text-sm text-red-400">{formError}</p>}

              {/* PRODUCT INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="name"
                  placeholder="Product name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input text-black placeholder-gray-700"
                />
                <input
                  name="category"
                  placeholder="Category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input text-black placeholder-gray-700"
                />
              </div>

              {/* PRICING */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="price"
                  type="number"
                  placeholder="Cost price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="input text-black placeholder-gray-700"
                />
                <input
                  name="selling_price"
                  type="number"
                  placeholder="Selling price"
                  value={formData.selling_price}
                  onChange={handleChange}
                  required
                  className="input text-black placeholder-gray-700"
                />
              </div>

              {/* STOCK */}
              <input
                name="stock"
                type="number"
                placeholder="Stock quantity"
                value={formData.stock}
                onChange={handleChange}
                required
                className="input text-black placeholder-gray-500"
              />

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg bg-slate-700 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white"
                >
                  Save Product
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
