// controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// 🔐 إنشاء JWT
const generateToken = (payload, secret, expiresIn = '7d') => {
  return jwt.sign(payload, secret, { expiresIn });
};

// ✅ تسجيل الدخول
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const payload = {
    id: user._id,
    UserInfo: {
      email: user.email,
      roles: user.role,
    },
  };

  const accessToken = generateToken(payload, process.env.JWT_SECRET, '15m');
  const refreshToken = generateToken(payload, process.env.JWT_REFRESH_SECRET, '7d');

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development' ? false : true, // ✅ فقط في الإنتاج
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});

// ✅ تحديث التوكن
export const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(cookies.jwt, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const accessToken = generateToken(
      {
        id: user._id,
        UserInfo: {
          email: user.email,
          roles: user.role,
        },
      },
      process.env.JWT_SECRET,
      '15m'
    );

    res.json({
      token: accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        photo: user.photo,
        stripeAccountId: user.stripeAccountId || null,
      },
    });
  } catch (err) {
    console.error('Refresh error:', err.message);
    return res.status(403).json({ message: 'Forbidden' });
  }
});

// ✅ تسجيل حساب جديد
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role, phone, address, photo } = req.body;


  if (!username || !email || !password) {
  return res.status(400).json({ message: 'All fields are required' });
}


  const userExists = await User.findOne({ email });
  if (userExists) {
return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    username,
    email,
    password,
    role,
    phone,
    address,
    photo,
  });

  res.status(201).json({
    message: 'User created successfully',
    token: generateToken({ id: user._id }, process.env.JWT_SECRET),
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      photo: user.photo,
      stripeAccountId: user.stripeAccountId || null,
    },
  });
});

// ✅ getMe
export const getMe = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message:'Unauthorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        photo: user.photo,
        stripeAccountId: user.stripeAccountId || null,
      },
    });
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
});




// ✅ تسجيل الخروج
export const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // لا يوجد كوكي

  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction, // ✅ فقط في الإنتاج
  });

  res.json({ message: 'Cookie cleared' });
};
