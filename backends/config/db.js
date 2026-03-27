import pkg from 'pg';
const { Pool } = pkg;
import { LOCAL_ENV } from "./localEnv.js";

// --- DEBUG LOGS ---
// These will appear in your Render "Logs" tab to tell us exactly what the app is seeing.
console.log("--- DATABASE CONNECTION ATTEMPT ---");
console.log("DB_HOST from Env:", LOCAL_ENV.DB_HOST);
console.log("DB_NAME from Env:", LOCAL_ENV.DB_NAME);
console.log("Is Production:", process.env.NODE_ENV === "production");
// ------------------

const isProduction = process.env.NODE_ENV === "production";
const isRender = LOCAL_ENV.DB_HOST && (LOCAL_ENV.DB_HOST.includes("render.com") || LOCAL_ENV.DB_HOST.includes("dpg-"));

const pool = new Pool({
  // 1. If DATABASE_URL exists (which it should on Render), use it.
  // 2. Otherwise, fall back to individual components for local development.
  connectionString: LOCAL_ENV.DATABASE_URL || undefined,
  
  ...( !LOCAL_ENV.DATABASE_URL && {
    host: LOCAL_ENV.DB_HOST,
    port: LOCAL_ENV.DB_PORT,
    user: LOCAL_ENV.DB_USER,
    password: LOCAL_ENV.DB_PASSWORD,
    database: LOCAL_ENV.DB_NAME,
  }),

  // SSL is mandatory for Render PostgreSQL
  ssl: isProduction || isRender
    ? { rejectUnauthorized: false } 
    : false, 
});

// Test the connection immediately on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("❌ DATABASE CONNECTION ERROR:", err.message);
  } else {
    console.log("✅ DATABASE CONNECTED SUCCESSFULLY AT:", res.rows[0].now);
  }
});

export default pool;