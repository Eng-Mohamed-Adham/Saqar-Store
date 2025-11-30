// cron/cleanupExpiredOffers.js
import cron from 'node-cron';
import { Offer } from '../models/offerModel.js';
import mongoose from 'mongoose';

cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const result = await Offer.deleteMany({ expiresAt: { $lte: now } });
    console.log(`[CLEANUP] Removed ${result.deletedCount} expired offers`);
  } catch (error) {
    console.error('[CLEANUP] Error removing expired offers:', error);
  }
});
