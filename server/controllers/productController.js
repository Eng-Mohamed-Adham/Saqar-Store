// controllers/productController.js
import Product from '../models/Product.js';
import { cloudinary } from '../config/cloudinary.js';
import aysncHandler from 'express-async-handler';

export const createProduct = aysncHandler(async (req, res) => {
  const { price, category } = req.body;
    const user = req.user; 

    if (user.role !== 'seller') {
      return res.status(403).json({ message:'Only sellers can add products' });
    }
    if (user?.role === 'seller' && user?.isBanned) {
        return res.status(403).json({ message: 'You are banned from adding products' });
    }


    if (!user.stripeAccountId) {
      return res.status(400).json({ message: 'Please connect your Stripe account first' });
    }
      if (!user.username || !price || !category) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

    const imageUrl = req.body.image || 'no-image.jpg';



    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: imageUrl,
      stock: req.body.stock ?? 0,
      rating: req.body.rating ?? 0,
      seller: user._id,
    });

    const saved = await product.save();
    res.status(201).json(saved);

  
});



// جلب كل المنتجات
export const getAllProducts =aysncHandler( async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // 🔍 فلترة بالكلمة المفتاحية في الاسم أو الوصف
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 🏷️ فلترة حسب القسم
    if (category) {
      query.category = category;
    }

    // 💰 فلترة حسب السعر
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    // ⭐ فلترة حسب التقييم
if (req.query.rating) {
  query.rating = { $gte: Number(req.query.rating) };
}

// 📦 فلترة حسب التوفر في المخزون
if (req.query.inStock === 'true') {
  query.stock = { $gt: 0 };
} else if (req.query.inStock === 'false') {
  query.stock = 0;
}


    // 📄 Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // ↕️ الترتيب
    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;

    // 🧾 الاستعلام
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('seller', 'username photo'); // ✅ أضف هذه

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      count: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// جلب منتج حسب المعرف
export const getProductById =aysncHandler( async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'username photo');
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export const getMyProducts =aysncHandler( async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'فقط البائع يمكنه رؤية منتجاته' });
    }

    const sellerId = req.user._id;
    const products = await Product.find({ seller: sellerId });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب المنتجات', error: err.message });
  }
});


// تحديث منتج
export const updateProduct =aysncHandler( async (req, res) => {
  try {
    
if (req.user?.role === 'seller' && req.user?.isBanned) {
  return res.status(403).json({ message: 'You are banned from performing this action' });
}



    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: req.body.image, // أو اعتمد على صورة جديدة إن وجدت
        stock: req.body.stock,
        rating: req.body.rating,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) return res.status(404).json({ message: 'لم يتم العثور على المنتج' });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export const deleteProduct =aysncHandler( async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
if (req.user.role !== 'seller' && product.seller.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: 'غير مصرح لك بتعديل هذا المنتج' });
}
    // 🧹 حذف الصورة من Cloudinary
    if (product.image && product.image.includes('res.cloudinary.com')) {
      const segments = product.image.split('/');
      const publicIdWithExtension = segments.slice(-2).join('/'); // مثلاً: products/abcxyz.jpg
      const publicId = publicIdWithExtension.split('.')[0];       // نحذف الامتداد

      await cloudinary.uploader.destroy(publicId);
    }

    // 🗑️ حذف المنتج من قاعدة البيانات
    await product.deleteOne();

    res.json({ message: 'تم حذف المنتج والصورة من Cloudinary' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Add or update a product review

export const addOrUpdateReview = aysncHandler( async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id; 
      console.log('User ID:', userId);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    const existingReview = product.reviews.find(
      (review) => review.user.toString() === userId.toString()
    );

    if (existingReview) {
      // تعديل التقييم والتعليق
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      // إضافة تقييم جديد
      product.reviews.push({ user: userId, rating, comment });
    }

    // تحديث التقييم العام
    const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = totalRating / product.reviews.length;

    await product.save();

    res.status(200).json({ message: 'تم حفظ التقييم بنجاح', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء إضافة التقييم' });
  }
});
