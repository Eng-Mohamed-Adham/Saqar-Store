import express from 'express';
import {
  createOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  getMyOffers,
} from '../controllers/offerController.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';
import { storage } from '../config/cloudinary.js'; 
import multer from 'multer';




const router = express.Router();
const upload = multer({ storage });


router.get('/', getAllOffers);
router.get('/:id', getOfferById);

router.post('/', protect, requireRole('seller'), upload.single('image'), createOffer);
router.put('/:id', protect, upload.single('image'), updateOffer);
router.delete('/:id', protect, deleteOffer);
router.get('/mine', protect, requireRole('seller'), getMyOffers);

export default router;
