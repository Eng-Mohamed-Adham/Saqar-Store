// tests/unit/paymentController.test.js
import { jest } from '@jest/globals';

// 👇 Mock Stripe (ESM-compatible). لا تعتمد على متغيرات خارج factory
jest.mock('stripe', () => {
  const ctor = jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));
  return { __esModule: true, default: ctor };
});

// 👇 Mock Order model وسلسلة findById(...).populate(...)
jest.mock('../../models/orderModel.js', () => {
  return {
    __esModule: true,
    default: {
      findById: jest.fn(),
    },
  };
});

// (اختياري) باقي الموديلات غير مستخدمة مباشرة هنا، فلا حاجة لموكها
// jest.mock('../../models/Product.js', () => ({ __esModule: true, default: {} }));
// jest.mock('../../models/paymentModel.js', () => ({ __esModule: true, default: {} }));

import Stripe from 'stripe';
import Order from '../../models/orderModel.js';
import { createStripeSession } from '../../controllers/paymentController.js';

describe('paymentController.createStripeSession', () => {
  let req, res, next;

  beforeAll(() => {
    // بيئة التشغيل
    process.env.STRIPE_SECRET_KEY = 'sk_test_mocked';
    process.env.CLIENT_URL = 'https://client.example.com';
  });

  beforeEach(() => {
    // reset req/res/next
    req = {
      body: {},
      user: { _id: 'user_1' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // reset mocks
    jest.clearAllMocks();
  });

  const mockPopulateToResolve = (orderDoc) => {
    // findById يرجّع Object فيه populate() بيرجّع Promise
    Order.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(orderDoc),
    });
  };

  const buildOrderDoc = ({
    _id = 'order_123',
    status = 'pending',
    items = [
      {
        product: {
          _id: 'prod_1',
          name: 'Item 1',
          price: 10.5,
          seller: { _id: 'seller_1' },
        },
        quantity: 2,
      },
      {
        product: {
          _id: 'prod_2',
          name: 'Item 2',
          price: 3.2,
          seller: { _id: 'seller_2' },
        },
        quantity: 1,
      },
    ],
  } = {}) => {
    return {
      _id,
      status,
      items,
      checkoutSessionId: undefined,
      save: jest.fn().mockResolvedValue(true),
    };
  };

  test('should return 400 if orderId is missing', async () => {
    req.body = {}; // لا يوجد orderId

    await createStripeSession(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'orderId is required' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 404 if order not found', async () => {
    req.body = { orderId: 'order_x' };
    mockPopulateToResolve(null); // لا يوجد طلب

    await createStripeSession(req, res, next);

    expect(Order.findById).toHaveBeenCalledWith('order_x');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 400 if order status is not pending', async () => {
    req.body = { orderId: 'order_y' };
    const orderDoc = buildOrderDoc({ status: 'paid' });
    mockPopulateToResolve(orderDoc);

    await createStripeSession(req, res, next);

    expect(Order.findById).toHaveBeenCalledWith('order_y');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Order already processed or not pending',
    });
    expect(next).not.toHaveBeenCalled();
  });

test('should create a Stripe session, save checkoutSessionId, and return url + sessionId', async () => {
  req.body = { orderId: 'order_ok' };
  const orderDoc = buildOrderDoc();
  mockPopulateToResolve(orderDoc);

  // 👇 جهّز الموك للإنستانس القادم
  const createSpy = jest.fn().mockResolvedValue({
    id: 'cs_test_123',
    url: 'https://stripe.test/session/cs_test_123',
  });
  Stripe.mockImplementation(() => ({
    checkout: { sessions: { create: createSpy } },
  }));

  await createStripeSession(req, res, next);

  // تحقق من الاستدعاء ومن البارامز
  expect(createSpy).toHaveBeenCalledTimes(1);
  const callArgs = createSpy.mock.calls[0][0];
  expect(callArgs.mode).toBe('payment');
  expect(callArgs.payment_method_types).toEqual(['card']);
  expect(callArgs.line_items).toHaveLength(orderDoc.items.length);
  expect(callArgs.payment_intent_data.transfer_group).toBe(`order_${orderDoc._id}`);
  expect(callArgs.success_url).toBe(`${process.env.CLIENT_URL}/checkout/success?orderId=${orderDoc._id}`);
  expect(callArgs.cancel_url).toBe(`${process.env.CLIENT_URL}/checkout/cancel?orderId=${orderDoc._id}`);

  // حفظ الطلب والرد
  expect(orderDoc.checkoutSessionId).toBe('cs_test_123');
  expect(orderDoc.save).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    url: 'https://stripe.test/session/cs_test_123',
    sessionId: 'cs_test_123',
  });
  expect(next).not.toHaveBeenCalled();
});

 test('should call next(err) when Stripe throws (asyncHandler passes error)', async () => {
  req.body = { orderId: 'order_err' };
  const orderDoc = buildOrderDoc();
  mockPopulateToResolve(orderDoc);

  const err = new Error('Stripe failed');
  const createSpy = jest.fn().mockRejectedValue(err);
  Stripe.mockImplementation(() => ({
    checkout: { sessions: { create: createSpy } },
  }));

  await createStripeSession(req, res, next);

  expect(createSpy).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(err);
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
})
 });