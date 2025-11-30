// models/userModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'seller', 'user'],
    default: 'user',
  },
  isBanned: {
  type: Boolean,
  default: false,
},
wishlist: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
],
  phone: String,
  address: String,
  photo: String,
  stripeAccountId: String,
 
}, { timestamps: true });

// 🔐 تشفير كلمة المرور
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ مقارنة كلمات المرور
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
