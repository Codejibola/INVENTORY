import pkg from 'pg';
const { Pool } = pkg;
import { LOCAL_ENV } from "./localEnv.js";

const pool = new Pool({
  host: LOCAL_ENV.DB_HOST,
  port: LOCAL_ENV.DB_PORT,
  user: LOCAL_ENV.DB_USER,
  password: LOCAL_ENV.DB_PASSWORD,
  database: LOCAL_ENV.DB_NAME,
  // This logic automatically turns on SSL when you are on Render
  ssl: process.env.NODE_ENV === "production" || LOCAL_ENV.DB_HOST.includes("render.com") || LOCAL_ENV.DB_HOST.includes("dpg-")
    ? { rejectUnauthorized: false } 
    : false, 
});

export default pool;