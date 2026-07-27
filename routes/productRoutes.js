const express = require('express');
const router = express.Router();
const {
  getProducts, getProductById, getFeaturedProducts,
  createProduct, updateProduct, deleteProduct,
  addReview, getSellerProducts, getAllProducts, toggleProductApproval
} = require('../controllers/productController');
const { protect, seller, admin } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/seller/myproducts', protect, seller, getSellerProducts);
router.get('/admin/all', protect, admin, getAllProducts);
router.post('/', protect, seller, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

router.post('/:id/reviews', protect, addReview);
router.patch('/:id/approve', protect, admin, toggleProductApproval);

module.exports = router;
