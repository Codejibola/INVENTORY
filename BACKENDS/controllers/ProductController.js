import * as Product from "../models/product_Model.js";

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const rows = await Product.getAllProducts(req.userId);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const rows = await Product.getProductById(req.params.id, req.userId);
    if (rows.length === 0) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create product (including selling_price)
export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category, selling_price = 0 } = req.body;
    if (stock === undefined || stock === null)
      return res.status(400).json({ message: "Stock/Units is required" });

    await Product.createProduct(req.userId, name, price, stock, category, selling_price);
    res.status(201).json({ message: "Product created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update product (including selling_price)
export const updateProduct = async (req, res) => {
  try {
    const { name, price, stock, category, selling_price = 0 } = req.body;
    await Product.updateProduct(req.params.id, req.userId, name, price, stock, category, selling_price);
    res.json({ message: "Product updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update stock (no changes)
export const updateStock = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const [result] = await Product.updateProductStock(productId, req.userId, quantity);
    if (!result) {
      return res.status(400).json({ message: "Insufficient stock or product not found." });
    }
    res.json({ message: "Sale recorded and stock updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    await Product.deleteProduct(req.params.id, req.userId);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
