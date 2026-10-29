const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Review = require('../models/Review');


const getAdminReviews = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const { search, product, rating, sort = 'createdAt', order = 'desc' } = req.query;

        const filter = {};

        if (product) {
            if (!mongoose.Types.ObjectId.isValid(product)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID',
                    data: null
                });
            }

            filter.product = product;
        }

        if (rating !== undefined && rating !== '') {
            const ratingValue = Number(rating);

            if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be an integer from 1 to 5',
                    data: null
                });
            }

            filter.rating = ratingValue;
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

            const [users, products] = await Promise.all([
                User.find({ $or: [{ name: regex }, { email: regex }] }).distinct('_id'),
                Product.find({ name: regex }).distinct('_id')
            ]);

            filter.$or = [
                { comment: regex },
                { user: { $in: users } },
                { product: { $in: products } }
            ];
        }

        const allowedSortFields = ['createdAt', 'rating', 'updatedAt'];
        const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';
        const sortOrder = order === 'asc' ? 1 : -1;

        const [reviews, totalReviews] = await Promise.all([
            Review.find(filter)
                .populate('user', 'name email')
                .populate('product', 'name images')
                .sort({ [sortField]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Review.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            message: 'Reviews fetched successfully',
            data: reviews,
            pagination: {
                currentPage: page,
                limit,
                totalReviews,
                totalPages: Math.ceil(totalReviews / limit)
            }
        });
    } catch (error) {
        console.error('Get Admin Reviews Error:', error);
        return res.status(500).json({ success: false, message: 'Server error', data: null });
    }
};

const getStats = async (req, res) => {
    try {
        const [
            totalProducts,
            totalOrders,
            totalCustomers,
            revenueResult,
            statusCounts,
            recentOrders
        ] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments({ role: 'user' }),

            Order.aggregate([
                { $match: { orderStatus: 'Delivered' } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalAmount' }
                    }
                }
            ]),

            Order.aggregate([
                {
                    $group: {
                        _id: '$orderStatus',
                        count: { $sum: 1 }
                    }
                }
            ]),

            Order.find()
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .limit(5)
                .select('user totalAmount orderStatus isPaid createdAt')
                .lean()
        ]);

        const ordersByStatus = {
            Processing: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0
        };

        statusCounts.forEach(({ _id, count }) => {
            if (Object.hasOwn(ordersByStatus, _id)) {
                ordersByStatus[_id] = count;
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                totalProducts,
                totalOrders,
                totalCustomers,
                totalRevenue: revenueResult[0]?.total || 0,
                ordersByStatus,
                recentOrders
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics.'
        });
    }
};

module.exports = { getStats, getAdminReviews };