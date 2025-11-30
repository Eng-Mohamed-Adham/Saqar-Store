// tests/integration/stripeWebhook.int.test.js
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Ensure env for webhook secret
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_integration';

// Mock Socket.io provider used by app.js to avoid server import side effects
jest.unstable_mockModule('../../server.js', () => ({
  io: {
    to: jest.fn(() => ({ emit: jest.fn() })),
    emit: jest.fn(),
  },
}));

// Mock Stripe SDK for webhook signature and API calls
const mockStripe = {
  webhooks: {
    constructEvent: jest.fn(),
  },
  paymentIntents: {
    retrieve: jest.fn(),
  },
  transfers: {
    create: jest.fn(),
  },
};

jest.unstable_mockModule('stripe', () => ({
  default: jest.fn(() => mockStripe),
}));

let app;
let Product;
let Order;
let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  // Import after mocks are set
  const appModule = await import('../../app.js');
  app = appModule.app;
  const productModule = await import('../../models/Product.js');
  Product = productModule.default;
  const orderModule = await import('../../models/orderModel.js');
  Order = orderModule.default;
});

afterEach(async () => {
  jest.clearAllMocks();
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

const sendRawPost = (path, payload) => {
  const bodyBuffer = Buffer.from(JSON.stringify(payload));
  return request(app)
    .post(path)
    .set('content-type', 'application/json')
    .set('stripe-signature', 'any-signature')
    .send(bodyBuffer);
};

describe('POST /api/webhook (Stripe Webhook Integration)', () => {
  test('charge.succeeded marks order as paid and reduces inventory', async () => {
    const sellerId = new mongoose.Types.ObjectId();
    const product = await Product.create({
      name: 'Test Product',
      description: 'A product for integration testing',
      category: 'general',
      price: 10,
      stock: 50,
      seller: sellerId,
    });

    const order = await Order.create({
      _id: new mongoose.Types.ObjectId('64b000000000000000000123'),
      user: new mongoose.Types.ObjectId(),
      items: [
        { product: product._id, quantity: 2 },
      ],
      totalPrice: 20,
      status: 'pending',
    });

    // Mock Stripe webhook validation to return a charge.succeeded event
    mockStripe.webhooks.constructEvent.mockImplementation((rawBody, sig, secret) => ({
      type: 'charge.succeeded',
      data: {
        object: {
          id: 'ch_int_1',
          payment_intent: 'pi_int_1',
          currency: 'cad',
          transfer_group: order._id.toString(),
        },
      },
    }));

    // paymentIntents.retrieve to include items + orderId
    mockStripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_int_1',
      transfer_group: order._id.toString(),
      metadata: {
        items: JSON.stringify([{ productId: product._id.toString(), quantity: 2 }]),
        orderId: order._id.toString(),
      },
    });

    mockStripe.transfers.create.mockResolvedValue({ id: 'tr_1' });

    const res = await sendRawPost('/api/webhook', {});
    expect(res.status).toBe(200);

    const freshOrder = await Order.findById(order._id);
    expect(freshOrder.status).toBe('paid');
    expect(freshOrder.paymentInfo).toBeDefined();
    expect(freshOrder.paymentInfo.paymentIntentId).toBe('pi_int_1');

    const freshProduct = await Product.findById(product._id);
    expect(freshProduct.stock).toBe(48); // 50 - 2
  });

  test('checkout.session.completed reduces inventory from session metadata', async () => {
    const sellerId = new mongoose.Types.ObjectId();
    const product = await Product.create({
      name: 'Checkout Product',
      description: 'A product for checkout completion',
      category: 'general',
      price: 12,
      stock: 20,
      seller: sellerId,
    });

    mockStripe.webhooks.constructEvent.mockImplementation(() => ({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_1',
          payment_intent: 'pi_cs_1',
          client_reference_id: 'order_cs_1',
          metadata: {
            items: JSON.stringify([{ productId: product._id.toString(), quantity: 3 }]),
          },
        },
      },
    }));

    const res = await sendRawPost('/api/webhook', {});
    expect(res.status).toBe(200);

    const freshProduct = await Product.findById(product._id);
    expect(freshProduct.stock).toBe(17); // 20 - 3
  });

  test('returns 200 and message when signature verification fails', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const res = await sendRawPost('/api/webhook', { any: 'body' });
    expect(res.status).toBe(200);
    expect(String(res.text || res.body)).toContain('Webhook Error');
  });
});


