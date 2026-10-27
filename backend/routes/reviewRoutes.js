const express = require('express');

const {
    getProductReviews,
    createReview,
    deleteReview
} = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;