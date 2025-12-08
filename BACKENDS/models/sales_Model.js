import pool from "../config/db.js";

export const fetchAllSales = (userId) => {
  return pool.query(
    `SELECT s.id,
            p.name AS product_name,
            s.quantity,
            s.price,
            s.created_at
     FROM sales s
     JOIN products p ON p.id = s.product_id
     WHERE s.user_id = $1
     ORDER BY s.created_at DESC`,
    [userId]
  );
};

export const insertSale = (userId, productId, quantity, price) => {
  return pool.query(
    `INSERT INTO sales (user_id, product_id, quantity, price)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [userId, productId, quantity, price]
  );
};

export const fetchDailySales = (userId, year) => {
  return pool.query(
    `SELECT DATE(created_at) AS date,
            SUM(quantity * price) AS total
     FROM sales
     WHERE user_id = $1 AND EXTRACT(YEAR FROM created_at) = $2
     GROUP BY DATE(created_at)
     ORDER BY DATE(created_at) DESC`,
    [userId, year]
  );
};


export const fetchSalesByDate = (userId, date) => {
  return pool.query(
    `SELECT s.id,
            p.name AS product_name,
            s.quantity,
            s.price,
            s.created_at
     FROM sales s
     JOIN products p ON p.id = s.product_id
     WHERE s.user_id = $1
       AND DATE(s.created_at) = $2
     ORDER BY s.created_at ASC`,
    [userId, date]
  );
};

