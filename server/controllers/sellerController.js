// controllers/sellerController.js
import User from '../models/userModel.js';
import SellerReview from '../models/sellerReviewModel.js';

// ✅ جلب بيانات التاجر
export const getSellerById = async (req, res) => {
  const seller = await User.findById(req.params.id);
  if (!seller || seller.role !== 'seller') {
    return res.status(404).json({ message: 'Seller not found' });
  }
  res.json(seller);
};

// ✅ إنشاء تقييم جديد للتاجر
export const createSellerReview = async (req, res) => {
  const { rating, comment } = req.body;
  const sellerId = req.params.id;

  const seller = await User.findById(sellerId);
  if (!seller || seller.role !== 'seller') {
    return res.status(404).json({ message: 'Seller not found' });
  }

  const alreadyReviewed = await SellerReview.findOne({
    seller: sellerId,
    user: req.user._id,
  });

  if (alreadyReviewed) {
    return res.status(400).json({ message: 'You already reviewed this seller' });
  }

  const review = await SellerReview.create({
    seller: sellerId,
    user: req.user._id,
    rating,
    comment,
  });

  res.status(201).json(review);
};

// ✅ جلب كل تقييمات التاجر
export const getSellerReviews = async (req, res) => {
  const reviews = await SellerReview.find({ seller: req.params.id }).populate('user', 'username photo');

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  res.json({ reviews, averageRating });
};
