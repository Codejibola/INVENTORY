import { Pool } from "pg";
import { LOCAL_ENV } from "./localEnv.js";

const pool = new Pool({
  host: LOCAL_ENV.DB_HOST,
  port: LOCAL_ENV.DB_PORT,
  user: LOCAL_ENV.DB_USER,
  password: LOCAL_ENV.DB_PASSWORD,
  database: LOCAL_ENV.DB_NAME,
  ssl: false, 
});

export default pool;
