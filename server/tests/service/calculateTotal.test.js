
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { prepareOrderDetails } from '../../../services/orderService.js';
import Product from '../../../models/Product.js';
import User from '../../../models/User.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const seller = await User.create({
    username: 'Test Seller',
    email: 'seller@example.com',
    role: 'seller',
    stripeAccountId: 'acct_test_123',
  });

  await Product.create({
    name: 'Test Product',
    price: 100,
    stock: 10,
    seller: seller._id,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('prepareOrderDetails', () => {
  it('should calculate total price and generate line_items correctly', async () => {
    const product = await Product.findOne({ name: 'Test Product' });

    const items = [
      {
        product: product._id.toString(),
        quantity: 2,
      },
    ];

    const result = await prepareOrderDetails(items, 10);

    expect(result.totalPrice).toBe(200);
    expect(result.discountAmount).toBe(0);
    expect(result.line_items.length).toBe(1);
    expect(result.line_items[0].price_data.unit_amount).toBe(10000);
    expect(Object.keys(result.sellerTransfers).length).toBe(1);
    expect(Object.keys(result.groupedItems).length).toBe(1);
  });

  it('should throw if product not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const items = [{ product: fakeId.toString(), quantity: 1 }];
    await expect(prepareOrderDetails(items, 10)).rejects.toThrow(/Product not found/);
  });

  it('should throw if requested quantity exceeds stock', async () => {
    const product = await Product.findOne({ name: 'Test Product' });
    const items = [{ product: product._id.toString(), quantity: 999 }];
    await expect(prepareOrderDetails(items, 10)).rejects.toThrow(/Requested quantity not available/);
  });
});
