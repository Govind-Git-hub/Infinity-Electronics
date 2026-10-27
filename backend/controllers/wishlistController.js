const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('wishlist');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Wishlist fetched successfully',
            data: user.wishlist,
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch wishlist',
        });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID',
            });
        }

        const product = await Product.findById(productId).select('_id');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { wishlist: product._id } },
            { new: true }
        ).populate('wishlist');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Product added to wishlist',
            data: user.wishlist,
        });
    } catch (error) {
        console.error('Add wishlist error:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to add product to wishlist',
        });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID',
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { wishlist: productId } },
            { new: true }
        ).populate('wishlist');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Product removed from wishlist',
            data: user.wishlist,
        });
    } catch (error) {
        console.error('Remove wishlist error:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to remove product from wishlist',
        });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};