// controllers/offerController.ts
import { Offer } from '../models/offerModel.js';
import  Product  from '../models/Product.js';
import { cloudinary } from '../config/cloudinary.js';
import  User  from '../models/userModel.js';

export const createOffer = async (req, res) => {
  try {
    const { title, description, discount, expiresAt, products, couponCode, couponFor, image } = req.body;
    const sellerId = req.user._id;

    if (req.user && req.user.role === 'seller') {
      const seller = await User.findById(req.user.id);
      if (seller?.isBanned) {
        return res.status(403).json({ message: 'You are banned from performing this action' });
      }
    }

    // رفع الصورة (من file أو base64)
    let imageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'offers',
      });
      imageUrl = result.secure_url;
    } else if (image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: 'offers',
      });
      imageUrl = result.secure_url;
    }

      const enrichedProducts = await Promise.all(
      products.map(async (prodId) => {
        const product = await Product.findById(prodId);
        if (!product) throw new Error('product not found');
        return {
          product: product._id,
          initialStock: product.stock,
        };
      })
    );




    const offer = new Offer({
      title,
      description,
      discount,
      expiresAt,
      image: imageUrl,
      seller: sellerId,
      products: enrichedProducts,
      couponCode,
      couponFor,
    });

    const saved = await offer.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Error on creating offer', error: err.message });
  }
};

export const getAllOffers = async (req, res) => {
  try {
    const { seller, expired } = req.query;

    const filter = {};

    // فلترة حسب البائع
    if (seller) {
      filter.seller = seller;
    }

    // فلترة حسب حالة العرض (منتهي أو فعال)
    if (expired === 'true') {
      filter.expiresAt = { $lte: new Date() }; // منتهي
    } else if (expired === 'false') {
      filter.expiresAt = { $gt: new Date() }; // فعال
    }

    const offers = await Offer.find(filter)
      .populate('seller', 'username email role')
      .populate('products.product', 'name price stock');

    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: 'فشل في جلب العروض', error: err.message });
  }
};

// Get offer by ID
export const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('seller', 'username email role')
      .populate('products.product', 'name price stock');

    if (!offer) return res.status(404).json({ message: 'العرض غير موجود' });

    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب العرض', error: err.message });
  }
};
// Update offer
export const updateOffer = async (req, res) => {
  try {
    const { title, description, discount, expiresAt, couponCode, couponFor, image } = req.body;
    const offer = await Offer.findById(req.params.id);

    if (!offer) return res.status(404).json({ message: 'العرض غير موجود' });

    if (
      req.user.role !== 'admin' &&
      offer.seller.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل هذا العرض' });
    }

    offer.title = title || offer.title;
    offer.description = description || offer.description;
    offer.discount = discount ?? offer.discount;
    offer.expiresAt = expiresAt || offer.expiresAt;
    offer.couponCode = couponCode ?? offer.couponCode;
    offer.couponFor = couponFor ?? offer.couponFor;

    // رفع صورة جديدة إن وجدت
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'offers' });
      offer.image = result.secure_url;
    } else if (image) {
      const result = await cloudinary.uploader.upload(image, { folder: 'offers' });
      offer.image = result.secure_url;
    }

    if (req.user && req.user.role === 'seller') {
  const seller = await User.findById(req.user.id);
  if (seller?.isBanned) {
    return res.status(403).json({ message: 'You are banned from performing this action' });
  }
}


    const updated = await offer.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'فشل تحديث العرض', error: err.message });
  }
};

// Delete offer
export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) return res.status(404).json({ message: 'العرض غير موجود' });

    if (
      req.user.role !== 'admin' &&
      offer.seller.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذا العرض' });
    }

    await offer.deleteOne();
    res.json({ message: 'تم حذف العرض بنجاح' });
  } catch (err) {
    res.status(500).json({ message: 'فشل حذف العرض', error: err.message });
  }
};

export const getMyOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ seller: req.user._id })
      .populate('products.product', 'name price stock');

    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: 'فشل في جلب عروضك', error: err.message });
  }
};
