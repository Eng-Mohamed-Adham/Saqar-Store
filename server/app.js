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
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '2000mb' }));
app.use(logger);

// ✅ Static Files 
app.use('/uploads', express.static('./uploads'));

// ✅ Routes
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders',(req, res, next) => {
  req.io = io;
  next();
}, orderRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', adminDashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payment',paymentRoutes)
// app.use('/', rootRoutes);

app.get('/', (req, res) => {
  res.send('API Running...');
});
