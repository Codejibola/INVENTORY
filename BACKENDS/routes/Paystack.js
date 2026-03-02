import express from 'express';
import axios from 'axios';
import { LOCAL_ENV } from '../config/localEnv.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/db.js';

const router = express.Router();

// Initialize Paystack Payment
router.post('/pay', async (req, res) => {
  const { email, amount, planType } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ message: 'Email and amount are required' });
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
      amount,
      metadata: { planType, userId },
      callback_url: `https://quantora-app.vercel.app//dashboard`
    };

    console.log("Initializing Paystack payment with metadata:", payload.metadata);

    const response = await axios.post('https://api.paystack.co/transaction/initialize', payload, {
      headers: {
        Authorization: `Bearer ${LOCAL_ENV.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Paystack error:', error.response?.data || error.message);
    return res.status(500).json({ 
      message: 'Payment initialization failed', 
      error: error.response?.data || error.message 
    });
  }
});

// Paystack webhook — use raw body to verify signature
router.post('/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  console.log("Webhook received from Paystack");
  
  try {
    const signature = req.headers['x-paystack-signature'];
    const secret = LOCAL_ENV.PAYSTACK_SECRET_KEY;

    // --- DEBUGGING SIGNATURE ---
    const hash = crypto.createHmac('sha512', secret).update(req.body).digest('hex');
    
    if (hash !== signature) {
      console.error('Paystack webhook: invalid signature');
      console.error('Calculated Hash:', hash);
      console.error('Signature Received:', signature);
      return res.status(401).send('Unauthorized');
    }
    console.log("Signature verified successfully");

    const event = JSON.parse(req.body.toString());
    console.log("Event Type:", event.event);

    if (event.event === 'charge.success') {
      console.log("Charge successful. Data:", JSON.stringify(event.data, null, 2));
      
      const { metadata } = event.data || {};
      const userId = metadata?.userId;
      const planType = metadata?.planType;

      console.log("Extracted Metadata - UserId:", userId, "PlanType:", planType);

      if (userId) {
        // compute expiry date
        let expiryDate;
        const now = new Date();
        if (planType === 'monthly') {
          expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        } else {
          expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        }
        
        console.log("Updating database for user", userId, "with expiry", expiryDate);

        try {
          const result = await pool.query(
            'UPDATE users SET subscription_status = $1, subscription_plan = $2, subscription_expiry = $3 WHERE id = $4',
            ['active', planType || null, expiryDate, userId]
          );
          
          if (result.rowCount === 0) {
            console.error(`No user found with ID: ${userId}`);
          } else {
            console.log(`Successfully activated subscription for user ${userId}`);
          }

        } catch (dbErr) {
          console.error('Failed to update subscription in DB:', dbErr.message);
        }
      } else {
        console.error("No userId found in metadata!");
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook handling error:', err.message);
    res.status(500).send('Webhook processing failed');
  }
});

export default router;