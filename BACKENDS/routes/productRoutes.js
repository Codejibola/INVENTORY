import express from "express";
import {
  getAllProducts,
  getProductById, 
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
} from "../controllers/ProductController.js";
import { authenticate } from "../config/Authenticate.js";
import { userLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/updateStock", authenticate, userLimiter, updateStock);
router.get("/products", authenticate, userLimiter, getAllProducts);
router.get("/products/:id", authenticate, userLimiter, getProductById);
router.post("/products", authenticate, userLimiter, createProduct);
router.put("/products/:id", authenticate, userLimiter, updateProduct);
router.delete("/products/:id", authenticate, userLimiter, deleteProduct);

export default router;
