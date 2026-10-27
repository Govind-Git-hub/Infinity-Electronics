const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');

// Recalculate product rating and review count
const updateProductRatings = async (productId) => {
    const [result] = await Review.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId)
            }
        },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    await Product.findByIdAndUpdate(productId, {
        ratings: result ? Math.round(result.averageRating * 10) / 10 : 0,
        numReviews: result ? result.totalReviews : 0
    });
};

// GET /api/reviews/product/:productId
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID',
                data: null
            });
        }

        const productExists = await Product.exists({ _id: productId });

        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                data: null
            });
        }

        const reviews = await Review.find({ product: productId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Reviews fetched successfully',
            data: reviews
        });
    } catch (error) {
        console.error('Get Product Reviews Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

// POST /api/reviews
const createReview = async (req, res) => {
    try {
        const { productId, rating, comment = '' } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid product ID is required',
                data: null
            });
        }

        if (
            rating === undefined ||
            rating === null ||
            rating === '' ||
            !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be a whole number from 1 to 5',
                data: null
            });
        }

        if (typeof comment !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Comment must be a string',
                data: null
            });
        }

        if (comment.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Comment cannot exceed 1000 characters',
                data: null
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                data: null
            });
        }

        const review = await Review.create({
            user: req.user._id,
            product: productId,
            rating: Number(rating),
            comment: comment.trim()
        });

        await updateProductRatings(productId);

        const createdReview = await Review.findById(review._id)
            .populate('user', 'name avatar');

        return res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: createdReview
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'You have already reviewed this product',
                data: null
            });
        }

        console.error('Create Review Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID',
                data: null
            });
        }

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
                data: null
            });
        }

        const isOwner = review.user.toString() === req.user._id.toString();

        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You are not allowed to delete this review',
                data: null
            });
        }

        const productId = review.product;

        await review.deleteOne();
        await updateProductRatings(productId);

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
            data: null
        });
    } catch (error) {
        console.error('Delete Review Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

module.exports = {
    getProductReviews,
    createReview,
    deleteReview
};