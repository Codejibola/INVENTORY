import * as Sales from "../models/sales_Model.js";
import ExcelJS from "exceljs";

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

export const downloadDailySalesExcel = async (req, res) => {
  try {
    const date = req.params.date;
    const { rows } = await Sales.fetchSalesByDate(req.userId, date);

    if (!rows.length) {
      return res.status(404).json({ message: "No sales for this date" });
    }

    const sales = rows.map((r) => {
      const quantity = Number(r.quantity) || 0;
      const unitPrice = Number(r.price) || 0;

      return {
        product: r.product_name || "",
        quantity,
        unitPrice,
        total: quantity * unitPrice,
        profit: Number(r.profit_loss ?? 0),
      };
    });

    let totalAmount = 0;
    let totalProfit = 0;

    sales.forEach((s) => {
      totalAmount += s.total;
      totalProfit += s.profit;
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Daily Sales");

    /* ================= PRINT SETUP ================= */
    sheet.pageSetup = {
      paperSize: 9, // A4
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: false,
    };

    /* ================= HEADER ================= */
    sheet.mergeCells("A1:F1");
    sheet.getCell("A1").value = "Daily Sales Report";
    sheet.getCell("A1").font = { size: 16, bold: true };
    sheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    sheet.mergeCells("A2:F2");
    sheet.getCell("A2").value = `Date: ${date}`;
    sheet.getCell("A2").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    sheet.addRow([]); // spacer row

    /* ================= TABLE HEADER ================= */
    const headerRow = sheet.addRow([
      "#",
      "Product",
      "Quantity",
      "Unit Price",
      "Total",
      "Profit / Loss",
    ]);

    headerRow.font = { bold: true };

    headerRow.eachCell((cell, colNumber) => {
      cell.alignment = {
        vertical: "middle",
        horizontal:
          colNumber === 1
            ? "center"
            : colNumber === 2
            ? "left"
            : "right",
      };
    });

    /* Repeat header on every printed page */
    sheet.pageSetup.printTitlesRow = `${headerRow.number}:${headerRow.number}`;

    /* ================= COLUMN DEFINITIONS ================= */
    sheet.columns = [
      { key: "index", width: 5 },
      { key: "product", width: 32 },
      { key: "quantity", width: 12 },
      { key: "unitPrice", width: 15 },
      { key: "total", width: 15 },
      { key: "profit", width: 18 },
    ];

    /* ================= TABLE ROWS ================= */
    sales.forEach((s, i) => {
      const row = sheet.addRow([
        i + 1,
        s.product,
        s.quantity,
        s.unitPrice,
        s.total,
        s.profit,
      ]);

      row.eachCell((cell, colNumber) => {
        cell.alignment = {
          vertical: "middle",
          horizontal:
            colNumber === 1
              ? "center"
              : colNumber === 2
              ? "left"
              : "right",
        };
      });

      row.getCell(4).numFmt = '"₦"#,##0.00';
      row.getCell(5).numFmt = '"₦"#,##0.00';
      row.getCell(6).numFmt =
        '"₦"+#,##0.00;"₦"-#,##0.00;"₦"0.00';

      row.getCell(6).font = {
        color: {
          argb: s.profit >= 0 ? "FF16A34A" : "FFDC2626",
        },
      };
    });

    /* ================= TOTAL ROW ================= */
    sheet.addRow([]);

    const totalRow = sheet.addRow([
      "",
      "",
      "",
      "TOTAL SALES",
      totalAmount,
      totalProfit,
    ]);

    totalRow.font = { bold: true };

    totalRow.eachCell((cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "right",
      };
    });

    totalRow.getCell(5).numFmt = '"₦"#,##0.00';
    totalRow.getCell(6).numFmt =
      '"₦"+#,##0.00;"₦"-#,##0.00';

    totalRow.getCell(6).font = {
      color: {
        argb: totalProfit >= 0 ? "FF16A34A" : "FFDC2626",
      },
    };

    /* ================= BORDERS FOR PRINT ================= */
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber >= headerRow.number) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    /* ================= RESPONSE ================= */
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales-${date}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating Excel file" });
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
