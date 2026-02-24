/* eslint-disable */
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
console.log("ENV CHECK:", process.env.DB_HOST);

import pool from "./config/db.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import cors from "cors";
import express from "express";
import registrationRouter from "./config/Registration.js";
import adminRouter from "./routes/Admin.js";
import productRoutes from "./routes/productRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import paystackRoutes from "./routes/Paystack.js";
// --- NEW IMPORT --- 
import { LOCAL_ENV } from "./config/localEnv.js";

class WebServer {
  #port;
  constructor() {
    this.#port = LOCAL_ENV.PORT;
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
  }

  registerDefaultRoutes() {
    this.app.get("/", (req, res) => {
      res.send("Quantora API is running");
    });
  }

  listen() {
    this.app.listen(this.#port, () => {
      console.log(`Server is running on port ${this.#port}`);
    });
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

// Error Handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

export default WebServer;