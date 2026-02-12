import express from "express";
import bcrypt from "bcrypt";
import pool from "./db.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { authenticate } from "../config/Authenticate.js";

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
// SETTINGS 
// ---------------------

router.put("/settings", authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // From your JWT middleware
    const { shopName, shopPassword, adminPassword, workerPassword } = req.body;

    // 1. Fetch current user to verify existence
    const userResult = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Prepare dynamic update fields
    let updateFields = [];
    let queryParams = [];
    let counter = 1;

    if (shopName) {
      updateFields.push(`shop_name = $${counter++}`);
      queryParams.push(shopName);
    }

    // 3. Hash new passwords only if they are provided
    if (shopPassword) {
      const hashedShopPass = await bcrypt.hash(shopPassword, 10);
      updateFields.push(`password = $${counter++}`);
      queryParams.push(hashedShopPass);
    }

    if (adminPassword) {
      const hashedAdminPass = await bcrypt.hash(adminPassword, 10);
      updateFields.push(`admin_password = $${counter++}`);
      queryParams.push(hashedAdminPass);
    }

    if (workerPassword) {
      const hashedWorkerPass = await bcrypt.hash(workerPassword, 10);
      updateFields.push(`worker_password = $${counter++}`);
      queryParams.push(hashedWorkerPass);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    // 4. Execute the update
    queryParams.push(userId);
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(", ")} 
      WHERE id = $${counter} 
      RETURNING shop_name
    `;

    const result = await pool.query(updateQuery, queryParams);

    // 5. Update local storage on frontend if shop name changed
    return res.status(200).json({ 
      message: "Settings updated successfully",
      shopName: result.rows[0].shop_name 
    });

  } catch (err) {
    console.error("Settings update error:", err);
    return res.status(500).json({ message: "Internal server error" });
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
