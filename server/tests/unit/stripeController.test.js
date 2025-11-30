import { createExpressAccount,createMultiSellerOrder } from '../../controllers/stripeController.js';
import User from '../../models/userModel.js';
import Stripe from 'stripe';

jest.mock('../../models/Product.js');
jest.mock('../../models/orderModel.js');
import Order from '../../models/orderModel.js';
import Product from '../../models/Product.js';

jest.mock('../../models/userModel.js');

jest.mock('stripe');


beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mockedKey';
});


describe('Stripe Controller - createExpressAccount', () => {
  let req, res, mockStripeInstance;

  beforeEach(() => {
    req = {
      user: {
        _id: 'user123',
        email: 'test@example.com',
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Stripe mock
    mockStripeInstance = {
      accounts: {
        create: jest.fn().mockResolvedValue({ id: 'acct_test123' })
      },
      accountLinks: {
        create: jest.fn().mockResolvedValue({ url: 'https://stripe.com/onboarding/test-link' })
      }
    };

    Stripe.mockImplementation(() => mockStripeInstance);
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  });

  it('should create a Stripe account and return onboarding URL', async () => {
    const mockUser = {
      stripeAccountId: null,
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(mockUser);

    await createExpressAccount(req, res);

    expect(mockStripeInstance.accounts.create).toHaveBeenCalledWith(expect.objectContaining({
      type: 'express',
      email: 'test@example.com',
    }));

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(mockUser.stripeAccountId).toBe('acct_test123');
    expect(mockUser.save).toHaveBeenCalled();

    expect(mockStripeInstance.accountLinks.create).toHaveBeenCalledWith(expect.objectContaining({
      account: 'acct_test123',
      type: 'account_onboarding',
    }));

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ url: 'https://stripe.com/onboarding/test-link' });
  });

  it('should return 404 if user not found', async () => {
    User.findById.mockResolvedValue(null);

    await createExpressAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'user is Not Defind' });
  });

 
});


describe('createMultiSellerOrder', () => {
  let req, res, stripeMockInstance;

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.CLIENT_URL = 'https://mocked-client.com';

    req = {
      body: {
        cartItems: [
          { productId: 'prod1', quantity: 2 },
          { productId: 'prod2', quantity: 1 },
        ]
      },
      user: {
        id: 'user123'
      }
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    // Stripe Mock
    stripeMockInstance = {
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({ url: 'https://mocked.stripe.session' })
        }
      }
    };

    Stripe.mockImplementation(() => stripeMockInstance);
  });

  it('should create a Stripe session and return url', async () => {
    // ✅ Mock products
    const seller1 = { _id: 'seller1' };
    const product1 = {
      _id: 'prod1',
      name: 'Product 1',
      price: 100,
      seller: seller1
    };
    const product2 = {
      _id: 'prod2',
      name: 'Product 2',
      price: 50,
      seller: seller1
    };

    // Mock populate chain
    Product.findById.mockImplementation((id) => ({
      populate: jest.fn().mockResolvedValue(id === 'prod1' ? product1 : product2)
    }));

    Order.create.mockResolvedValue({ _id: 'order123' });

    await createMultiSellerOrder(req, res);

    expect(stripeMockInstance.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
      line_items: expect.any(Array),
      success_url: expect.stringContaining('success'),
      cancel_url: expect.stringContaining('cancel'),
      metadata: { userId: 'user123' }
    }));

    expect(Order.create).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ url: 'https://mocked.stripe.session' });
  });

it('should return 500 if a product is not found', async () => {
  Product.findById.mockImplementation(() => ({
    populate: jest.fn().mockResolvedValue(null)
  }));

  await createMultiSellerOrder(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
    message:'Product not found'
  }));
});


  it('should return 500 on Stripe error', async () => {
    const seller = { _id: 'seller1' };
    const product = {
      _id: 'prod1',
      name: 'Product 1',
      price: 100,
      seller
    };

    Product.findById.mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(product)
    }));

    stripeMockInstance.checkout.sessions.create.mockRejectedValue(new Error('Stripe failed'));

    await createMultiSellerOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
  });
});