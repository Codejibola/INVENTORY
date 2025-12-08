import * as Sales from "../models/sales_Model.js";
import PDFDocument from "pdfkit";

export const getAllSales = async (req, res) => {
  try {
    const { rows } = await Sales.fetchAllSales(req.userId);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching sales" });
  }
};

export const recordSale = async (req, res) => {
  const { productId, quantity, price } = req.body;
  const userId = req.userId;

  if (!productId || !quantity || !price) {
    return res.status(400).json({
      message: "productId, quantity, and price are required.",
    });
  }

  try {
    const [result] = await Sales.insertSale(userId, productId, quantity, price);
    res.status(201).json({
      message: "Sale recorded successfully",
      saleId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error recording sale" });
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
    const date = req.params.date;
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
    const date = req.params.date;
    const { rows } = await Sales.fetchSalesByDate(req.userId, date);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching sales for this date" });
  }
};


export const downloadDailySalesPDF = async (req, res) => {
  try {
    const date = req.params.date;
    const { rows } = await Sales.fetchSalesByDate(req.userId, date);

    if (!rows.length) {
      return res.status(404).json({ message: "No sales for this date" });
    }

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales-${date}.pdf`
    );

    doc.pipe(res);

    // --- Header ---
    doc
      .fontSize(20)
      .fillColor("#1f2937")
      .text("Sales Report", { align: "center" });
    doc
      .fontSize(14)
      .fillColor("#374151")
      .text(`Date: ${date}`, { align: "center" });
    doc.moveDown(2);

    // --- Table Setup ---
    const tableTop = doc.y;
    const snX = 50;
    const productX = 80;
    const productWidth = 160; // Product column width
    const qtyX = productX + productWidth + 10;
    const priceX = qtyX + 50;
    const totalX = priceX + 80;

    // Table Header
    doc
      .fontSize(12)
      .fillColor("#111827")
      .text("S/N", snX, tableTop)
      .text("Product", productX, tableTop)
      .text("Qty", qtyX, tableTop)
      .text("Price", priceX, tableTop)
      .text("Total", totalX, tableTop);

    doc.moveDown(0.5);

    // --- Helper: Title Case ---
    const toTitleCase = (str) =>
      str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    // --- Table Rows with dynamic spacing ---
    let y = doc.y;
    let totalAmount = 0;

    rows.forEach((sale, index) => {
      const saleTotal = sale.quantity * sale.price;
      totalAmount += saleTotal;

      // Measure height of product name text
      const productTextHeight = doc.heightOfString(toTitleCase(sale.product_name), {
        width: productWidth,
      });

      const rowHeight = Math.max(productTextHeight, 12) + 8; // Add padding

      // Draw the row
      doc
        .fontSize(12)
        .fillColor("#1f2937")
        .text(index + 1, snX, y)
        .text(toTitleCase(sale.product_name), productX, y, {
          width: productWidth,
          ellipsis: true, // truncate if really long
        })
        .text(sale.quantity, qtyX, y)
        .text(`₦${sale.price.toLocaleString()}`, priceX, y)
        .text(`₦${saleTotal.toLocaleString()}`, totalX, y);

      y += rowHeight; // Move to next row
    });

    doc.moveDown(2);

    // --- Total Amount ---
    doc
      .fontSize(14)
      .fillColor("#1d4ed8")
      .text(`Total Amount: ₦${totalAmount.toLocaleString()}`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating PDF" });
  }
};
