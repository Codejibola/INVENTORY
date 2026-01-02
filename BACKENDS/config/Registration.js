import express from "express";
import bcrypt from "bcrypt";
import pool from "./db.js";
import {authLimiter} from "../middleware/rateLimiter.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields (name, email, password) are required",
      });
    }

    // Check if email already exists
    const checkEmail = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (checkEmail.rows.length > 0) {
      return res.status(409).json({
        message:
          "This email is already registered. Try logging in or use another email.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      message: "Account created successfully",
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({
      message: "An unexpected server error occurred",
      error: err.message,
    });
  }
});

export default router;
