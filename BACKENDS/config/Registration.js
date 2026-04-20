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

    if (!name || !email || !password || !shopName || !adminPassword || !workerPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const checkEmail = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    const hashedWorkerPassword = await bcrypt.hash(workerPassword, 10);

    const trialStatus = 'active';
    const trialPlan = 'trial';
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 30); 

    await pool.query(
      `INSERT INTO users (
        name, email, password, shop_name, admin_password, worker_password, 
        subscription_status, subscription_plan, subscription_expiry
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [name, email, hashedPassword, shopName, hashedAdminPassword, hashedWorkerPassword, trialStatus, trialPlan, trialExpiry]
    );

    return res.status(201).json({ message: "Account created successfully with 30-day free trial!" });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "An unexpected server error occurred" });
  }
});

// ---------------------
// SETTINGS UPDATE
// ---------------------
router.put("/settings", authenticate, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { shopName, shopPassword, adminPassword, workerPassword } = req.body;

    const userResult = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    let updateFields = [];
    let queryParams = [];
    let counter = 1;

    if (shopName) {
      updateFields.push(`shop_name = $${counter++}`);
      queryParams.push(shopName);
    }
    if (shopPassword) {
      const hashed = await bcrypt.hash(shopPassword, 10);
      updateFields.push(`password = $${counter++}`);
      queryParams.push(hashed);
    }
    if (adminPassword) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      updateFields.push(`admin_password = $${counter++}`);
      queryParams.push(hashed);
    }
    if (workerPassword) {
      const hashed = await bcrypt.hash(workerPassword, 10);
      updateFields.push(`worker_password = $${counter++}`);
      queryParams.push(hashed);
    }

    if (updateFields.length === 0) return res.status(400).json({ message: "No fields provided" });

    queryParams.push(userId);
    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = $${counter} RETURNING shop_name`,
      queryParams
    );

    return res.status(200).json({ message: "Settings updated successfully", shopName: result.rows[0].shop_name });
  } catch (err) {
    console.error("Settings error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ---------------------
// VERIFY ROLE (Worker Login Trigger)
// ---------------------
router.post("/verify-role", async (req, res) => {
  try {
    // 1. We now expect workerName from the frontend request body
    const { userId, role, password, workerName } = req.body;

    if (!userId || !role || !password) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const result = await pool.query(
      "SELECT id, name, admin_password, worker_password, subscription_status, subscription_expiry FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];
    const hashedPassword = role === "admin" ? user.admin_password : user.worker_password;
    const valid = await bcrypt.compare(password, hashedPassword);

    if (!valid) return res.status(401).json({ valid: false, error: "Incorrect password" });

    // Subscription check
    const now = new Date();
    const expiryDate = user.subscription_expiry ? new Date(user.subscription_expiry) : null;
    if (user.subscription_status !== "active" || (expiryDate && now > expiryDate)) {
      return res.status(403).json({ valid: true, subscribed: false, error: "Subscription expired." });
    }

    // --- NOTIFICATION TRIGGER ---
    if (role === "worker") {
      try {
        // Use workerName from frontend, fallback to user.name if empty
        const staffIdentity = workerName || "Staff Member";
        const notificationMsg = `${staffIdentity} has initialized the terminal.`;

        await pool.query(
          "INSERT INTO notifications (user_id, worker_name, message, type) VALUES ($1, $2, $3, $4)",
          [user.id, staffIdentity, notificationMsg, 'login']
        );
      } catch (notifyErr) {
        console.error("Notification trigger failed:", notifyErr);
      }
    }

    return res.json({ valid: true, subscribed: true });
  } catch (err) {
    console.error("Role Verification Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// GET LATEST UNREAD NOTIFICATION (Owner Side)
// ---------------------
router.get("/notifications/latest", authenticate, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC LIMIT 1",
      [userId]
    );
    return res.json(result.rows[0] || null);
  } catch (err) {
    console.error("Fetch Notification Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// MARK NOTIFICATION AS READ (The "Silencer")
// ---------------------
router.patch("/notifications/:id/read", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    const result = await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Alert not found" });
    return res.status(200).json({ message: "Alert acknowledged" });
  } catch (err) {
    console.error("Update Notification Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;