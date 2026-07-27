const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort('-createdAt');
  res.json(users);
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouve');
  }
  if (req.body.role) user.role = req.body.role;
  if (req.body.sellerApproved !== undefined) {
    user.sellerInfo.isApproved = req.body.sellerApproved;
  }
  const updated = await user.save();
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    sellerInfo: updated.sellerInfo
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouve');
  }
  await user.deleteOne();
  res.json({ message: 'Utilisateur supprime' });
});

module.exports = { getAllUsers, updateUserRole, deleteUser };
