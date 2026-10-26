
const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Order = require('../models/Order');

const getRazorpay = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error('Razorpay API keys are not configured.');
    }

    return {
        client: new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        }),
        keyId,
        keySecret
    };
};

const canAccessOrder = (order, user) => {
    const ownerId = order.user?._id || order.user;

    return (
        user.role === 'admin' ||
        ownerId.toString() === user._id.toString()
    );
};

// POST /api/payment/create-order
const createPaymentOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID.'
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        if (!canAccessOrder(order, req.user)) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to pay for this order.'
            });
        }

        if (order.isPaid) {
            return res.status(400).json({
                success: false,
                message: 'This order has already been paid.'
            });
        }

        if (order.orderStatus === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cancelled orders cannot be paid.'
            });
        }
        console.log('totalAmount (₹):', order.totalAmount);
        console.log('amount (paise):', Math.round(order.totalAmount * 100));

        const { client, keyId } = getRazorpay();

        // Reuse the pending Razorpay order if one was already created.
        let razorpayOrderId = order.paymentResult?.razorpayOrderId;

        if (!razorpayOrderId) {
            const amount = Math.round(order.totalAmount * 100);
            console.log('amount Send to Razorpay:', amount);

            if (!Number.isSafeInteger(amount) || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid order amount.'
                });
            }

            const razorpayOrder = await client.orders.create({
                amount,
                currency: 'INR',
                receipt: order?._id?.toString(),
                notes: {
                    mongoOrderId: order?._id?.toString()
                }
            });

            razorpayOrderId = razorpayOrder.id;

            order.paymentResult = {
                ...(order.paymentResult?.toObject?.() ||
                    order.paymentResult ||
                    {}),
                razorpayOrderId
            };

            await order.save();
        }

        return res.status(200).json({
            success: true,
            data: {
                key: keyId,
                razorpayOrderId,
                amount: Math.round(order.totalAmount * 100),
                currency: 'INR',
                orderId: order._id.toString()
            }
        });
    } catch (error) {
        console.error('Create Razorpay order error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to initialize payment.'
        });
    }
};

// POST /api/payment/verify
const verifyPayment = async (req, res) => {
    try {
        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(orderId) ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid payment verification details.'
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        if (!canAccessOrder(order, req.user)) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to verify this order.'
            });
        }

        if (order.isPaid) {
            return res.status(200).json({
                success: true,
                message: 'Order is already paid.',
                data: order
            });
        }

        if (order.orderStatus === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cancelled orders cannot be paid.'
            });
        }

        const savedRazorpayOrderId =
            order.paymentResult?.razorpayOrderId;

        if (
            !savedRazorpayOrderId ||
            savedRazorpayOrderId !== razorpay_order_id
        ) {
            return res.status(400).json({
                success: false,
                message: 'Payment order does not match this order.'
            });
        }

        const { keySecret } = getRazorpay();

        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        const expectedBuffer = Buffer.from(expectedSignature, 'hex');
        const receivedBuffer = Buffer.from(razorpay_signature, 'hex');

        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Payment signature verification failed.'
            });
        }

        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
            ...(order.paymentResult?.toObject?.() ||
                order.paymentResult ||
                {}),
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        };

        await order.save();

        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully.',
            data: order
        });
    } catch (error) {
        console.error('Verify Razorpay payment error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to verify payment.'
        });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment
};
