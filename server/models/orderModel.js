import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        index: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true,
  },
  paymentInfo: {
    paymentIntentId: { type: String },
    chargeId: { type: String },
  },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    country: String,
    postalCode: String,
    phone: String
  },
  couponCode: String,
  discountAmount: Number,
  stripeSessionId: String,
  stripePaymentIntentId: String,
  totalAmount: Number,
  subOrders: [
    {
      seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
      products: [{ product: Object, quantity: Number }],
      amount: Number,
      status: { type: String, default: 'pending' },
      stripePaymentIntentId: String,
    },
  ],
}, {
  timestamps: true,
});


const Order = mongoose.model('Order', orderSchema);
export default Order;
