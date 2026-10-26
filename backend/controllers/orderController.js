const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order items are required',
                data: null
            });
        }

        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address is required',
                data: null
            });
        }

        for (const item of orderItems) {
            if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID',
                    data: null
                });
            }

            if (!item.quantity || item.quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Product quantity must be at least 1',
                    data: null
                });
            }
        }

        const productIds = orderItems.map(item => item.product);

        const products = await Product.find({
            _id: { $in: productIds }
        });

        if (products.length !== productIds.length) {
            return res.status(404).json({
                success: false,
                message: 'One or more products not found',
                data: null
            });
        }

        let itemsPrice = 0;
        const finalOrderItems = [];

        for (const item of orderItems) {
            const product = products.find(
                product => product._id.toString() === item.product.toString()
            );

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`,
                    data: null
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`,
                    data: null
                });
            }

            const productPrice = product.discountPrice || product.price;
            const itemTotal = productPrice * item.quantity;

            itemsPrice += itemTotal;

            finalOrderItems.push({
                product: product._id,
                name: product.name,
                image: product.images?.[0] || null,
                price: productPrice,
                quantity: item.quantity
            });
        }

        const shippingPrice = 50;
        const taxPrice = 0;
        const totalAmount = itemsPrice + shippingPrice + taxPrice;

        const order = await Order.create({
            user: req.user._id,
            orderItems: finalOrderItems,
            shippingAddress: {
                fullName: shippingAddress.fullName,
                phone: shippingAddress.phone,
                street: shippingAddress.street,
                city: shippingAddress.city,
                state: shippingAddress.state,
                pincode: shippingAddress.pincode,
                country: shippingAddress.country || 'India'
            },
            paymentMethod: paymentMethod || 'Razorpay',
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalAmount
        });

        // Reduce product stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: -item.quantity
                    }
                }
            );
        }

        const createdOrder = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images price discountPrice');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: createdOrder
        });
    } catch (error) {
        console.error('Create Order Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id
        })
            .populate('orderItems.product', 'name images price discountPrice')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            data: orders
        });
    } catch (error) {
        console.error('Get My Orders Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
        const skip = (page - 1) * limit;
        const filter = {};

        const allowedStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (req.query.status) {
            if (!allowedStatuses.includes(req.query.status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid order status filter',
                    data: null
                });
            }
            filter.orderStatus = req.query.status;
        }

        const search = String(req.query.search || '').trim();
        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const matchingUsers = await User.find({
                $or: [
                    { name: { $regex: escapedSearch, $options: 'i' } },
                    { email: { $regex: escapedSearch, $options: 'i' } }
                ]
            }).select('_id').lean();

            const userIds = matchingUsers.map(user => user._id);
            const possibleObjectId = mongoose.Types.ObjectId.isValid(search) ? search : null;
            const searchConditions = [
                { 'shippingAddress.fullName': { $regex: escapedSearch, $options: 'i' } },
                { user: { $in: userIds } }
            ];

            if (possibleObjectId) {
                searchConditions.push({ _id: possibleObjectId });
            }

            filter.$or = searchConditions;
        }

        const [orders, totalOrders] = await Promise.all([
            Order.find(filter)
                .populate('user', 'name email')
                .populate('orderItems.product', 'name images price discountPrice')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalOrders / limit);

        return res.status(200).json({
            success: true,
            message: 'All orders fetched successfully',
            data: orders,
            pagination: {
                currentPage: page,
                limit,
                totalOrders,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Get All Orders Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID',
                data: null
            });
        }

        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images price discountPrice');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
                data: null
            });
        }

        const isAdmin = req.user.role === 'admin';
        const isOwner = order.user._id.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this order',
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order fetched successfully',
            data: order
        });
    } catch (error) {
        console.error('Get Order Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID',
                data: null
            });
        }

        const { status } = req.body;
        const allowedTransitions = {
            Processing: ['Shipped', 'Cancelled'],
            Shipped: ['Delivered', 'Cancelled'],
            Delivered: [],
            Cancelled: []
        };

        if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status',
                data: null
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
                data: null
            });
        }

        if (status === order.orderStatus) {
            return res.status(200).json({
                success: true,
                message: 'Order status is unchanged',
                data: await Order.findById(order._id)
                    .populate('user', 'name email')
                    .populate('orderItems.product', 'name images price discountPrice')
            });
        }

        if (!allowedTransitions[order.orderStatus]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change order status from ${order.orderStatus} to ${status}`,
                data: null
            });
        }

        // Persist the terminal/status transition first. Only restore stock on
        // the first transition to Cancelled; Cancelled orders cannot transition out.
        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date();
        } else {
            order.isDelivered = false;
            order.deliveredAt = null;
        }

        order.orderStatus = status;
        await order.save();

        if (status === 'Cancelled') {
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images price discountPrice');

        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: populatedOrder
        });
    } catch (error) {
        console.error('Update Order Status Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus
};