import * as Sales from "../models/sales_Model.js";
import html_to_pdf from "html-pdf-node";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- LOGO LOGIC ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This reads the image file and converts it to a string the PDF can understand
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
      sale: {
        id: saleRes.rows[0].id,
        profit: Number(saleRes.rows[0].profit_loss ?? 0),
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

export const downloadDailySalesExcel = async (req, res) => {
  try {
    let date = req.params.date;
    if (date === 'today') date = getTodayDate();

    const { rows } = await Sales.fetchSalesByDate(req.userId, date);
    if (!rows.length) return res.status(404).json({ message: "No sales found for this date." });

    const totalAmount = rows.reduce((acc, r) => acc + Number(r.price), 0);
    const totalProfit = rows.reduce((acc, r) => acc + Number(r.profit_loss || 0), 0);
    // --- NEW: Calculate Total Quantity ---
    const totalQuantity = rows.reduce((acc, r) => acc + Number(r.quantity), 0);
    // -------------------------------------

    // --- HELPER: Title Case ---
    const toTitleCase = (str) => {
      return str.toLowerCase().split(' ').map(word => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
      }).join(' ');
    };
    // -------------------------

    // Assume shop name is in the first row of data
    const shopName = rows[0].shop_name || "Quantora Stores";

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; color: #1e293b; }
        .watermark {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 80px; font-weight: 900; 
          color: rgba(59, 130, 246, 0.08); 
          z-index: -1; white-space: nowrap;
          text-transform: uppercase; letter-spacing: 15px;
        }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 4px solid #2563eb; padding-bottom: 20px; }
        
        /* Smaller, professional logo */
        .logo-container { width: 100px; } 
        .logo-container img { width: 100%; height: auto; display: block; }
        
        .store-details { text-align: right; }
        .store-name { font-size: 24px; font-weight: 900; color: #1e293b; margin: 0; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
        th { background: #0f172a; color: white; padding: 12px; font-size: 10px; text-transform: uppercase; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; word-wrap: break-word; }
        .amount-col { text-align: right; font-family: monospace; font-weight: 600; }
        .qty-col { text-align: center; }
        .total-row { background: #f8fafc; font-weight: 900; border-top: 2px solid #2563eb; }
        
        /* --- NEW: Summary Styling --- */
        .summary-box { margin-top: 30px; padding: 15px; background: #f1f5f9; border-radius: 8px; width: 300px; float: right; }
        .summary-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px; }
        .summary-total { font-weight: 900; border-top: 1px solid #cbd5e1; padding-top: 5px; margin-top: 5px; }
        /* ---------------------------- */

        .footer { margin-top: 150px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; clear: both;}
      </style>
    </head>
    <body>
      <div class="watermark">QUANTORA</div>
      <div class="header">
        <div class="logo-container">
          <img src="${logoDataUri}" alt="Quantora Logo">
        </div> 
        <div class="store-details">
          <h1 class="store-name">${shopName}</h1>
          <p style="font-size: 12px; margin: 5px 0;">Sales Report | Date: <strong>${date}</strong></p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 35%;">Product</th>
            <th style="width: 15%;" class="amount-col">Unit Price</th>
            <th style="width: 10%;" class="qty-col">Qty</th>
            <th style="width: 15%;" class="amount-col">Total Price</th>
            <th style="width: 20%;" class="amount-col">Profit / Loss</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r, i) => {
            const unitPrice = Number(r.price) / Number(r.quantity);
            const profitLossValue = Number(r.profit_loss);
            const sign = profitLossValue >= 0 ? '+' : '-';
            
            return `
            <tr>
              <td>${i + 1}</td>
              <td style="font-weight: 600;">${toTitleCase(r.product_name)}</td>
              <td class="amount-col">₦${unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              <td class="qty-col">${r.quantity}</td>
              <td class="amount-col">₦${Number(r.price).toLocaleString()}</td>
              
              <td class="amount-col" style="color: ${profitLossValue >= 0 ? '#16a34a' : '#dc2626'}">
                ${sign}₦${Math.abs(profitLossValue).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </td>
            </tr>`;
          }).join('')}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="4" style="text-align: right;">GRAND TOTAL</td>
            <td class="amount-col">₦${totalAmount.toLocaleString()}</td>
            <td class="amount-col" style="color: ${totalProfit >= 0 ? '#16a34a' : '#dc2626'}">
              ${totalProfit >= 0 ? '+' : '-'}₦${Math.abs(totalProfit).toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>

      <div class="summary-box">
        <div class="summary-row">
          <span>Total Products Sold:</span>
          <span>${rows.length}</span>
        </div>
        <div class="summary-row summary-total">
          <span>Total Items Volume:</span>
          <span>${totalQuantity}</span>
        </div>
      </div>
      <div class="footer">
        <p>Generated at ${new Date().toLocaleTimeString()} on ${getTodayDate()}</p>
        <p>&copy; 2026 Quantora Inventory Systems</p>
      </div>
    </body>
    </html>
    `;

    const options = { format: "A4" };
    const file = { content: htmlContent };

    html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
      // Filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `Invoice-${date}-${timestamp}.pdf`;
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.send(pdfBuffer);
    });

  } catch (err) {
    console.error("PDF Export Error:", err);
    res.status(500).json({ message: "Error generating PDF" });
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