/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    selling_price: "",
    stock: "",
    category: "",
  });
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const toTitleCase = (str = "") =>
    str
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const fetchProducts = () => {
    if (!token) return;

    apiFetch("http://localhost:5000/api/products", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or server error");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) return setError("You must be logged in.");

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      selling_price: parseFloat(formData.selling_price),
      stock: Math.max(0, parseInt(formData.stock, 10)),
      category: formData.category,
    };

    try {
      const url = editingId
        ? `http://localhost:5000/api/products/${editingId}`
        : "http://localhost:5000/api/products";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.message || "Failed to save product");
      }

      await res.json();
      fetchProducts();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        price: "",
        selling_price: "",
        stock: "",
        category: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const res = await apiFetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      selling_price: product.selling_price,
      stock: product.units,
      category: product.category || "",
    });
    setShowForm(true);
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  });

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const productsWithMonth = filteredProducts.map((p) => {
    const date = new Date(p.created_at);
    return { ...p, month: months[date.getMonth()], addedDate: date };
  });

  const groupedByMonth = months.reduce((acc, m) => {
    acc[m] = productsWithMonth.filter((p) => p.month === m);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>Manage Products</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex min-h-screen bg-gray-900 text-gray-200">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div className="flex-1 flex flex-col">
          <Topbar
            onMenuClick={() => setMenuOpen(true)}
            userName={currentUser?.name}
          />

          <main className="px-4 py-6 space-y-6">
            {/* Search + Add */}
            <div className="flex flex-wrap gap-4 justify-between">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700"
              />

              <button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: "",
                    price: "",
                    selling_price: "",
                    stock: "",
                    category: "",
                  });
                  setShowForm(true);
                }}
                className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded text-white"
              >
                <Plus size={18} /> Add Product
              </button>
            </div>

            {/* ADD / EDIT MODAL — RESTORED */}
            {showForm && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <motion.form
                  onSubmit={handleSaveProduct}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4"
                >
                  <h2 className="text-xl font-bold">
                    {editingId ? "Edit Product" : "Add Product"}
                  </h2>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  {["name", "price", "selling_price", "stock", "category"].map(
                    (field) => (
                      <input
                        key={field}
                        name={field}
                        type={field.includes("price") || field === "stock" ? "number" : "text"}
                        placeholder={field.replace("_", " ")}
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-900 border border-gray-700"
                        required={field !== "category"}
                      />
                    )
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-gray-700 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 rounded text-white"
                    >
                      Save
                    </button>
                  </div>
                </motion.form>
              </div>
            )}

            {/* PRODUCTS — mobile cards + desktop table */}
            {months.map(
              (month) =>
                groupedByMonth[month]?.length > 0 && (
                  <section key={month} className="space-y-3">
                    <h2 className="text-xl font-bold">{month}</h2>

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                      {groupedByMonth[month].map((p) => (
                        <div
                          key={p.id}
                          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                        >
                          <div className="flex justify-between">
                            <h3 className="font-semibold">
                              {toTitleCase(p.name)}
                            </h3>
                            <div className="flex gap-3">
                              <Edit
                                size={18}
                                className="text-blue-400 cursor-pointer"
                                onClick={() => handleEdit(p)}
                              />
                              <Trash2
                                size={18}
                                className="text-red-500 cursor-pointer"
                                onClick={() => handleDelete(p.id)}
                              />
                            </div>
                          </div>
                          <div className="text-sm mt-2 space-y-1 text-gray-300">
                            <p>Unit: ₦{p.price}</p>
                            <p>Selling: ₦{p.selling_price}</p>
                            <p>Stock: {p.units}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto bg-gray-800 rounded-xl">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700 bg-gray-700">
                            <th className="px-4 py-3 text-left">Product Name</th>
                            <th className="px-4 py-3 text-left">Unit Price</th>
                            <th className="px-4 py-3 text-left">Selling Price</th>
                            <th className="px-4 py-3 text-left">Stock</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedByMonth[month].map((p) => (
                            <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                              <td className="px-4 py-3">{toTitleCase(p.name)}</td>
                              <td className="px-4 py-3">₦{p.price}</td>
                              <td className="px-4 py-3">₦{p.selling_price}</td>
                              <td className="px-4 py-3">{p.units}</td>
                              <td className="px-4 py-3">{p.category || "—"}</td>
                              <td className="px-4 py-3 flex justify-center gap-3">
                                <Edit
                                  size={18}
                                  className="text-blue-400 cursor-pointer hover:text-blue-300"
                                  onClick={() => handleEdit(p)}
                                />
                                <Trash2
                                  size={18}
                                  className="text-red-500 cursor-pointer hover:text-red-400"
                                  onClick={() => handleDelete(p.id)}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )
            )}

            {/* NO PRODUCTS FOUND */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No products found</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
