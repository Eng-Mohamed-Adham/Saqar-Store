import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
},
}, {
  timestamps: true
});

const Card = mongoose.model('Card', cardSchema);

export default Card;
