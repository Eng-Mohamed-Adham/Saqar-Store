// models/offerModel.ts
import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    discount: { type: Number, required: true }, // نسبة الخصم مثل 10 يعني 10%
    expiresAt: { type: Date, required: true },
  image: { type: String },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        initialStock: { type: Number }, // كم كان وقت إنشاء العرض
        sold: { type: Number, default: 0 }, // كم انباع من العرض

      },
    ],

    couponCode: {
      type: String, // مثل VIP2025
    },
    couponFor: {
      type: String,
      enum: ['vip', 'all'],
      default: 'all',
    },
  },
  { timestamps: true }
);

export const Offer = mongoose.model('Offer', offerSchema);
