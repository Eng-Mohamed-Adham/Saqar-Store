// server/app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import { io } from './server.js';
import { logger } from './middlewares/logger.js';

dotenv.config();

export const app = express();

// ✅ Stripe Webhook
import stripeWebhook from './routes/stripeWebhook.js';
app.use('/api/webhook', stripeWebhook);

// ✅ Middlewares
app.use(cors({
  origin: 'https://saqar-store-1.onrender.com',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '2000mb' }));
app.use(logger);

// ✅ Static Files 
app.use('/uploads', express.static('./uploads'));

// ✅ Routes
app.use('/search', searchRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/offers', offerRoutes);
app.use('/orders',(req, res, next) => {
  req.io = io;
  next();
}, orderRoutes);
app.use('/sellers', sellerRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/stripe', stripeRoutes);
app.use('/contact', contactRoutes);
app.use('/dashboard', adminDashboardRoutes);
app.use('/notifications', notificationRoutes);
app.use('/payment',paymentRoutes)
// app.use('/', rootRoutes);

app.get('/', (req, res) => {
  res.send('API Running...');
});
