import dotenv from "dotenv";
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
import cron from "node-cron"; 


// --- DEBUG TEST BLOCK ---
console.log("------------------------------------");
console.log("🔍 STARTING SYSTEM CHECK...");
console.log("DATABASE HOST:", process.env.DB_HOST || "❌ NOT FOUND IN .ENV");
console.log("PORT TO USE:", LOCAL_ENV.PORT || "❌ UNDEFINED (Check localEnv.js)");
console.log("------------------------------------");


// --- CRON JOB: SUBSCRIPTION CLEANUP ---
// This runs every day at 00:00 (Midnight)
cron.schedule("0 0 * * *", async () => {
  console.log("🕒 [CRON] Checking for expired subscriptions...");
  try {
    const result = await pool.query(
      "UPDATE users SET subscription_status = 'inactive' WHERE subscription_expiry < NOW() AND subscription_status = 'active'"
    );
    console.log(`✅ [CRON] Cleanup finished. Updated ${result.rowCount} users.`);
  } catch (err) {
    console.error("❌ [CRON] Error during subscription cleanup:", err.message);
  }
});

class WebServer {
  #port;
 constructor() {
    this.#port = LOCAL_ENV.PORT || 5000;
    this.app = express();
    this.app.set('trust proxy', 1);

    // --- QUANTORA SECURITY: CORS WHITELIST ---
    const allowedOrigins = [
      "https://home.quantora.online",
      "https://quantora.online",
      "http://localhost:5173",
      "http://localhost:5174"
    ];

    const corsOptions = {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl) 
        // if you want to be extra strict, remove "!origin"
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.error(`🔴 SECURITY ALERT: CORS blocked for origin: ${origin}`);
          callback(new Error("Not allowed by Quantora Security Policy"));
        }
      },
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true, // Allows cookies/auth headers if needed
      optionsSuccessStatus: 200
    };

    this.app.use(cors(corsOptions));
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

//paystack webhook needs raw body, so we register it before express.json()
Quantora.app.use("/api/paystack", paystackRoutes);

//JSON parsing for all other routes
Quantora.app.use(express.json());

// Global Middleware
Quantora.app.use(globalLimiter);
// -- ROUTERS --
Quantora.app.use("/api/auth", registrationRouter);
Quantora.app.use("/api/auth", adminRouter);
Quantora.app.use("/api", productRoutes);
Quantora.app.use("/api", salesRoutes);


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