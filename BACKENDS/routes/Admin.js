import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import {authLimiter} from "../middleware/rateLimiter.js";
import {authenticate} from "../config/Authenticate.js";
import {LOCAL_ENV} from "../config/localEnv.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const router = express.Router();

// 1. REQUEST RESET: User provides email, we send the link
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const { rows } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (rows.length === 0) {
      // For security, don't tell the user if the email doesn't exist
      return res.status(200).json({ message: "If an account exists, a link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour expiry

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
      [token, expiry, email]
    );

    // Nodemailer Configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: LOCAL_ENV.EMAIL_USER, // Gmail
        pass: LOCAL_ENV.EMAIL_PASS, // Gmail App Password
      },
    });

    const resetUrl = `${LOCAL_ENV.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: '"Quantora Support" <no-reply@quantora.com>',
      to: email,
      subject: "Password Reset Request - Quantora",
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f4f4f4;">
          <h2>Reset Your Access</h2>
          <p>You requested a password reset for your Quantora account.</p>
          <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; rounded: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    });

    res.json({ message: "Reset link sent successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending email" });
  }
});

// 2. ACTUAL RESET: User provides token and NEW password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword, type } = req.body; // type can be 'password', 'admin_password', or 'worker_password'

  try {
    // Validate token and expiry
    const { rows } = await pool.query(
      "SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()",
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Token is invalid or has expired." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the specific password column dynamically
    // We use a whitelist to prevent SQL injection on column names
    const allowedColumns = ['password', 'admin_password', 'worker_password'];
    if (!allowedColumns.includes(type)) {
      return res.status(400).json({ message: "Invalid reset type." });
    }

    await pool.query(
      `UPDATE users SET ${type} = $1, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = $2`,
      [hashedPassword, token]
    );

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

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
      LOCAL_ENV.JWT_SECRET,         
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
