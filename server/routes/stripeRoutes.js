import express from 'express';
import { connectStripe,createExpressAccount } from '../controllers/stripeController.js';
import { protect } from '../middlewares/authMiddleware.js';
import User from '../models/userModel.js';

const router = express.Router();

router.post('/connect',  protect,createExpressAccount);
// PUT /api/users/stripe-account
router.put('/stripe-account', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.stripeAccountId = req.body.stripeAccountId;
  await user.save();
  res.json({ message: 'Stripe account linked' });
});



export default router;
