import express from 'express';

import { createContactMessage, getAllMessages, markMessageResolved } from '../controllers/contactController.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/contact - إرسال رسالة
// GET /api/contact - عرض الرسائل (لـ admin فقط)
// PATCH /api/contact/:id - تعديل الحالة (مثلاً تم الرد عليها)

router.post('/', createContactMessage);
router.get('/',protect,requireRole('admin'), getAllMessages);
router.patch('/:id', protect,requireRole('admin'), markMessageResolved);

export default router;