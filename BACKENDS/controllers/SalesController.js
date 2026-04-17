import * as Sales from "../models/sales_Model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- LOGO LOGIC ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getLogoDataUri = () => {
  try {
    const logoPath = path.join(__dirname, "../assets/logo.png");
    const logoBase64 = fs.readFileSync(logoPath).toString("base64");
    return `data:image/png;base64,${logoBase64}`;
  } catch (error) {
    console.error("Logo not found at assets/logo.png, using empty string");
    return "";
  }
};

const logoDataUri = getLogoDataUri();
// ------------------

// HELPER: Get today's date in YYYY-MM-DD format based on server time
const getTodayDate = () => new Date().toLocaleDateString('en-CA');

export const getAllSales = async (req, res) => {
  try {
    const { rows } = await Sales.fetchAllSales(req.userId);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching sales" });
  }
};

/**
 * UPDATED: Captures soldBy from the frontend terminal
 */
export const recordSale = async (req, res) => {
  // Extract soldBy along with other details
  const { productId, quantity, price, soldBy } = req.body;
  const userId = req.userId;

  if (!productId || !quantity || !price) {
    return res.status(400).json({
      message: "productId, quantity, and price are required.",
    });
  }

  try {
    // Pass soldBy as the 5th argument to the model
    const saleRes = await Sales.insertSale(userId, productId, quantity, price, soldBy);
    
    res.status(201).json({
      message: "Sale recorded successfully",
      sale: {
        id: saleRes.rows[0].id,
        profit: Number(saleRes.rows[0].profit_loss ?? 0),
        soldBy: saleRes.rows[0].sold_by, // Return the name in response
        created_at: saleRes.rows[0].created_at
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error recording sale" });
  }
};

export const getDailySales = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const { rows } = await Sales.fetchDailySales(req.userId, year);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching daily sales" });
  }
};

export const viewDailySales = async (req, res) => {
  try {
    let date = req.params.date;
    if (date === 'today') date = getTodayDate();
    if (!date) return res.status(400).json({ message: "Date is required" });

    const { rows } = await Sales.fetchSalesByDate(req.userId, date);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching daily sales" });
  }
};

export const getSalesByDate = async (req, res) => {
  try {
    let date = req.params.date;
    if (date === 'today') date = getTodayDate();
    const { rows } = await Sales.fetchSalesByDate(req.userId, date);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching sales for this date" });
  }
};

export const downloadDailySalesData = async (req, res) => {
  try {
    let date = req.params.date;
    if (date === 'today') date = new Date().toLocaleDateString('en-CA');

    // The model updated earlier now returns 'sold_by' in this query
    const { rows } = await Sales.fetchSalesByDate(req.userId, date);
    
    if (!rows.length) {
      return res.status(404).json({ message: "No sales found for this date." });
    }

    // Raw data sent to frontend includes the worker name automatically now
    res.json({
      shopName: rows[0].shop_name || "Quantora Stores",
      date: date,
      sales: rows
    });

  } catch (err) {
    console.error("Data Fetch Error:", err);
    res.status(500).json({ message: "Error fetching invoice data" });
  }
};

export const getBestSellingProduct = async (req, res) => {
  try {
    const { rows } = await Sales.fetchProductSalesSummary(req.userId);
    if (!rows.length) return res.status(404).json({ message: "No sales data available" });

    let bestProduct = rows[0];
    for (const product of rows) {
      if (Number(product.total_quantity_sold) > Number(bestProduct.total_quantity_sold)) {
        bestProduct = product;
      }
    }

    res.json({
      productId: bestProduct.product_id,
      productName: bestProduct.product_name,
      totalQuantitySold: Number(bestProduct.total_quantity_sold),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching best selling product" });
  }
};

export const getLeastSellingProduct = async (req, res) => {
  try {
    const { rows } = await Sales.fetchProductSalesSummary(req.userId);
    if (!rows.length) return res.status(404).json({ message: "No sales data available" });

    let leastProduct = rows[0];
    for (const product of rows) {
      if (Number(product.total_quantity_sold) < Number(leastProduct.total_quantity_sold)) {
        leastProduct = product;
      }
    }

    res.json({
      productId: leastProduct.product_id,
      productName: leastProduct.product_name,
      totalQuantitySold: Number(leastProduct.total_quantity_sold),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching least selling product" });
  }
};