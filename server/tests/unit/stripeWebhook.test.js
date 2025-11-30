// tests/unit/stripeWebhook.test.js
import { jest } from '@jest/globals';

// Create mock objects
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

const mockProduct = {
  find: jest.fn(),
  findById: jest.fn(), // Add this for reduceProductInventory
};

const mockOrder = {
  findById: jest.fn(),
};

// Mock the modules using ES Module approach
const mockModules = async () => {
  const { processWebhook } = await import('../../routes/stripeWebhook.js');
  return { processWebhook };
};

// Mock the dependencies
jest.unstable_mockModule('stripe', () => ({
  default: jest.fn(() => mockStripe),
}));

jest.unstable_mockModule('../../models/Product.js', () => ({
  default: mockProduct,
}));

jest.unstable_mockModule('../../models/orderModel.js', () => ({
  default: mockOrder,
}));

describe('stripeWebhook.processWebhook', () => {
  let stripeInstance, ProductModel, OrderModel, processWebhook;

  beforeAll(async () => {
    // بيئة التشغيل
    process.env.STRIPE_SECRET_KEY = 'sk_test_mocked';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mocked';
    
    // Get the mocked processWebhook function
    const modules = await mockModules();
    processWebhook = modules.processWebhook;
  });

  beforeEach(() => {
    // reset mocks
    jest.clearAllMocks();
    
    // create mock instances
    stripeInstance = mockStripe;
    ProductModel = mockProduct;
    OrderModel = mockOrder;
  });

  const buildChargeEvent = ({
    chargeId = 'ch_test_123',
    paymentIntentId = 'pi_test_123',
    currency = 'cad',
    transferGroup = 'order_123',
    metadata = {
      items: JSON.stringify([
        { productId: 'prod_1', quantity: 2 },
        { productId: 'prod_2', quantity: 1 }
      ]),
      orderId: 'order_123'
    }
  } = {}) => ({
    type: 'charge.succeeded',
    data: {
      object: {
        id: chargeId,
        payment_intent: paymentIntentId,
        currency,
        transfer_group: transferGroup,
      }
    }
  });

  const buildPaymentIntent = ({
    id = 'pi_test_123',
    transfer_group = 'order_123',
    metadata = {
      items: JSON.stringify([
        { productId: 'prod_1', quantity: 2 },
        { productId: 'prod_2', quantity: 1 }
      ]),
      orderId: 'order_123'
    }
  } = {}) => ({
    id,
    transfer_group: transfer_group,
    metadata
  });

  const buildProduct = ({
    _id = 'prod_1',
    price = 10.50,
    stock = 100,
    lowStock = false,
    seller = { _id: 'seller_1', stripeAccountId: 'acct_seller1' }
  } = {}) => ({
    _id,
    price,
    stock,
    lowStock,
    seller,
    save: jest.fn().mockResolvedValue(true)
  });

  const buildOrder = ({
    _id = 'order_123',
    status = 'pending'
  } = {}) => ({
    _id,
    status,
    save: jest.fn().mockResolvedValue(true)
  });

  describe('charge.succeeded event', () => {
    test('should process charge.succeeded event successfully', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const products = [
        buildProduct({ _id: 'prod_1', price: 10.50 }),
        buildProduct({ _id: 'prod_2', price: 5.25 })
      ];
      const order = buildOrder();

      // Mock Stripe methods
      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      stripeInstance.transfers.create.mockResolvedValue({ id: 'tr_test_123' });
      
      // Mock Product and Order models
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(products)
      });
      OrderModel.findById.mockResolvedValue(order);

      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(stripeInstance.paymentIntents.retrieve).toHaveBeenCalledWith('pi_test_123');
      expect(ProductModel.find).toHaveBeenCalledWith({
        _id: { $in: ['prod_1', 'prod_2'] }
      });
      expect(stripeInstance.transfers.create).toHaveBeenCalledTimes(2);
      expect(order.status).toBe('paid');
      expect(order.save).toHaveBeenCalled();
    });

    test('should handle missing payment_intent gracefully', async () => {
      // Create event with explicitly missing payment_intent
      const event = {
        type: 'charge.succeeded',
        data: {
          object: {
            id: 'ch_test_123',
            payment_intent: undefined, // Explicitly set to undefined
            currency: 'cad',
            transfer_group: 'order_123',
          }
        }
      };

      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(result.message).toBe('No payment_intent on charge');
      expect(stripeInstance.paymentIntents.retrieve).not.toHaveBeenCalled();
    });

    test('should handle missing metadata.items gracefully', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent({ metadata: { orderId: 'order_123' } });

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);

      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(result.message).toBe('No metadata.items found, acknowledged');
      expect(ProductModel.find).not.toHaveBeenCalled();
    });

    test('should handle invalid JSON in metadata.items', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent({
        metadata: {
          items: 'invalid json',
          orderId: 'order_123'
        }
      });

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);

      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(result.message).toBe('Invalid JSON in metadata.items, acknowledged');
    });

    test('should skip products without valid seller or stripeAccountId', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const products = [
        buildProduct({ seller: null }), // No seller
        buildProduct({ seller: { _id: 'seller_2' } }) // No stripeAccountId
      ];

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(products)
      });

      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(stripeInstance.transfers.create).not.toHaveBeenCalled();
    });

    test('should create transfers with correct amounts and fees', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const products = [
        buildProduct({ _id: 'prod_1', price: 10.00 }), // 1000 cents
        buildProduct({ _id: 'prod_2', price: 5.00 })   // 500 cents
      ];

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      stripeInstance.transfers.create.mockResolvedValue({ id: 'tr_test_123' });
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(products)
      });

      await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      // First product: 1000 cents - 10% fee = 900 cents per unit * 2 quantity = 1800 cents
      expect(stripeInstance.transfers.create).toHaveBeenNthCalledWith(1, {
        amount: 1800,
        currency: 'cad',
        destination: 'acct_seller1',
        transfer_group: 'order_123',
        source_transaction: 'ch_test_123'
      }, { idempotencyKey: 'transfer:ch_test_123:prod_1' });

      // Second product: 500 cents - 10% fee = 450 cents per unit * 1 quantity = 450 cents
      expect(stripeInstance.transfers.create).toHaveBeenNthCalledWith(2, {
        amount: 450,
        currency: 'cad',
        destination: 'acct_seller1',
        transfer_group: 'order_123',
        source_transaction: 'ch_test_123'
      }, { idempotencyKey: 'transfer:ch_test_123:prod_2' });
    });

    test('should handle transfer creation errors gracefully', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const products = [buildProduct()];

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      stripeInstance.transfers.create.mockRejectedValue(new Error('Transfer failed'));
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(products)
      });

      // Should not throw error, should continue processing
      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(stripeInstance.transfers.create).toHaveBeenCalled();
    });

    test('should update order status to paid when orderId exists', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const order = buildOrder({ status: 'pending' });

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });
      OrderModel.findById.mockResolvedValue(order);

      await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(order.status).toBe('paid');
      expect(order.paymentInfo).toEqual({
        paymentIntentId: 'pi_test_123',
        chargeId: 'ch_test_123'
      });
      expect(order.save).toHaveBeenCalled();
    });

    test('should not update order if already paid', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const order = buildOrder({ status: 'paid' });

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });
      OrderModel.findById.mockResolvedValue(order);

      await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(order.status).toBe('paid');
      expect(order.save).not.toHaveBeenCalled();
    });

    test('should handle order update errors gracefully', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const order = buildOrder();

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });
      OrderModel.findById.mockResolvedValue(order);
      order.save.mockRejectedValue(new Error('Save failed'));

      // Should not throw error, should continue processing
      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
    });

    // 🔥 NEW: Test inventory reduction after successful payment
    test('should reduce product inventory after successful payment', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const products = [
        buildProduct({ _id: 'prod_1', price: 10.00, stock: 50 }),
        buildProduct({ _id: 'prod_2', price: 5.00, stock: 30 })
      ];
      const order = buildOrder();

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      stripeInstance.transfers.create.mockResolvedValue({ id: 'tr_test_123' });
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(products)
      });
      // Mock findById for reduceProductInventory function
      ProductModel.findById.mockImplementation((id) => {
        const product = products.find(p => p._id === id);
        return product;
      });
      OrderModel.findById.mockResolvedValue(order);

      await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      // Verify inventory was reduced
      expect(products[0].stock).toBe(48); // 50 - 2 quantity
      expect(products[1].stock).toBe(29); // 30 - 1 quantity
      expect(products[0].save).toHaveBeenCalled();
      expect(products[1].save).toHaveBeenCalled();
    });

    test('should handle low stock threshold correctly', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const products = [
        buildProduct({ _id: 'prod_1', price: 10.00, stock: 6, lowStock: false })
      ];
      const order = buildOrder();

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      stripeInstance.transfers.create.mockResolvedValue({ id: 'tr_test_123' });
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(products)
      });
      
      // Create a product that will be used by reduceProductInventory
      const inventoryProduct = buildProduct({ _id: 'prod_1', price: 10.00, stock: 6, lowStock: false });
      
      // Mock findById for reduceProductInventory function
      ProductModel.findById.mockImplementation((id) => {
        if (id === 'prod_1') {
          return inventoryProduct;
        }
        return null;
      });
      OrderModel.findById.mockResolvedValue(order);

      await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      // Stock: 6 - 2 = 4, which is <= 5, so lowStock should be true
      expect(inventoryProduct.stock).toBe(4);
      expect(inventoryProduct.lowStock).toBe(true);
    });

    test('should prevent stock from going below 0', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const products = [
        buildProduct({ _id: 'prod_1', price: 10.00, stock: 1 })
      ];
      const order = buildOrder();

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      stripeInstance.transfers.create.mockResolvedValue({ id: 'tr_test_123' });
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(products)
      });
      
      // Create a product that will be used by reduceProductInventory
      const inventoryProduct = buildProduct({ _id: 'prod_1', price: 10.00, stock: 1 });
      
      // Mock findById for reduceProductInventory function
      ProductModel.findById.mockImplementation((id) => {
        if (id === 'prod_1') {
          return inventoryProduct;
        }
        return null;
      });
      OrderModel.findById.mockResolvedValue(order);

      await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      // Stock: 1 - 2 = -1, but should be clamped to 0
      expect(inventoryProduct.stock).toBe(0);
    });

    test('should handle inventory update errors gracefully', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const products = [
        buildProduct({ _id: 'prod_1', price: 10.00, stock: 50 })
      ];
      const order = buildOrder();

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      stripeInstance.transfers.create.mockResolvedValue({ id: 'tr_test_123' });
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(products)
      });
      
      // Create a product that will be used by reduceProductInventory
      const inventoryProduct = buildProduct({ _id: 'prod_1', price: 10.00, stock: 50 });
      
      // Mock findById for reduceProductInventory function
      ProductModel.findById.mockImplementation((id) => {
        if (id === 'prod_1') {
          return inventoryProduct;
        }
        return null;
      });
      OrderModel.findById.mockResolvedValue(order);
      
      // Make product save fail
      inventoryProduct.save.mockRejectedValue(new Error('Database error'));

      // Should not throw error, should continue processing
      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(inventoryProduct.save).toHaveBeenCalled();
    });
  });

  describe('checkout.session.completed event', () => {
    test('should handle checkout.session.completed event with inventory reduction', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_test_123',
            client_reference_id: 'order_123',
            metadata: {
              items: JSON.stringify([
                { productId: 'prod_1', quantity: 3 },
                { productId: 'prod_2', quantity: 1 }
              ])
            }
          }
        }
      };

      const products = [
        buildProduct({ _id: 'prod_1', stock: 100 }),
        buildProduct({ _id: 'prod_2', stock: 50 })
      ];

      // Mock Product.findById for inventory reduction
      ProductModel.findById
        .mockResolvedValueOnce(products[0]) // prod_1
        .mockResolvedValueOnce(products[1]); // prod_2

      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(result.message).toBe('Checkout session processed successfully');
      
      // Verify inventory was reduced
      expect(products[0].stock).toBe(97); // 100 - 3
      expect(products[1].stock).toBe(49); // 50 - 1
      expect(products[0].save).toHaveBeenCalled();
      expect(products[1].save).toHaveBeenCalled();
    });

    test('should handle checkout.session.completed without items metadata', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_test_123',
            client_reference_id: 'order_123',
            metadata: { test: 'data' } // No items
          }
        }
      };

      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(result.message).toBe('Checkout session processed successfully');
      expect(ProductModel.findById).not.toHaveBeenCalled();
    });

    test('should handle invalid JSON in checkout session metadata.items', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_test_123',
            client_reference_id: 'order_123',
            metadata: {
              items: 'invalid json'
            }
          }
        }
      };

      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(result.message).toBe('Invalid metadata format, acknowledged');
      expect(ProductModel.findById).not.toHaveBeenCalled();
    });

    test('should handle empty items array in checkout session', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_test_123',
            client_reference_id: 'order_123',
            metadata: {
              items: JSON.stringify([]) // Empty array
            }
          }
        }
      };

      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(result.message).toBe('Checkout session processed successfully');
      expect(ProductModel.findById).not.toHaveBeenCalled();
    });

    test('should handle checkout session inventory update errors gracefully', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_test_123',
            client_reference_id: 'order_123',
            metadata: {
              items: JSON.stringify([
                { productId: 'prod_1', quantity: 1 }
              ])
            }
          }
        }
      };

      const product = buildProduct({ _id: 'prod_1', stock: 100 });
      ProductModel.findById.mockResolvedValue(product);
      product.save.mockRejectedValue(new Error('Database error'));

      // Should not throw error, should continue processing
      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(result.message).toBe('Checkout session processed successfully');
      expect(product.save).toHaveBeenCalled();
    });
  });

  describe('unknown event types', () => {
    test('should handle unknown event types', async () => {
      const event = {
        type: 'unknown.event.type',
        data: { object: {} }
      };

      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(result.message).toEqual({ received: true });
    });
  });

  describe('edge cases', () => {
    test('should handle very small amounts correctly', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const products = [
        buildProduct({ price: 0.01 }) // Very small price: 1 cent
      ];

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      stripeInstance.transfers.create.mockResolvedValue({ id: 'tr_test_123' });
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(products)
      });

      await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      // 1 cent - 10% fee = 0 cents, so seller gets 1 cent per unit
      // Quantity is 2 (from default buildChargeEvent), so total = 1 * 2 = 2 cents
      expect(stripeInstance.transfers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 2, // 1 cent per unit * 2 quantity = 2 cents
          currency: 'cad',
          destination: 'acct_seller1',
          transfer_group: 'order_123',
          source_transaction: 'ch_test_123'
        }),
        expect.any(Object)
      );
    });

    test('should use fallback transfer group when not provided', async () => {
      const event = buildChargeEvent({ transferGroup: undefined });
      const paymentIntent = buildPaymentIntent({ transfer_group: undefined });
      const products = [buildProduct()];

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      stripeInstance.transfers.create.mockResolvedValue({ id: 'tr_test_123' });
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(products)
      });

      await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      // The current implementation uses the event's transfer_group as fallback
      // which comes from the charge object, not the paymentIntent
      expect(stripeInstance.transfers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          transfer_group: 'order_123' // This comes from the event data, not paymentIntent
        }),
        expect.any(Object)
      );
    });

    test('should handle products without stock field', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const products = [
        buildProduct({ _id: 'prod_1', stock: undefined }) // No stock field
      ];
      const order = buildOrder();

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      stripeInstance.transfers.create.mockResolvedValue({ id: 'tr_test_123' });
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(products)
      });
      OrderModel.findById.mockResolvedValue(order);

      // Should not throw error, should continue processing
      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(stripeInstance.transfers.create).toHaveBeenCalled();
    });

    test('should handle products not found during inventory update', async () => {
      const event = buildChargeEvent();
      const paymentIntent = buildPaymentIntent();
      const products = [
        buildProduct({ _id: 'prod_1', stock: 100 })
      ];
      const order = buildOrder();

      stripeInstance.paymentIntents.retrieve.mockResolvedValue(paymentIntent);
      stripeInstance.transfers.create.mockResolvedValue({ id: 'tr_test_123' });
      ProductModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(products)
      });
      OrderModel.findById.mockResolvedValue(order);
      
      // Make Product.findById return null for inventory update
      ProductModel.findById.mockResolvedValue(null);

      // Should not throw error, should continue processing
      const result = await processWebhook(stripeInstance, event, ProductModel, OrderModel);

      expect(result.status).toBe(200);
      expect(stripeInstance.transfers.create).toHaveBeenCalled();
    });
  });
});
