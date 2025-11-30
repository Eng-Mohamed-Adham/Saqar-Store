import express from 'express';
import Notification from '../models/notificationModel.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ✅ [GET] جلب كل الإشعارات للمستخدم الحالي
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'فشل في تحميل الإشعارات', error: err.message });
  }
});

// ✅ [PUT] تعيين إشعار كمقروء
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'تم تعيين الإشعار كمقروء' });
  } catch (err) {
    res.status(500).json({ message: 'فشل تحديث الإشعار', error: err.message });
  }
});

// ✅ [PUT] تعيين الكل كمقروء
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'تم تعيين جميع الإشعارات كمقروءة' });
  } catch (err) {
    res.status(500).json({ message: 'فشل تعيين الكل كمقروء', error: err.message });
  }
});

export default router;
