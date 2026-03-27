/* eslint-disable */
import jwt from 'jsonwebtoken';
import { LOCAL_ENV } from './localEnv.js';
import pool from './db.js'; // Import your database pool

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    // 1. Verify the JWT
    const decoded = jwt.verify(token, LOCAL_ENV.JWT_SECRET);
    
    // 2. Database check for subscription status
    // This prevents someone with a "valid" 24h token from 
    // accessing the app if their sub expired 1 hour ago.
    const userCheck = await pool.query(
      "SELECT subscription_status, subscription_expiry FROM users WHERE id = $1",
      [decoded.id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User no longer exists' });
    }

    const { subscription_status, subscription_expiry } = userCheck.rows[0];
    const now = new Date();
    const expiryDate = subscription_expiry ? new Date(subscription_expiry) : null;

    // 3. The Guard Logic
    // If status is not 'active' OR current time is past expiry
    if (subscription_status !== 'active' || (expiryDate && now > expiryDate)) {
      return res.status(403).json({ 
        message: 'Subscription expired', 
        reason: 'PAYMENT_REQUIRED' 
      });
    }

    // Attach data to request
    req.userId = decoded.id;
    req.user = decoded;
    
    next();
  } catch (err) {
    console.warn('Auth middleware: verification failed:', err.message);
    
    // Distinguish between expired token and bad signature
    const status = err.name === 'TokenExpiredError' ? 401 : 403;
    return res.status(status).json({ message: 'Session invalid or expired' });
  }
};