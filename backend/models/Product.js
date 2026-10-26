const  mongoose  = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, },
        description: { type: String, required: true, },
        price: { type: Number, required: true, min: 0, },
        discountPrice: { type: Number, min: 0, },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, },
        brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true, },
        stock: { type: Number, required: true, min: 0, default: 0, },
        images: [{ type: String, trim: true, }],
        ratings: { type: Number, default: 0, min: 0, max: 5, },
        numReviews: { type: Number, default: 0, min: 0, },
        isFeatured: { type: Boolean, default: false, },
        specifications: { type: Map, of: mongoose.Schema.Types.Mixed, default: {}, }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);