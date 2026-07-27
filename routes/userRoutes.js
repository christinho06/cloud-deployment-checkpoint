const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAllUsers);
router.route('/:id')
  .put(protect, admin, updateUserRole)
  .delete(protect, admin, deleteUser);

module.exports = router;
