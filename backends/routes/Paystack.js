import express from 'express';
import axios from 'axios';
import { LOCAL_ENV } from '../config/localEnv.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/db.js';

const router = express.Router();

// --- SECURE PRICE CONFIGURATION ---
// Prices in Kobo (Naira * 100)
const SECURE_PRICES = {
  monthly: 3000 * 100, // ₦3,000
  yearly: 30000 * 100  // ₦30,000
};

router.post('/pay', express.json(), async (req, res) => {
  // 1. Remove 'amount' from destructuring to ignore frontend input
  const { email, planType } = req.body;

  // 2. Lookup the correct price on the server
  const amount = SECURE_PRICES[planType];

  if (!email || !amount) {
    return res.status(400).json({ 
      message: 'Email and valid planType (monthly/yearly) are required' 
    });
  }

  const authHeader = req.headers.authorization || req.headers.Authorization;
  let userId = null;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, LOCAL_ENV.JWT_SECRET);
      userId = decoded?.id || null;
    } catch (err) {
      console.warn('Paystack init: token verify failed', err.message);
    }
  }

  try {
    const payload = {
      email,
      amount, // Now using the server-side SECURE_PRICES
      metadata: { planType, userId },
      callback_url: `https://quantora-app.vercel.app/dashboard`
    };

    const response = await axios.post('https://api.paystack.co/transaction/initialize', payload, {
      headers: {
        Authorization: `Bearer ${LOCAL_ENV.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Paystack error:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Payment initialization failed' });
  }
});

// Webhook remains the same, but adding an amount check is a "Pro" move
router.post('/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const secret = LOCAL_ENV.PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac('sha512', secret).update(req.body).digest('hex');

    if (hash !== signature) return res.status(401).send('Unauthorized');

    const event = JSON.parse(req.body.toString());

    if (event.event === 'charge.success') {
      const { amount: paidAmount, metadata } = event.data;
      const { userId, planType } = metadata || {};

      // 3. SECURE VERIFICATION: Check if the amount paid matches the price record
      if (paidAmount !== SECURE_PRICES[planType]) {
        console.error(`PRICE MISMATCH: User ${userId} paid ${paidAmount} for ${planType}`);
        return res.sendStatus(200); 
      }

      if (userId) {
        try {
          const userCheck = await pool.query('SELECT subscription_expiry FROM users WHERE id = $1', [userId]);
          const currentExpiry = userCheck.rows[0]?.subscription_expiry;
          const now = new Date();
          let baseDate = (currentExpiry && new Date(currentExpiry) > now) ? new Date(currentExpiry) : now;

          let newExpiry = (planType === 'monthly') 
            ? new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000)
            : new Date(baseDate.getTime() + 365 * 24 * 60 * 60 * 1000);

          await pool.query(
            'UPDATE users SET subscription_status = $1, subscription_plan = $2, subscription_expiry = $3 WHERE id = $4',
            ['active', planType, newExpiry, userId]
          );
        } catch (dbErr) {
          console.error('DB Update Error:', dbErr.message);
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send('Webhook error');
  }
});

export default router;