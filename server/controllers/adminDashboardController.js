// controllers/adminDashboardController.js
import Order from '../models/orderModel.js';
import Product from '../models/Product.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';

export const getAdminDashboardData = asyncHandler( async (req, res) => {
  try {
    // 1. المبيعات لآخر 14 يوم
    const sales = await Order.aggregate([
      {
        $match: { status: { $in: ['processing', 'shipped', 'delivered'] } },
      },
      {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          amount: { $sum: '$totalPrice' },
        },
      },
      {
        $sort: { '_id': 1 }
      },
    ]);

    // 2. المنتجات الأكثر مبيعا
    const topProductsAgg = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          name: '$product.name',
          sales: '$totalSold',
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ]);

    // 3. الطلبات قيد المعالجة شهريًا
    const pendingOrders = await Order.aggregate([
      { $match: { status: 'processing' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. الطلبات المنجزة شهريًا
    const completedOrders = await Order.aggregate([
      { $match: { status: 'delivered' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
    ]);

    // 5. المنتجات منخفضة المخزون
    const lowStock = await Product.find({ stock: { $lte: 10 } })
      .sort({ stock: 1 })
      .limit(5)
      .select('name stock');

    // 6. أهم الزبائن (أعلى مشتريات)
    const topCustomersAgg = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          total: { $sum: '$totalPrice' },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          name: '$user.name',
          total: 1,
        },
      },
    ]);

    res.json({
      sales: sales.map(d => ({ day: d._id, amount: d.amount })),
      topProducts: topProductsAgg,
      pendingOrders: pendingOrders.map(d => ({ month: d._id, count: d.count })),
      completedOrders: completedOrders.map(d => ({ month: d._id, count: d.count })),
      lowStock,
      topCustomers: topCustomersAgg,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل تحميل بيانات لوحة التحكم' });
  }
});


export const banOrUnbanSeller = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const seller = await User.findById(sellerId);

  if (!seller || seller.role !== 'seller') {
    return res.status(404).json({ message: 'Seller not found' });
  }

  seller.isBanned = !seller.isBanned;
  await seller.save();

  res.json({ message: `Seller has been ${seller.isBanned ? 'banned' : 'unbanned'}` });
});
