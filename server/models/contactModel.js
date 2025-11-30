import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // إذا لم يكن مسجل
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isResolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }

});

export const Contact = mongoose.model('Contact', contactSchema);