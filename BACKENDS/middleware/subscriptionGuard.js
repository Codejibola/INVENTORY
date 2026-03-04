import pool from "../config/db.js";

export const subscriptionGuard = async (req, res, next) => {
  try {
    // req.userId is provided by your existing 'authenticate' middleware
    const userId = req.userId;

    const result = await pool.query(
      "SELECT subscription_status, subscription_expiry FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { subscription_status, subscription_expiry } = result.rows[0];
    const now = new Date();

    // Check if status is active AND if the date is still valid
    const isActive = subscription_status === 'active';
    const isNotExpired = subscription_expiry && new Date(subscription_expiry) > now;

    if (isActive && isNotExpired) {
      return next(); // Pass through to the controller
    }

    // If they fail the check, stop the request here
    return res.status(403).json({ 
      message: "Subscription required or expired", 
      code: "SUBSCRIPTION_REQUIRED" 
    });
  } catch (err) {
    console.error("Guard Error:", err.message);
    res.status(500).json({ message: "Security check failed" });
  }
};