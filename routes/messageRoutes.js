const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const {
  startConversation, getMyConversations,
  getMessages, sendMessage, getUnreadCount
} = require('../controllers/messageController');

router.post('/start', protect, startConversation);
router.get('/', protect, getMyConversations);
router.get('/unread', protect, getUnreadCount);

// Liste des vendeurs + admin contactables
router.get('/sellers', protect, async (req, res) => {
  const sellers = await User.find({
    role: { $in: ['seller', 'admin'] },
    _id: { $ne: req.user._id }
  }).select('name role sellerInfo').limit(50);
  res.json(sellers);
});

router.get('/:id', protect, getMessages);
router.post('/:id', protect, sendMessage);

module.exports = router;
