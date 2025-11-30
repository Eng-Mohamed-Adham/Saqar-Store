import express from 'express';
import multer from 'multer';
import {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';
import User from '../models/userModel.js';
import { storage } from '../config/cloudinary.js';


const router = express.Router();
const upload = multer({ storage }); 




router.post('/', upload.single('photo'), createUser);

// ✅ دمج الحالتين في راوت واحد فقط
router.get('/', protect, async (req, res) => {
  try {
    const { sellerOnly } = req.query;

    // إذا كان sellerOnly=true نجلب فقط التجار
    let query = {};
    if (sellerOnly === 'true') {
      query = { role: 'seller', _id: { $ne: req.user._id } };
    } else {
      // فقط المشرفون يمكنهم رؤية جميع المستخدمين
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'غير مصرح' });
      }
    }

    const users = await User.find(query).select('name email role phone');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'فشل جلب المستخدمين', error: error.message });
  }
});

router.get('/:id', getUserById);
router.put('/:id', protect, upload.single('photo'), updateUser);
router.delete('/:id', requireRole('admin'), deleteUser);

export default router;
