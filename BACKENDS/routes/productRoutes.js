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

const router = express.Router();

router.post("/updateStock", authenticate, updateStock);
router.get("/products", authenticate, getAllProducts);
router.get("/products/:id", authenticate, getProductById);
router.post("/products", authenticate, createProduct);
router.put("/products/:id", authenticate, updateProduct);
router.delete("/products/:id", authenticate, deleteProduct);

export default router;
