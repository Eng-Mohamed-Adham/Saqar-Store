// controllers/wishlistController.js
import User from '../models/userModel.js';
import Product from '../models/Product.js';

export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json(user.wishlist);
};

export const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  const user = await User.findById(req.user._id);
  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    await user.save();
  }

  res.status(200).json({ message: 'Added to wishlist' });
};

export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId
  );
  await user.save();

  res.status(200).json({ message: 'Removed from wishlist' });
};
