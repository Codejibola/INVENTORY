import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  password: "#1Kingcube",
  host: "localhost",
  port: 5432,
  database: "quantora"
});

export default pool;
