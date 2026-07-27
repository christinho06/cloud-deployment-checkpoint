const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('Aucun article dans la commande');
  }

  const itemsPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const hasPhysical = items.some(item => !item.isDigital);
  const shippingPrice = hasPhysical && itemsPrice < 50 ? 5.99 : 0;
  const totalPrice = Number((itemsPrice + shippingPrice).toFixed(2));

  const order = await Order.create({
    buyer: req.user._id,
    items,
    shippingAddress,
    paymentMethod: paymentMethod || 'Carte bancaire',
    itemsPrice: Number(itemsPrice.toFixed(2)),
    shippingPrice,
    totalPrice
  });

  for (const item of items) {
    if (!item.isDigital) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
  }

  res.status(201).json(order);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate('items.product', 'name image')
    .sort('-createdAt');
  res.json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'name email')
    .populate('items.product', 'name image');

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvee');
  }
  if (order.buyer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Non autorise');
  }
  res.json(order);
});

const payOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvee');
  }
  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'processing';
  const updated = await order.save();
  res.json(updated);
});

const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 'items.seller': req.user._id })
    .populate('buyer', 'name email')
    .sort('-createdAt');
  res.json(orders);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('buyer', 'name email').sort('-createdAt');
  res.json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvee');
  }
  order.status = req.body.status;
  if (req.body.status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }
  const updated = await order.save();
  res.json(updated);
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvee');
  }
  if (order.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorise');
  }
  if (!['pending', 'processing'].includes(order.status)) {
    res.status(400);
    throw new Error('Cette commande ne peut plus etre annulee (deja expediee ou livree)');
  }
  for (const item of order.items) {
    if (!item.isDigital && item.product) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }
  order.status = 'cancelled';
  const updated = await order.save();
  res.json(updated);
});

module.exports = {
  createOrder, getMyOrders, getOrderById, payOrder,
  getSellerOrders, getAllOrders, updateOrderStatus, cancelOrder
};
