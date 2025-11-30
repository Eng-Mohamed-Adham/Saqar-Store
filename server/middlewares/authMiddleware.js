import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';

export const protect = async (req, res, next) => {
  let token;

  // ✅ أولاً: التحقق من الهيدر Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // ✅ ثانيًا: أو من الكوكي
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // ❌ إذا لم يوجد توكن بأي شكل
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    next();
  } catch (err) {
    console.error('❌ JWT Error:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};



export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Unauthorized, please login first');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('you do not have permission to perform this action');
    }

    next();
  };
};
