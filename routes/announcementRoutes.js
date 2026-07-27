const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getAnnouncements, getMyAnnouncements, createAnnouncement,
  updateAnnouncement, deleteAnnouncement,
  getAllAnnouncements, approveAnnouncement, adminDeleteAnnouncement,
} = require('../controllers/announcementController');

// Public
router.get('/', getAnnouncements);

// Vendeur (authentifié)
router.get('/my', protect, getMyAnnouncements);
router.post('/', protect, createAnnouncement);
router.put('/:id', protect, updateAnnouncement);
router.delete('/:id', protect, deleteAnnouncement);

// Admin uniquement
router.get('/admin/all', protect, admin, getAllAnnouncements);
router.put('/admin/:id/approve', protect, admin, approveAnnouncement);
router.delete('/admin/:id', protect, admin, adminDeleteAnnouncement);

module.exports = router;
