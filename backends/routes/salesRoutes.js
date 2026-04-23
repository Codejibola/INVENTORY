import express from "express";
import { authenticate } from "../config/Authenticate.js";
import {
  getAllSales,
  recordSale,
  getDailySales,
  viewDailySales,
  getSalesByDate,
  getBestSellingProduct,
  getLeastSellingProduct,
  downloadDailySalesData,
  getReceiptsHistory
} from "../controllers/SalesController.js";
import { userLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/sales", authenticate, userLimiter, getAllSales);
router.post("/sales", authenticate, userLimiter, recordSale);
router.get("/sales/daily", authenticate, userLimiter, getDailySales);
router.get("/sales/daily/:date/view", authenticate, userLimiter, viewDailySales);
router.get("/daily/:date/view", authenticate, userLimiter, getSalesByDate);
router.get("/sales/daily/:date/data", authenticate, userLimiter, downloadDailySalesData);
router.get("/sales/best-selling", authenticate, userLimiter, getBestSellingProduct);
router.get("/sales/least-selling", authenticate, userLimiter, getLeastSellingProduct);
router.get("/receipts", authenticate, userLimiter, getReceiptsHistory);



export default router;

