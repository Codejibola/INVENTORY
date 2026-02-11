import pool from "../config/db.js";

/**
 * Fetch all sales for a user
 */
export const fetchAllSales = (userId) => {
  return pool.query(
    `SELECT
        s.id,
        p.name AS product_name,
        s.quantity,
        s.price,          -- TOTAL price
        s.profit_loss,
        s.created_at
     FROM sales s
     JOIN products p ON p.id = s.product_id
     WHERE s.user_id = $1
     ORDER BY s.created_at DESC`,
    [userId]
  );
};

/**
 * Insert a sale with correct profit/loss calculation
 */
export const insertSale = async (userId, productId, quantity, sellingPrice) => {
  // 1. Fetch unit cost and stock
  const productRes = await pool.query(
    `SELECT price, units
     FROM products
     WHERE id = $1 AND user_id = $2`,
    [productId, userId]
  );

  if (!productRes.rows.length) {
    throw new Error("Product not found");
  }

  const costPrice = Number(productRes.rows[0].price); // UNIT cost
  const availableUnits = Number(productRes.rows[0].units);

  if (availableUnits < quantity) {
    throw new Error("Insufficient stock");
  }

  const totalSellingPrice = Number(sellingPrice); // TOTAL price
  const totalCost = costPrice * quantity;

  // ✅ CORRECT PROFIT / LOSS
  const profitLoss = totalSellingPrice - totalCost;

  // 3. Insert sale
  const saleRes = await pool.query(
    `INSERT INTO sales (
        user_id,
        product_id,
        quantity,
        price,
        profit_loss
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, profit_loss`,
    [userId, productId, quantity, totalSellingPrice, profitLoss]
  );

  // 4. Reduce stock
  await pool.query(
    `UPDATE products
     SET units = units - $1
     WHERE id = $2`,
    [quantity, productId]
  );

  return saleRes;
};

/**
 * Fetch daily sales totals WITH profit/loss
 */
export const fetchDailySales = (userId, year) => {
  return pool.query(
    `SELECT
        DATE(created_at) AS date,
        SUM(price) AS total_sales,          -- FIXED
        SUM(profit_loss) AS total_profit_loss
     FROM sales
     WHERE user_id = $1
       AND EXTRACT(YEAR FROM created_at) = $2
     GROUP BY DATE(created_at)
     ORDER BY DATE(created_at) DESC`,
    [userId, year]
  );
};

/**
 * Fetch sales for a specific date
 */
export const fetchSalesByDate = (userId, date) => {
  return pool.query(
    `SELECT
        s.id,
        p.name AS product_name,
        s.quantity,
        s.price,          -- TOTAL price
        s.profit_loss,
        s.created_at
     FROM sales s
     JOIN products p ON p.id = s.product_id
     WHERE s.user_id = $1
       AND DATE(s.created_at) = $2
     ORDER BY s.created_at ASC`,
    [userId, date]
  );
};

/**
 * Fetch aggregated quantity sold per product for a user
 * (Used for best / least selling products)
 */
export const fetchProductSalesSummary = (userId) => {
  return pool.query(
    `
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      SUM(s.quantity) AS total_quantity_sold
    FROM sales s
    INNER JOIN products p ON p.id = s.product_id
    WHERE s.user_id = $1
    GROUP BY p.id, p.name
    `,
    [userId]
  );
};
