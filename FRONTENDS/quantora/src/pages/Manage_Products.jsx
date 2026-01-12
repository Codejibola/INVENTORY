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
      setFormData({
        name: "",
        price: "",
        selling_price: "",
        stock: "",
        category: "",
      });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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

      <div className="flex min-h-screen bg-gray-900 text-gray-200 overflow-x-hidden">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div className="flex-1 flex flex-col">
          <Topbar
            onMenuClick={() => setMenuOpen(true)}
            userName={currentUser?.name}
          />

          <main className="px-2 sm:px-4 md:px-6 py-6 space-y-6">
            <h1 className="sr-only">Manage Products</h1>

            {/* Search + Add */}
            <section aria-label="Product actions">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-[180px] px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
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
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  <Plus size={18} /> Add Product
                </button>
              </div>
            </section>

            {/* Add/Edit Modal */}
            {showForm && (
              <section className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <motion.form
                  onSubmit={handleSaveProduct}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4"
                >
                  <h2 className="text-xl font-bold">
                    {editingId ? "Edit Product" : "Add Product"}
                  </h2>

                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    className="w-full p-2 rounded bg-gray-900 border border-gray-700"
                    required
                  />

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Unit Price"
                    className="w-full p-2 rounded bg-gray-900 border border-gray-700"
                    required
                  />

                  <input
                    type="number"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleChange}
                    placeholder="Selling Price"
                    className="w-full p-2 rounded bg-gray-900 border border-gray-700"
                    required
                  />

                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="Stock"
                    className="w-full p-2 rounded bg-gray-900 border border-gray-700"
                    required
                  />

                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Category"
                    className="w-full p-2 rounded bg-gray-900 border border-gray-700"
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 rounded bg-gray-700"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-green-600 text-white"
                    >
                      {editingId ? "Update" : "Save"}
                    </button>
                  </div>
                </motion.form>
              </section>
            )}

            {/* Products Tables */}
            <section>
              {months.map(
                (month) =>
                  groupedByMonth[month]?.length > 0 && (
                    <article key={month} className="space-y-2">
                      <h2 className="text-xl font-bold mt-6">{month}</h2>

                      <motion.div className="overflow-x-auto bg-gray-800 rounded-xl shadow-lg">
                        <table className="min-w-full text-left text-sm sm:text-base">
                          <thead className="bg-gray-700">
                            <tr>
                              <th className="py-3 px-4">Name</th>
                              <th className="py-3 px-4">Unit Price</th>
                              <th className="py-3 px-4">Selling Price</th>
                              <th className="py-3 px-4">Stock</th>
                              <th className="py-3 px-4">Category</th>
                              <th className="py-3 px-4">Date Added</th>
                              <th className="py-3 px-4 text-center">
                                Actions
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {groupedByMonth[month].map((p) => (
                              <motion.tr
                                key={p.id}
                                className="border-b border-gray-700 hover:bg-gray-700"
                              >
                                <td className="py-3 px-4">{toTitleCase(p.name)}</td>
                                <td className="py-3 px-4">
                                  ₦{Number(p.price).toFixed(2)}
                                </td>
                                <td className="py-3 px-4">
                                  ₦{Number(p.selling_price).toFixed(2)}
                                </td>
                                <td className="py-3 px-4">{p.units}</td>
                                <td className="py-3 px-4">
                                  {toTitleCase(p.category || "")}
                                </td>
                                <td className="py-3 px-4">
                                  {new Date(
                                    p.addedDate
                                  ).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 flex justify-center gap-3">
                                  <button
                                    onClick={() => handleEdit(p)}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(p.id)}
                                    className="text-red-500 hover:text-red-400"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </motion.div>
                    </article>
                  )
              )}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
