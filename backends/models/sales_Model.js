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
        s.price,
        s.profit_loss,
        s.sold_by,
        s.created_at
     FROM sales s
     JOIN products p ON p.id = s.product_id
     WHERE s.user_id = $1
     ORDER BY s.created_at DESC`,
    [userId]
  );
};

/**
 * Insert a sale AND optionally archive the full receipt
 * @param {Object} receiptData - Optional: { customerName, workerName, items }
 */
export const insertSale = async (userId, productId, quantity, sellingPrice, soldBy, receiptData = null) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch unit cost and stock
    const productRes = await client.query(
      `SELECT price, units FROM products WHERE id = $1 AND user_id = $2`,
      [productId, userId]
    );

    if (!productRes.rows.length) {
      throw new Error("Product not found");
    }

    const costPrice = Number(productRes.rows[0].price);
    const availableUnits = Number(productRes.rows[0].units);

    if (availableUnits < quantity) {
      throw new Error("Insufficient stock");
    }

    const totalSellingPrice = Number(sellingPrice);
    const profitLoss = totalSellingPrice - (costPrice * quantity);

    // 2. Insert into 'sales' table (Item tracking)
    const saleRes = await client.query(
      `INSERT INTO sales (user_id, product_id, quantity, price, profit_loss, sold_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, profit_loss, sold_by`,
      [userId, productId, quantity, totalSellingPrice, profitLoss, soldBy || 'Admin']
    );

    // 3. Update stock
    await client.query(
      `UPDATE products SET units = units - $1 WHERE id = $2`,
      [quantity, productId]
    );

    // 4. ARCHIVE TO RECEIPTS TABLE
    // Logic: Only inserts if receiptData is passed (usually on the first item of a basket loop)
    if (receiptData) {
      await client.query(
        `INSERT INTO receipts (user_id, customer_name, items, worker_name)
         VALUES ($1, $2, $3, $4)`,
        [
          userId,
          receiptData.customerName || 'Walk-in Customer',
          JSON.stringify(receiptData.items),
          receiptData.workerName || 'Admin'
        ]
      );
    }

    await client.query('COMMIT');
    return saleRes;

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Fetch daily sales totals WITH profit/loss
 */
export const fetchDailySales = (userId, year) => {
  return pool.query(
    `SELECT
        DATE(created_at) AS date,
        SUM(price) AS total_sales,
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
        s.price,
        s.profit_loss,
        s.sold_by,
        u.shop_name,
        s.created_at
     FROM sales s
     JOIN products p ON p.id = s.product_id
     JOIN users u ON u.id = s.user_id
     WHERE s.user_id = $1
       AND (s.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Lagos')::DATE = $2::DATE
     ORDER BY s.created_at ASC`,
    [userId, date]
  );
};

/**
 * Fetch aggregated quantity sold per product
 */
export const fetchProductSalesSummary = (userId) => {
  return pool.query(
    `SELECT
      p.id AS product_id,
      p.name AS product_name,
      SUM(s.quantity) AS total_quantity_sold
    FROM sales s
    INNER JOIN products p ON p.id = s.product_id
    WHERE s.user_id = $1
    GROUP BY p.id, p.name`,
    [userId]
  );
};

/**
 * Fetch all archived receipts for the user
 */
export const fetchReceiptsHistory = (userId) => {
  return pool.query(
    `SELECT id, customer_name, items, worker_name, created_at 
     FROM receipts 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [userId]
  );
};