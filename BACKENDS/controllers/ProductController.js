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

// Create Product
export const createProduct = async (req, res) => {
  try {
    // FIX: Extract 'barcode' from req.body
    const { name, price, stock, category, selling_price = 0, barcode = null } = req.body;
    
    if (stock === undefined || stock === null)
      return res.status(400).json({ message: "Stock/Units is required" });

    // FIX: Pass 'barcode' as the 7th argument to match your Model
    await Product.createProduct(req.userId, name, price, stock, category, selling_price, barcode);
    
    res.status(201).json({ message: "Product created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { name, price, stock, category, selling_price = 0, barcode = null } = req.body;
    const { id } = req.params;

    /** * FIX: Match your Model's argument order exactly:
     * Model expects: (id, userId, name, price, stock, category, selling_price, barcode)
     */
    await Product.updateProduct(
      id,            // 1
      req.userId,    // 2
      name,          // 3
      price,         // 4
      stock,         // 5
      category,      // 6
      selling_price, // 7
      barcode        // 8
    );
    
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

//Search products by barcode
export const getProductByBarcode = async (req, res) => {
  try {
    const product = await Product.getProductByBarcode(req.params.barcode, req.userId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
