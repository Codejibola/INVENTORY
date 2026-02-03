import express from "express";
import bcrypt from "bcrypt";
import pool from "./db.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// ---------------------
// REGISTER ROUTE
// ---------------------
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password, shopName, adminPassword, workerPassword } = req.body;

    // Validate fields
    if (!name || !email || !password || !shopName || !adminPassword || !workerPassword) {
      return res.status(400).json({
        message: "All fields (name, email, password, shopName, adminPassword, workerPassword) are required",
      });
    }

    // Check if email already exists
    const checkEmail = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (checkEmail.rows.length > 0) {
      return res.status(409).json({
        message: "This email is already registered. Try logging in or use another email.",
      });
    }

    // Hash passwords
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    const hashedWorkerPassword = await bcrypt.hash(workerPassword, 10);

    // Insert new user
    await pool.query(
      "INSERT INTO users (name, email, password, shop_name, admin_password, worker_password) VALUES ($1, $2, $3, $4, $5, $6)",
      [name, email, hashedPassword, shopName, hashedAdminPassword, hashedWorkerPassword]
    );

    return res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({
      message: "An unexpected server error occurred",
      error: err.message,
    });
  }
});

// ---------------------
// VERIFY ROLE ROUTE
// ---------------------
router.post("/verify-role", async (req, res) => {
  try {
    const { userId, role, password } = req.body;

    if (!userId || !role || !password) {
      return res.status(400).json({ error: "userId, role, and password are required" });
    }

    // Fetch the user by ID
    const result = await pool.query(
      "SELECT id, admin_password, worker_password FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    // Pick the correct hashed password
    const hashedPassword =
      role === "admin" ? user.admin_password : user.worker_password;

    // Compare input with hash
    const valid = await bcrypt.compare(password, hashedPassword);

    if (!valid) {
      return res.status(401).json({ valid: false, error: "Incorrect password" });
    }

    return res.json({ valid: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
