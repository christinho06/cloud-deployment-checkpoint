const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.page) || 1;
  const { category, subcategory, search, sort, minPrice, maxPrice } = req.query;

  const query = { isApproved: true };
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { genre: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } }
    ];
  }

  const sortMap = {
    'newest': '-createdAt',
    'price_asc': 'price',
    'price_desc': '-price',
    'rating': '-rating'
  };
  const sortField = sortMap[sort] || '-createdAt';

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('seller', 'name sellerInfo')
    .sort(sortField)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name email sellerInfo')
    .populate('reviews.user', 'name');

  if (!product) {
    res.status(404);
    throw new Error('Produit non trouve');
  }
  res.json(product);
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isApproved: true })
    .populate('seller', 'name sellerInfo')
    .limit(8);
  res.json(products);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    seller: req.user._id,
    ...req.body,
    stock: req.body.isDigital ? 9999 : (req.body.stock || 1)
  });
  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Produit non trouve');
  }
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Non autorise');
  }
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Produit non trouve');
  }
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Non autorise');
  }
  await product.deleteOne();
  res.json({ message: 'Produit supprime' });
});

const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Produit non trouve');
  }
  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Vous avez deja note ce produit');
  }
  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => r.rating + acc, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ message: 'Avis ajoute' });
});

const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort('-createdAt');
  res.json(products);
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('seller', 'name email').sort('-createdAt');
  res.json(products);
});

const toggleProductApproval = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Produit non trouve');
  }
  product.isApproved = !product.isApproved;
  await product.save();
  res.json({ isApproved: product.isApproved });
});

module.exports = {
  getProducts, getProductById, getFeaturedProducts, createProduct,
  updateProduct, deleteProduct, addReview, getSellerProducts,
  getAllProducts, toggleProductApproval
};
