import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,

});

console.log({
  raw: process.env.DB_HOST,
  json: JSON.stringify(process.env.DB_HOST),
  length: process.env.DB_HOST?.length,
});


export default pool;
