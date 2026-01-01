import express from "express";
import { authenticate } from "../config/Authenticate.js";
import {
  getAllSales,
  recordSale,
  getDailySales,
  viewDailySales,
  getSalesByDate,
   downloadDailySalesExcel
} from "../controllers/SalesController.js";

const router = express.Router();

router.get("/sales", authenticate, getAllSales);
router.post("/sales", authenticate, recordSale);
router.get("/sales/daily", authenticate, getDailySales);
router.get("/sales/daily/:date/view", authenticate, viewDailySales);
router.get("/daily/:date/view", authenticate, getSalesByDate);
router.get("/sales/daily/:date/excel", authenticate, downloadDailySalesExcel);



export default router;
