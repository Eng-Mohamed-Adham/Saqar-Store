import User from '../models/userModel.js';  
import Stripe from 'stripe';
import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Order from '../models/orderModel.js';


export const createExpressAccount = asyncHandler( async (req, res) => {
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

  
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'CA',
      email: req.user.email, 
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });


    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'user is Not Defind' });
    }

    user.stripeAccountId = account.id;
    await user.save();

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:5173/reauth',
      return_url: `http://localhost:5173/success?accountId=${account.id}`,
      type: 'account_onboarding',
    });


    res.status(200).json({ url: accountLink.url });


})




export const createMultiSellerOrder = asyncHandler( async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

  const { cartItems } = req.body  
  const userId = req.user.id

  const groupedBySeller = {}

  for (let item of cartItems) {
    const product = await Product.findById(item.productId).populate('seller')


     if (!product) {
        // التيست يطلب 500 عند عدم العثور على المنتج
        return res.status(500).json({ message: 'Product not found' });
      }

  const sellerId = product.seller?._id?.toString?.() || product.seller?.toString?.();
       if (!sellerId) {
        // حماية إضافية
        return res.status(500).json({ message: 'Product has no seller' });
      }

    if (!groupedBySeller[sellerId]) groupedBySeller[sellerId] = []
    groupedBySeller[sellerId].push({ product, quantity: item.quantity })
  }

  let line_items = []
  let subOrders = []

  for (let sellerId in groupedBySeller) {
    const sellerProducts = groupedBySeller[sellerId]
    let sellerTotal = 0

    for (let { product, quantity } of sellerProducts) {
      sellerTotal += product.price * quantity
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: product.name },
          unit_amount: product.price * 100,
        },
        quantity,
      })
    }

    subOrders.push({
      seller: sellerId,
      products: sellerProducts.map(p => ({ product: p.product, quantity: p.quantity })),
      amount: sellerTotal,
    })
  }
  try{
      const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items,
    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
    metadata: {
      userId,
    },
  })
    const order = await Order.create({
    user: userId,
    subOrders,
    totalAmount: line_items.reduce((sum, li) => sum + li.price_data.unit_amount * li.quantity / 100, 0),
  })

    res.json({ url: session.url })


  }catch (stripeErr) {
  return res.status(500).json({ message: stripeErr.message || 'Stripe error' });
}



})

export const connectStripe = asyncHandler( async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Just Seller Can Join Stripe Account' });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      email: req.user.email,
    });

    req.user.stripeAccountId = account.id;
    await req.user.save();

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.CLIENT_URL}/stripe/refresh`,
      return_url: `${process.env.CLIENT_URL}/stripe/success`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });

})
