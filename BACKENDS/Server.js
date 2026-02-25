/* eslint-disable */
import dotenv from "dotenv";
// 1. Load env immediately at the absolute top
dotenv.config(); 

import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import registrationRouter from "./config/Registration.js";
import adminRouter from "./routes/Admin.js";
import productRoutes from "./routes/productRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import paystackRoutes from "./routes/Paystack.js";
import { LOCAL_ENV } from "./config/localEnv.js";

// --- DEBUG TEST BLOCK ---
console.log("------------------------------------");
console.log("🔍 STARTING SYSTEM CHECK...");
console.log("DATABASE HOST:", process.env.DB_HOST || "❌ NOT FOUND IN .ENV");
console.log("PORT TO USE:", LOCAL_ENV.PORT || "❌ UNDEFINED (Check localEnv.js)");
console.log("------------------------------------");

class WebServer {
  #port;
  constructor() {
    // If PORT is missing, default to 5000 so the process doesn't exit
    this.#port = LOCAL_ENV.PORT || 5000;
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
  }

  registerDefaultRoutes() {
    this.app.get("/", (req, res) => {
      res.send("Quantora API is running successfully");
    });
    
    // Test route to verify the server is alive
    this.app.get("/api/health", (req, res) => {
      res.json({ status: "UP", timestamp: new Date() });
    });
  }

  async listen() {
    try {
      // 2. Test DB Connection before starting
      console.log("⏳ Attempting to connect to Database...");
      await pool.query('SELECT NOW()');
      console.log("✅ Database Connected Successfully");

      this.app.listen(this.#port, '0.0.0.0', () => {
        console.log(`🚀 SERVER IS LIVE: http://localhost:${this.#port}`);
      });
    } catch (err) {
      console.error("❌ CRITICAL FAILURE: Could not connect to DB.");
      console.error(err.message);
      // We don't call process.exit(1) here so nodemon stays active for your changes
    }
  }
}

const Quantora = new WebServer();

// Global Middleware
Quantora.app.use(globalLimiter);

// --- ROUTERS ---
Quantora.app.use("/api/auth", registrationRouter);
Quantora.app.use("/api/auth", adminRouter);
Quantora.app.use("/api", productRoutes);
Quantora.app.use("/api", salesRoutes);
Quantora.app.use("/api/paystack", paystackRoutes);

// Default
Quantora.registerDefaultRoutes();

// Start server
Quantora.listen();

// 3. Error Handling to catch hidden crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🔴 Uncaught Exception:', err.message);
});

export default WebServer;