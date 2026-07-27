const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadImage, uploadAudio } = require('../middleware/uploadMiddleware');

router.post('/image', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier recu' });
  res.json({ url: req.file.path });
});

router.post('/audio', protect, uploadAudio.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier recu' });
  res.json({ url: req.file.path });
});

module.exports = router;
