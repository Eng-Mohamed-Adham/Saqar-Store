import express from 'express';
import {
  getCards,
  createCard,
  updateCard,
  deleteCard,
  getMyCards 
} from '../controllers/cardController.js';

import upload from '../middlewares/uploadMiddleware.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getCards);
router.get('/my', protect, requireRole('seller'), getMyCards); 

// تمرير صورة عبر form-data بـ key اسمه "image"
router.post('/',protect,requireRole('seller'), upload.single('image'), createCard);
router.put('/:id',protect,requireRole('seller'), upload.single('image'), updateCard);
router.delete('/:id',protect,requireRole('seller'), deleteCard);

export default router;
