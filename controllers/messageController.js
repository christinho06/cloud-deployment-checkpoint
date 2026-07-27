const asyncHandler = require('express-async-handler');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Démarrer ou récupérer une conversation avec un vendeur (optionnel: à propos d'un produit)
const startConversation = asyncHandler(async (req, res) => {
  const { sellerId, productId } = req.body;
  const buyerId = req.user._id;

  if (sellerId === buyerId.toString()) {
    res.status(400);
    throw new Error('Vous ne pouvez pas vous envoyer un message');
  }

  // Chercher une conversation existante entre ces deux utilisateurs sur ce produit
  let conversation = await Conversation.findOne({
    participants: { $all: [buyerId, sellerId] },
    ...(productId ? { product: productId } : {})
  }).populate('participants', 'name role sellerInfo')
    .populate('product', 'name image');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [buyerId, sellerId],
      product: productId || null
    });
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name role sellerInfo')
      .populate('product', 'name image');
  }

  res.json(conversation);
});

// Récupérer toutes les conversations de l'utilisateur connecté
const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name role sellerInfo')
    .populate('product', 'name image')
    .sort('-lastMessageAt');

  res.json(conversations);
});

// Récupérer les messages d'une conversation
const getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation non trouvee');
  }
  if (!conversation.participants.map(p => p.toString()).includes(req.user._id.toString())) {
    res.status(403);
    throw new Error('Non autorise');
  }

  // Marquer les messages comme lus
  await Message.updateMany(
    { conversation: req.params.id, sender: { $ne: req.user._id }, read: false },
    { read: true }
  );
  // Retirer l'utilisateur de unreadBy
  await Conversation.findByIdAndUpdate(req.params.id, {
    $pull: { unreadBy: req.user._id }
  });

  const messages = await Message.find({ conversation: req.params.id })
    .populate('sender', 'name role')
    .sort('createdAt');

  res.json(messages);
});

// Envoyer un message
const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    res.status(400);
    throw new Error('Message vide');
  }

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation non trouvee');
  }
  if (!conversation.participants.map(p => p.toString()).includes(req.user._id.toString())) {
    res.status(403);
    throw new Error('Non autorise');
  }

  const message = await Message.create({
    conversation: req.params.id,
    sender: req.user._id,
    content: content.trim()
  });

  // Mettre à jour la conversation
  const otherParticipants = conversation.participants.filter(
    p => p.toString() !== req.user._id.toString()
  );
  await Conversation.findByIdAndUpdate(req.params.id, {
    lastMessage: content.trim(),
    lastMessageAt: new Date(),
    $addToSet: { unreadBy: { $each: otherParticipants } }
  });

  const populated = await message.populate('sender', 'name role');
  res.status(201).json(populated);
});

// Nombre de conversations avec messages non lus
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Conversation.countDocuments({
    participants: req.user._id,
    unreadBy: req.user._id
  });
  res.json({ count });
});

module.exports = { startConversation, getMyConversations, getMessages, sendMessage, getUnreadCount };
