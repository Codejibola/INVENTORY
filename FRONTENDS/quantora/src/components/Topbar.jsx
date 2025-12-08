// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import apiFetch from "../utils/apiFetch";
import { useEffect, useState } from "react";
import logo from "../assets/Logo.png";
import { Menu } from "lucide-react";

export default function Topbar({ onMenuClick, userName }) {
  const [lowStockCount, setLowStockCount] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    apiFetch("http://localhost:5000/api/products", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const lowStock = data.filter((p) => p.units < 3).length;
        setLowStockCount(lowStock);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full flex items-center justify-between 
                 bg-gray-900 shadow-lg px-6 py-3"
    >
      {/* Hamburger Icon (Fixed) */}
      <button
        onClick={onMenuClick}
        className="md:hidden text-white p-1"
      >
        <Menu size={28} />
      </button>

      {/* Greeting + Logo */}
      <div className="flex items-center gap-2 hidden md:flex">
        <img
          src={logo}
          alt="Quantora Logo"
          className="w-8 h-8 object-contain"
        />
        <h2 className="text-xl font-semibold text-white">
          Welcome back, {userName ? userName : "User"}!
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-gray-300 hover:text-teal-400 transition">
          <Link to="/notifications">
            <span className="material-icons">notifications</span>

            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
                {lowStockCount}
              </span>
            )}
          </Link>
        </button>

        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
          {userName ? userName.charAt(0).toUpperCase() : "U"}
        </div>
      </div>
    </motion.header>
  );
}
