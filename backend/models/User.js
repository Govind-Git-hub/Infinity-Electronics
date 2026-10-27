const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true, },
        phone: { type: String, required: true, trim: true, },
        street: { type: String, required: true, trim: true, },
        city: { type: String, required: true, trim: true, },
        state: { type: String, required: true, trim: true, },
        pincode: { type: String, required: true, trim: true, },
        country: { type: String, default: 'India', trim: true, },
        isDefault: { type: Boolean, default: false }
    },
    { _id: true }
);

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, },
        password: { type: String, required: true, },
        role: { type: String, enum: ['user', 'admin'], default: 'user', },
        avatar: { type: String, default: null, },
        addresses: { type: [addressSchema], default: [], },
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    },
    { timestamps: true, }
);

module.exports = mongoose.model('User', userSchema);