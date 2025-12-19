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
    const saleRes = await Sales.insertSale(userId, productId, quantity, price);

    res.status(201).json({
      message: "Sale recorded successfully",
      // normalize returned column name `profit_loss` to `profit` for the client
      sale: {
        id: saleRes.rows[0].id,
        profit: Number(saleRes.rows[0].profit_loss ?? 0),
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

    // Normalize rows to avoid undefined properties and unify profit field
    const normalized = rows.map((r) => ({
      id: r.id,
      product_name: r.product_name || "",
      quantity: Number(r.quantity) || 0,
      price: Number(r.price) || 0,
      profit: Number(r.profit_loss ?? r.profit ?? 0),
      created_at: r.created_at,
    }));

    // Precompute totals safely
    let totalAmount = 0;
    let totalProfit = 0;
    normalized.forEach((s) => {
      totalAmount += s.quantity * s.price;
      totalProfit += s.profit;
    });

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales-${date}.pdf`
    );

    // Pipe after validation to avoid write-after-end on error
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
    const productWidth = 140;
    const qtyX = productX + productWidth + 10;
    const priceX = qtyX + 50;
    const totalX = priceX + 80;
    const profitX = totalX + 90;

    // Table Header
    doc
      .fontSize(12)
      .fillColor("#111827")
      .text("S/N", snX, tableTop)
      .text("Product", productX, tableTop)
      .text("Qty", qtyX, tableTop)
      .text("Price", priceX, tableTop)
      .text("Total", totalX, tableTop)
      .text("Profit/Loss", profitX, tableTop);

    doc.moveDown(0.5);

    // --- Helper: Title Case ---
    const toTitleCase = (str = "") =>
      String(str).replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    let y = doc.y;

    normalized.forEach((sale, index) => {
      const saleTotal = sale.quantity * sale.price;

      const rowHeight = Math.max(doc.heightOfString(toTitleCase(sale.product_name), { width: productWidth }), 12) + 8;

      doc
        .fontSize(12)
        .fillColor("#1f2937")
        .text(index + 1, snX, y)
        .text(toTitleCase(sale.product_name), productX, y, { width: productWidth, ellipsis: true })
        .text(String(sale.quantity), qtyX, y)
        .text(`₦${sale.price.toLocaleString()}`, priceX, y)
        .text(`₦${saleTotal.toLocaleString()}`, totalX, y)
        .text(`₦${sale.profit.toLocaleString()}`, profitX, y);

      y += rowHeight;
    });

    doc.moveDown(2);

    // --- Totals ---
    doc
      .fontSize(14)
      .fillColor("#1d4ed8")
      .text(`Total Amount: ₦${totalAmount.toLocaleString()}`, { align: "right" })
      .text(`Total Profit/Loss: ₦${totalProfit.toLocaleString()}`, { align: "right" });

    // finalize PDF
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating PDF" });
  }
};
