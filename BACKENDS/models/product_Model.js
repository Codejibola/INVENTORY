import pool from "../config/db.js";

// Fetch all products for a user (including selling_price)
export const getAllProducts = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE user_id = $1 ORDER BY name ASC",
    [userId]
  );
  return result.rows;  
};

// Fetch single product by id
export const getProductById = async (id, userId) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  return result.rows;  
};

// Create product (with selling_price default to 0 if not provided)
export const createProduct = async (userId, name, price, stock, category, selling_price = 0) => {
  await pool.query(
    "INSERT INTO products (user_id, name, price, units, category, selling_price) VALUES ($1, $2, $3, $4, $5, $6)",
    [userId, name, price, stock, category, selling_price]
  );
  return { message: "Product created" };
};

// Update product including selling_price
export const updateProduct = async (id, userId, name, price, stock, category, selling_price) => {
  await pool.query(
    "UPDATE products SET name = $1, price = $2, units = $3, category = $4, selling_price = $5 WHERE id = $6 AND user_id = $7",
    [name, price, stock, category, selling_price, id, userId]
  );
  return { message: "Product updated" };
};

// Update stock (no changes needed)
export const updateProductStock = async (id, userId, qtySold) => {
  const result = await pool.query(
    `UPDATE products
     SET units = units - $1
     WHERE id = $2 AND user_id = $3 AND units >= $4
     RETURNING *`,
    [qtySold, id, userId, qtySold]
  );
  return result.rows;  
};

// Delete product
export const deleteProduct = async (id, userId) => {
  await pool.query(
    "DELETE FROM products WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  return { message: "Product deleted" };
};
