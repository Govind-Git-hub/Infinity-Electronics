const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

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

module.exports = { getStats };