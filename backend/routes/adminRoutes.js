const express = require('express');
const router = express.Router();

const { getStats, getAdminReviews } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);
router.get('/reviews', protect, admin, getAdminReviews);

module.exports = router;