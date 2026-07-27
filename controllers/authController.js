const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, storeName } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Cet email est deja utilise');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'seller' ? 'seller' : 'buyer',
    sellerInfo: role === 'seller' ? { storeName: storeName || name, isApproved: true } : {}
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    sellerInfo: user.sellerInfo,
    token: generateToken(user._id)
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      sellerInfo: user.sellerInfo,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Email ou mot de passe incorrect');
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouve');
  }
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    sellerInfo: user.sellerInfo,
    createdAt: user.createdAt
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouve');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password) user.password = req.body.password;
  if (req.body.sellerInfo) {
    user.sellerInfo = { ...user.sellerInfo.toObject(), ...req.body.sellerInfo };
  }

  const updated = await user.save();
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    sellerInfo: updated.sellerInfo,
    token: generateToken(updated._id)
  });
});

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
