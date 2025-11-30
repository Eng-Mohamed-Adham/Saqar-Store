import express from 'express';
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  updateOrderStatus,
  deleteOrder
} from '../controllers/orderController.js';

import { protect, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// مستخدم عادي
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);

// seller فقط
router.get('/', protect, requireRole('seller'), getAllOrders);
router.put('/:id/status', protect, requireRole('seller'), updateOrderStatus);

// الحذف: إما الأدمن أو صاحب الطلب
router.delete('/:id', protect, deleteOrder);

export default router;
