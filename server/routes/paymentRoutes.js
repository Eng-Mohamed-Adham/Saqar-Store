import express from 'express';
import { createStripeSession } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// router.post('/', protect, createPayment);
router.post('/stripe', createStripeSession);
router.post('/create-checkout-session', protect, createStripeSession);


export default router;
