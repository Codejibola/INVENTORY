import pool from "../config/db.js";

export const getAllProducts = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE user_id = $1 ORDER BY name ASC",
    [userId]
  );
  return result.rows;  
};

export const getProductById = async (id, userId) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  return result.rows;  
};

export const createProduct = async (userId, name, price, stock, category) => {
  await pool.query(
    "INSERT INTO products (user_id, name, price, units, category) VALUES ($1, $2, $3, $4, $5)",
    [userId, name, price, stock, category]
  );
  return { message: "Product created" };
};

export const updateProduct = async (id, userId, name, price, stock, category) => {
  await pool.query(
    "UPDATE products SET name = $1, price = $2, units = $3, category = $4 WHERE id = $5 AND user_id = $6",
    [name, price, stock, category, id, userId]
  );
  return { message: "Product updated" };
};

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

export const deleteProduct = async (id, userId) => {
  await pool.query(
    "DELETE FROM products WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  return { message: "Product deleted" };
};
