import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import {authLimiter} from "../middleware/rateLimiter.js";
import {authenticate} from "../config/Authenticate.js";

const router = express.Router();

router.post("/admin", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists 
    const { rows } = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // Compare password with stored hash
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }


    const token = jwt.sign(
      { id: user.id },                
      process.env.JWT_SECRET,         
      { expiresIn: "1w" }             
    );

    // Successful login response
    res.json({
      message: "Login successful",
      token,                          
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.userId; // ✅ FIX HERE

    const result = await pool.query(
      `SELECT id, name, email, shop_name
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("ME route error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
