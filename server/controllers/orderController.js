

import Order from '../models/orderModel.js';
import Product from '../models/Product.js';
import { Offer } from '../models/offerModel.js';
import Settings from '../models/settingsModel.js';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';
import { prepareOrderDetails } from '../services/orderService.js';
import asyncHandler from 'express-async-handler';



export const createOrder = asyncHandler(async (req, res) => {

  const { items, shippingAddress, couponCode } = req.body;
  const userId = req.body.userId;
  const io = req.io;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'الطلب فارغ' });
  }

  const settings = await Settings.findOne();
  const feePercent = settings?.platformFee ?? 10;

  let totalPrice = 0;
  let discountAmount = 0;
  let line_items = [];
  let sellerTransfers = {};
  let groupedItems = {};

  const prepared = await prepareOrderDetails(items, feePercent);
  totalPrice = prepared.totalPrice;
  discountAmount = prepared.discountAmount;
  line_items = prepared.line_items;
  sellerTransfers = prepared.sellerTransfers;
  groupedItems = prepared.groupedItems;

  if (couponCode) {
    const offer = await Offer.findOne({ couponCode, expiresAt: { $gt: new Date() } });
    if (!offer) return res.status(400).json({ message: 'كود الخصم غير صالح أو منتهي' });

    if (offer.couponFor === 'vip' && req.user.role !== 'vip') {
      return res.status(403).json({ message: 'هذا الكوبون مخصص فقط لفئة VIP' });
    }

    discountAmount = totalPrice * (offer.discount / 100);
    totalPrice -= discountAmount;

    for (const item of items) {
      const offerProduct = offer.products.find(p => p.product.toString() === item.product);
      if (offerProduct) offerProduct.sold += item.quantity;
    }
    await offer.save();
  }

  const order = await Order.create({
    user: req.user._id,
    items, 
    totalPrice,
    discountAmount,
    couponCode,
    shippingAddress,
    status: 'pending',              
  });

  const buyer = await User.findById(userId);
  for (const sellerId of Object.keys(groupedItems)) {
    const products = groupedItems[sellerId];
    const summary = products.map(p => `${p.quantity} × ${p.product.name}`).join(', ');

    const notification = await Notification.create({
      recipient: sellerId,
      sender: userId,
      type: 'order',
      message: `${buyer.username} طلب ${summary}`,
    });

    io.to(sellerId).emit('newNotification', {
      message: notification.message,
      _id: notification._id,
      isRead: false,
      createdAt: notification.createdAt,
    });
  }

  return res.status(201).json({
    message: 'تم إنشاء الطلب بنجاح. أكمل الدفع لإنهائه.',
    orderId: order._id,
    totalPrice,
    discountAmount,
  });
});

export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'فقط التاجر يمكنه رؤية طلباته' });
    }

    const orders = await Order.find({ 'items.product': { $exists: true } })
      .populate({
        path: 'items.product',
        match: { seller: req.user._id }
      })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    const sellerOrders = orders.filter(order =>
      order.items.some(item => item.product && item.product.seller.toString() === req.user._id.toString())
    );

    res.json(sellerOrders);
  } catch (error) {
    res.status(500).json({ message: 'فشل في جلب الطلبات' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'فشل في جلب طلباتك' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });

    order.status = req.body.status || order.status;
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'فشل تحديث الحالة' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });

    if (req.user.role !== 'admin' && req.user._id.toString() !== order.user.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذا الطلب' });
    }

    await order.deleteOne();
    res.json({ message: 'تم حذف الطلب بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'فشل حذف الطلب' });
  }
};
