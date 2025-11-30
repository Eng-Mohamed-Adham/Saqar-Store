// cron/cleanupUnpaidOrders.js
import cron from 'node-cron';
import Order from '../models/orderModel.js';
import mongoose from 'mongoose';

cron.schedule('*/15 * * * *', async () => {
  try {
    const now = new Date();
    const threshold = new Date(now.getTime() - 60 * 60 * 1000); // 1 ساعة مضت

    const result = await Order.deleteMany({
      status: 'pending',
      createdAt: { $lte: threshold },
    });

    console.log(`[CLEANUP] Deleted ${result.deletedCount} unpaid orders`);
  } catch (error) {
    console.error('[CLEANUP] Error deleting unpaid orders:', error);
  }
});
