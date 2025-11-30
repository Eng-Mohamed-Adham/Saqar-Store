// routes/sellerRoutes.js
import express from 'express';
import { protect, requireRole } from '../middlewares/authMiddleware.js';
import {
  getSellerById,
  createSellerReview,
  getSellerReviews,
} from '../controllers/sellerController.js';

const router = express.Router();

router.get('/:id', getSellerById); // بيانات التاجر
router.get('/:id/reviews', getSellerReviews); // كل التقييمات
router.post('/:id/reviews', protect, requireRole('user'), createSellerReview); // إنشاء تقييم

export default router;
