// tests/auth/authController.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../app.js';
import User from '../../models/userModel.js';
import jwt from 'jsonwebtoken';

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
  await User.deleteMany();
});

describe('Auth Controller - Login', () => {
  it('should return 400 if email or password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  it('should return 401 if user does not exist', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: '123456',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should return 401 if password is incorrect', async () => {
    await User.create({
      username: 'TestUser',
      email: 'test@example.com',
      password: 'correctpass',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpass',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should return 200 and set cookie if credentials are correct', async () => {
    await User.create({
      username: 'TestUser',
      email: 'test@example.com',
      password: '123456',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: '123456',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined();
  });
});

describe('Auth Controller - Register', () => {
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'NewUser',
      email: '', // missing
      password: '', // missing
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  it('should return 400 if email already exists', async () => {
    await User.create({
      username: 'Existing',
      email: 'existing@example.com',
      password: '123456',
    });

    const res = await request(app).post('/api/auth/register').send({
      username: 'NewUser',
      email: 'existing@example.com',
      password: '123456',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  it('should create user and return token and cookie', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'TestUser',
      email: 'new@example.com',
      password: '123456',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');

    const user = await User.findOne({ email: 'new@example.com' });
    expect(user).not.toBeNull();
    expect(user.username).toBe('TestUser');
    expect(user.password).not.toBe('123456'); // hashed
  });
});

describe('Auth Controller - getMe', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Unauthorized');
  });

  it('should return 401 if token is invalid', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid token');
  });

  it('should return 404 if user not found', async () => {
    // Generate a token for a non-existing user
    const token = jwt.sign({ id: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should return user data if token is valid', async () => {
    const user = await User.create({
      username: 'TestUser',
      email: 'test@example.com',
      password: '123456',
      role: 'user',
      phone: '123456789',
      address: 'Test Address',
      photo: 'photo.png',
      stripeAccountId: null,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token', token);
    expect(res.body.user).toMatchObject({
      id: user._id.toString(),
      username: 'TestUser',
      email: 'test@example.com',
      role: 'user',
      phone: '123456789',
      address: 'Test Address',
      photo: 'photo.png',
      stripeAccountId: null,
    });
  });
});




describe('Auth Controller - Logout', () => {
  it('should return 204 if no jwt cookie is present', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(204);
  });

  it('should clear jwt cookie and return message', async () => {
    const token = jwt.sign({ id: 'dummyId' }, process.env.JWT_SECRET, { expiresIn: '15m' });

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [`jwt=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Cookie cleared' });

    // تأكد أن الكوكي تم مسحه فعلاً
    const setCookieHeader = res.headers['set-cookie'][0];
    expect(setCookieHeader).toContain('jwt='); // تم إرجاع كوكي بنفس الاسم
    expect(setCookieHeader).toContain('Expires='); // يجب أن يحتوي على تاريخ انتهاء
  });
});

describe('Auth Controller - Refresh', () => {
  it('should return 401 if no jwt cookie is present', async () => {
    const res = await request(app).get('/api/auth/refresh');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('No refresh token provided');
  });

  it('should return 403 if jwt is invalid or expired', async () => {
    const res = await request(app)
      .get('/api/auth/refresh')
      .set('Cookie', [`jwt=invalidtoken`]);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Forbidden');
  });

  it('should return 404 if user not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: fakeId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '1h',
    });

    const res = await request(app)
      .get('/api/auth/refresh')
      .set('Cookie', [`jwt=${token}`]);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should return new access token and user info if valid', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'user',
      phone: '+123456789',
      address: 'Test Address',
      photo: 'http://example.com/photo.jpg',
      stripeAccountId: 'acct_123456',
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '1h',
    });

    const res = await request(app)
      .get('/api/auth/refresh')
      .set('Cookie', [`jwt=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      photo: user.photo,
      stripeAccountId: user.stripeAccountId,
    });
  });
});