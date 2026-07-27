const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  category: {
    type: String,
    required: true,
    enum: ['instrumental', 'equipment', 'instrument']
  },
  subcategory: { type: String, default: '' },
  image: { type: String, default: '' },
  stock: { type: Number, required: true, default: 1 },
  isDigital: { type: Boolean, default: false },
  genre: { type: String, default: '' },
  bpm: { type: Number, default: null },
  musicalKey: { type: String, default: '' },
  license: {
    type: String,
    default: 'Basique',
    enum: ['Basique', 'Premium', 'Exclusif']
  },
  audioPreview: { type: String, default: '' },
  brand: { type: String, default: '' },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
