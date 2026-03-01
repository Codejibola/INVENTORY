import * as Sales from "../models/sales_Model.js";
import html_to_pdf from "html-pdf-node";

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


export const downloadDailySalesInvoice = async (req, res) => {
  try {
    const date = req.params.date;
    const { rows } = await Sales.fetchSalesByDate(req.userId, date);

    if (!rows.length) return res.status(404).json({ message: "No sales found" });

    const totalAmount = rows.reduce((acc, r) => acc + Number(r.price), 0);
    const totalProfit = rows.reduce((acc, r) => acc + Number(r.profit_loss || 0), 0);

    // HTML Template with CSS for Branding and Watermark
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; color: #1e293b; }
        
        /* THE WATERMARK */
        .watermark {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 80px; font-weight: 900; color: rgba(15, 23, 42, 0.03); 
          z-index: -1; white-space: nowrap;
        }

        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 4px solid #2563eb; padding-bottom: 20px; }
        
        /* LOGO STYLING */
        .logo-box { width: 70px; height: 70px; background: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        
        .store-details { text-align: right; }
        .store-name { font-size: 24px; font-weight: 900; color: #1e293b; margin: 0; text-transform: uppercase; }
        .report-type { font-size: 12px; color: #64748b; letter-spacing: 2px; margin-top: 5px; }

        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #0f172a; color: white; padding: 12px; font-size: 10px; text-transform: uppercase; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
        
        .amount-col { text-align: right; font-family: monospace; font-size: 13px; }
        .profit-pos { color: #16a34a; font-weight: bold; }
        .profit-neg { color: #dc2626; font-weight: bold; }
        
        .total-row { background: #f8fafc; font-weight: 900; }
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="watermark">QUANTORA</div>

      <div class="header">
        <div class="logo-box">QS</div> <div class="store-details">
          <h1 class="store-name">QUANTORA STORES</h1>
          <div class="report-type">DAILY SALES TERMINAL REPORT</div>
          <p style="font-size: 12px; margin: 5px 0;">Date: <strong>${date}</strong></p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Product Description</th>
            <th>Qty</th>
            <th class="amount-col">Unit Price</th>
            <th class="amount-col">Total</th>
            <th class="amount-col">Profit / Loss</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r, i) => {
            const qty = Number(r.quantity) || 1;
            const price = Number(r.price) || 0;
            const profit = Number(r.profit_loss || 0);
            return `
            <tr>
              <td>${i + 1}</td>
              <td style="font-weight: 600;">${r.product_name}</td>
              <td>${qty}</td>
              <td class="amount-col">₦${(price / qty).toLocaleString()}</td>
              <td class="amount-col">₦${price.toLocaleString()}</td>
              <td class="amount-col ${profit >= 0 ? 'profit-pos' : 'profit-neg'}">
                ${profit >= 0 ? '+' : '-'} ₦${Math.abs(profit).toLocaleString()}
              </td>
            </tr>`;
          }).join('')}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="4" style="text-align: right;">GRAND TOTAL</td>
            <td class="amount-col" style="color: #2563eb;">₦${totalAmount.toLocaleString()}</td>
            <td class="amount-col ${totalProfit >= 0 ? 'profit-pos' : 'profit-neg'}">
               ${totalProfit >= 0 ? '+' : '-'} ₦${Math.abs(totalProfit).toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>

      <div class="footer">
        <p>This is a computer-generated document. No signature required.</p>
        <p>&copy; 2026 Quantora Inventory Systems</p>
      </div>
    </body>
    </html>
    `;

    // PDF Options
    const options = { format: "A4", margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" } };
    const file = { content: htmlContent };

    html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=Invoice-${date}.pdf`);
      res.send(pdfBuffer);
    });

  } catch (err) {
    console.error("PDF Export Error:", err);
    res.status(500).json({ message: "Error generating professional PDF" });
  }
};


export const getBestSellingProduct = async (req, res) => {
  try {
    const { rows } = await Sales.fetchProductSalesSummary(req.userId);

    if (!rows.length) {
      return res.status(404).json({
        message: "No sales data available",
      });
    }

    // Find product with highest total_quantity_sold
    let bestProduct = rows[0];

    for (const product of rows) {
      if (
        Number(product.total_quantity_sold) >
        Number(bestProduct.total_quantity_sold)
      ) {
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
    res.status(500).json({
      message: "Server error fetching best selling product",
    });
  }
};


export const getLeastSellingProduct = async (req, res) => {
  try {
    const { rows } = await Sales.fetchProductSalesSummary(req.userId);

    if (!rows.length) {
      return res.status(404).json({
        message: "No sales data available",
      });
    }

    // Find product with lowest total_quantity_sold
    let leastProduct = rows[0];

    for (const product of rows) {
      if (
        Number(product.total_quantity_sold) <
        Number(leastProduct.total_quantity_sold)
      ) {
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
    res.status(500).json({
      message: "Server error fetching least selling product",
    });
  }
};
