import request from 'supertest';
import mongoose from 'mongoose';
import {app} from '../../app.js';
import Product from '../../models/Product.js';
import User from '../../models/userModel.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


beforeEach(async () => {
  await Product.deleteMany();
  await User.deleteMany();
});



describe('Product Controller - createProduct', () => {
  

  const createAndLogin = async (userData) => {
    const user = await User.create(userData);
    const res = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    return res.body.accessToken;
  };

  it('should return 403 if user is not a seller', async () => {
    const token = await createAndLogin({
      username: 'NormalUser',
      email: 'user@example.com',
      password: '123456',
      role: 'user',
    });

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Product',
        price: 10,
        category: 'Electronics',
        description: 'Test Description',
        stock: 100,
        image: 'https://example.com/image.jpg',
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(undefined);
  });

  it('should return 403 if seller is banned', async () => {
    const token = await createAndLogin({
      username: 'BannedSeller',
      email: 'banned@example.com',
      password: '123456',
      role: 'seller',
      isBanned: true,
      stripeAccountId: 'acct_test',
    });

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Product',
        price: 100,
        category: 'Books',
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('You are banned from adding products');
  });

  it('should return 400 if seller has no Stripe account', async () => {
    const token = await createAndLogin({
      username: 'NoStripeSeller',
      email: 'nostripe@example.com',
      password: '123456',
      role: 'seller',
      isBanned: false,
    });

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Product',
        price: 50,
        category: 'Clothing',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Please connect your Stripe account first');
  });

  it('should return 400 if required fields are missing', async () => {
    const token = await createAndLogin({
      username: 'Seller',
      email: 'seller@example.com',
      password: '123456',
      role: 'seller',
      stripeAccountId: 'acct_valid',
      isBanned: false,
    });

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Missing Fields Product',
        // price and category are missing
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Missing required fields');
  });

 

 
});
