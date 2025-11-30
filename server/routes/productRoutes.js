// routes/productRoutes.js
import express from 'express';
import {
  createProduct,
  getAllProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addOrUpdateReview
} from '../controllers/productController.js';
import upload from '../middlewares/uploadMiddleware.js';
import {protect,requireRole} from '../middlewares/authMiddleware.js';

const router = express.Router();

// /api/products
router.route('/')
  .get(getAllProducts)
  .post(protect,requireRole('seller'),createProduct);
router.get('/mine', protect, requireRole('seller'), getMyProducts);

// /api/products/:id
router.route('/:id')
  .get(getProductById)
  .put(protect,requireRole('seller', 'admin'),updateProduct)
  .delete(protect,requireRole('seller', 'admin'),deleteProduct);
  // /api/products/upload
router.post('/:productId/review', protect, addOrUpdateReview);


export default router;
