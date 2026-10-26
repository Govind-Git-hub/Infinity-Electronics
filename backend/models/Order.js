const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, },
        name: { type: String, required: true, trim: true, },
        image: { type: String, trim: true, },
        price: { type: Number, required: true, min: 0, },
        quantity: { type: Number, required: true, min: 1, }
    },
    { _id: true }
);

const shippingAddressSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true, },
        phone: { type: String, required: true, trim: true, },
        street: { type: String, required: true, trim: true, },
        city: { type: String, required: true, trim: true, },
        state: { type: String, required: true, trim: true, },
        pincode: { type: String, required: true, trim: true, },
        country: { type: String, default: 'India', trim: true, }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, },

        orderItems: { type: [orderItemSchema], required: true, },

        shippingAddress: { type: shippingAddressSchema, required: true, },

        paymentMethod: { type: String, default: 'Razorpay', trim: true, },
        paymentResult: { type: Object, default: {}, },
        isPaid: { type: Boolean, default: false, },
        paidAt: { type: Date, },

        itemsPrice: { type: Number, required: true, min: 0, },
        shippingPrice: { type: Number, required: true, min: 0, },
        taxPrice: { type: Number, default: 0, min: 0, },
        totalAmount: { type: Number, required: true, min: 0, },

        orderStatus: { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Processing', },

        isDelivered: { type: Boolean, default: false, },
        deliveredAt: { type: Date, }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);