import Payment from '../models/paymentModel.js';
import Order from '../models/orderModel.js';
import Product from '../models/Product.js';
import Stripe from 'stripe';

import asyncHandler from 'express-async-handler';




export const createStripeSession = asyncHandler(async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { items, orderId } = req.body;

  if (!orderId) return res.status(400).json({ message: 'orderId is required' });

  const order = await Order.findById(orderId).populate({
    path: 'items.product',
    populate: { path: 'seller' },
  });

  if (!order) return res.status(404).json({ message: 'Order not found' });

  // still check if the order is pending
  if (order.status !== 'pending') {
    return res
      .status(400)
      .json({ message: 'Order already processed or not pending' });
  }

  // use the currency from the order or default to CAD
  const CURRENCY = 'cad';

  const line_items = order.items.map(({ product, quantity }) => ({
    price_data: {
      currency: CURRENCY,
      product_data: { name: product.name },
      unit_amount: Math.round(Number(product.price) * 100),
    },
    quantity,
  }));

  const metadataItems = order.items.map(({ product, quantity }) => ({
    productId: product._id.toString(),
    quantity,
  }));

  // join all transfer groups with the order group
  const transfer_group = `order_${order._id.toString()}`;

  // put all items in the metadata
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items,
    success_url: `${process.env.CLIENT_URL}/checkout/success?orderId=${order._id}`,
    cancel_url: `${process.env.CLIENT_URL}/checkout/cancel?orderId=${order._id}`,
    payment_intent_data: {
      transfer_group,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user?._id?.toString() || '',
        items: JSON.stringify(metadataItems),
      },
    },
    client_reference_id: order._id.toString(),
  });

  //still status pending to really paid
  order.checkoutSessionId = session.id;
  await order.save();

  return res.status(200).json({ url: session.url, sessionId: session.id });
});