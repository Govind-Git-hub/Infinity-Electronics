const mongoose = require('mongoose');
const Product = require('../models/Product');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const cloudinary = require('../config/cloudinary');

const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 15,
            search,
            category,
            brand,
            sort = 'createdAt',
            order = 'desc',
            isFeatured
        } = req.query;

        const currentPage = Math.max(parseInt(page, 10) || 1, 1);
        const perPage = Math.min(Math.max(parseInt(limit, 10) || 15, 1), 100);
        const skip = (currentPage - 1) * perPage;

        const filter = {};

        if (search && search.trim()) {
            filter.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID',
                    data: null
                });
            }

            filter.category = category;
        }

        if (brand) {
            if (!mongoose.Types.ObjectId.isValid(brand)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid brand ID',
                    data: null
                });
            }

            filter.brand = brand;
        }

        if (isFeatured !== undefined) {
            if (isFeatured !== 'true' && isFeatured !== 'false') {
                return res.status(400).json({
                    success: false,
                    message: 'isFeatured must be true or false',
                    data: null
                });
            }

            filter.isFeatured = isFeatured === 'true';
        }

        const allowedSortFields = [
            'name',
            'price',
            'discountPrice',
            'ratings',
            'numReviews',
            'stock',
            'createdAt',
            'updatedAt'
        ];  

        const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';
        const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;

        const [products, totalProducts] = await Promise.all([
            Product.find(filter)
                .populate('category', 'name slug')
                .populate('brand', 'name slug logo')
                .sort({ [sortField]: sortOrder, _id: sortOrder })
                .skip(skip)
                .limit(perPage),

            Product.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalProducts / perPage);

        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: products,
            pagination: {
                currentPage,
                limit: perPage,
                totalProducts,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1
            }
        });
    } catch (error) {
        console.error('Get Products Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

const getProductById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID',
                data: null
            });
        }

        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug')
            .populate('brand', 'name slug logo');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product fetched successfully',
            data: product
        });
    } catch (error) {
        console.error('Get Product Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            category,
            brand,
            stock,
            ratings,
            numReviews,
            isFeatured,
            specifications
        } = req.body;

        if (!name || !description || price === undefined || !category || !brand) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, price, category and brand are required',
                data: null
            });
        }

        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID',
                data: null
            });
        }

        if (!mongoose.Types.ObjectId.isValid(brand)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid brand ID',
                data: null
            });
        }

        let imageUrls = [];

        if (req.files?.length > 0) {

            imageUrls = await Promise.all(
                req.files.map(async (file) => {
                    const imageUrl = await uploadToCloudinary(
                        file.buffer,
                        'products'
                    );

                    return imageUrl;
                })
            );
        }

        // return imageUrls;
        let parsedSpecifications = {};

        if (specifications) {
            try {
                parsedSpecifications = typeof specifications === 'string'
                    ? JSON.parse(specifications)
                    : specifications;

                if (
                    !parsedSpecifications ||
                    typeof parsedSpecifications !== 'object' ||
                    Array.isArray(parsedSpecifications)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: 'Specifications must be a valid object',
                        data: null
                    });
                }
            } catch (error) {
                console.error('Create Product Error:', error);

                return res.status(400).json({
                    success: false,
                    message: 'Invalid specifications JSON',
                    data: null
                });
            }
        }
        const featured = isFeatured === true || isFeatured === 'true' || isFeatured === '1';
        const numericPrice = Number(price);
        const numericStock = stock === undefined || stock === '' ? 0 : Number(stock);
        const numericRatings = ratings === undefined || ratings === '' ? 0 : Number(ratings);
        const numericNumReviews = numReviews === undefined || numReviews === '' ? 0 : Number(numReviews);
        const numericDiscountPrice =
            discountPrice === undefined || discountPrice === ''
                ? undefined
                : Number(discountPrice);

        if (
            !Number.isFinite(numericPrice) ||
            numericPrice < 0 ||
            !Number.isFinite(numericStock) ||
            numericStock < 0 ||
            !Number.isInteger(numericStock) ||
            !Number.isFinite(numericRatings) ||
            numericRatings < 0 ||
            numericRatings > 5 ||
            !Number.isInteger(numericNumReviews) ||
            numericNumReviews < 0 ||
            (numericDiscountPrice !== undefined &&
                (!Number.isFinite(numericDiscountPrice) ||
                    numericDiscountPrice < 0))
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid numeric product values',
                data: null
            });
        }
        const product = await Product.create({
            name: name.trim(),
            description: description.trim(),
            price: numericPrice,
            discountPrice: numericDiscountPrice,
            category,
            brand,
            stock: numericStock,
            images: imageUrls,
            ratings: numericRatings,
            numReviews: numericNumReviews,
            isFeatured: featured,
            specifications: parsedSpecifications
        });

        const createdProduct = await Product.findById(product._id)
            .populate('category', 'name slug')
            .populate('brand', 'name slug logo');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: createdProduct
        });
    } catch (error) {
        console.error('Create Product Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

const getCloudinaryPublicId = (imageUrl) => {
    try {
        const url = new URL(imageUrl);

        if (url.hostname !== 'res.cloudinary.com') {
            return null;
        }

        const pathParts = url.pathname
            .split('/')
            .filter(Boolean);

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

        if (pathParts[0] !== cloudName) {
            return null;
        }

        const uploadIndex = pathParts.indexOf('upload');

        if (uploadIndex === -1) {
            return null;
        }

        let publicIdParts = pathParts.slice(uploadIndex + 1);

        // Remove Cloudinary version, for example v1750000000.
        if (/^v\d+$/.test(publicIdParts[0] || '')) {
            publicIdParts = publicIdParts.slice(1);
        }

        // Only allow images uploaded to our products folder.
        if (publicIdParts[0] !== 'products') {
            return null;
        }

        const lastIndex = publicIdParts.length - 1;

        publicIdParts[lastIndex] = publicIdParts[lastIndex]
            .replace(/\.[^.]+$/, '');

        return publicIdParts.length > 1
            ? publicIdParts.join('/')
            : null;
    } catch (error) {
        return null;
    }
};

const updateProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID',
                data: null
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                data: null
            });
        }

        const {
            name,
            description,
            price,
            discountPrice,
            category,
            brand,
            stock,
            ratings,
            numReviews,
            isFeatured,
            specifications,
            existingImages
        } = req.body;
        const parseNumber = (value) => {
            if (value === '' || value === null) return null;
            const number = Number(value);
            return Number.isFinite(number) ? number : null;
        };

        const numericFields = {
            price: price !== undefined ? parseNumber(price) : product.price,
            stock: stock !== undefined ? parseNumber(stock) : product.stock,
            ratings: ratings !== undefined ? parseNumber(ratings) : product.ratings,
            numReviews: numReviews !== undefined ? parseNumber(numReviews) : product.numReviews,
            discountPrice:
                discountPrice !== undefined && discountPrice !== ''
                    ? parseNumber(discountPrice)
                    : undefined
        };

        if (
            numericFields.price === null ||
            numericFields.price < 0 ||
            numericFields.stock === null ||
            numericFields.stock < 0 ||
            !Number.isInteger(numericFields.stock) ||
            numericFields.ratings === null ||
            numericFields.ratings < 0 ||
            numericFields.ratings > 5 ||
            numericFields.numReviews === null ||
            numericFields.numReviews < 0 ||
            !Number.isInteger(numericFields.numReviews) ||
            (
                discountPrice !== undefined &&
                discountPrice !== '' &&
                (
                    numericFields.discountPrice === null ||
                    numericFields.discountPrice < 0
                )
            )
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid numeric product values',
                data: null
            });
        }

        product.price = numericFields.price;
        product.stock = numericFields.stock;
        product.ratings = numericFields.ratings;
        product.numReviews = numericFields.numReviews;

        if (discountPrice !== undefined) {
            product.discountPrice =
                discountPrice === '' ? undefined : numericFields.discountPrice;
        }

        if (name !== undefined) product.name = name.trim();
        if (description !== undefined) product.description = description.trim();

        if (category !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID',
                    data: null
                });
            }

            product.category = category;
        }

        if (brand !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(brand)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid brand ID',
                    data: null
                });
            }

            product.brand = brand;
        }

        if (isFeatured !== undefined) {
            product.isFeatured = isFeatured === true || isFeatured === 'true' || isFeatured === '1';
        }
        if (specifications !== undefined) {
            let parsedSpecifications;

            try {
                parsedSpecifications =
                    typeof specifications === 'string'
                        ? JSON.parse(specifications)
                        : specifications;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid specifications JSON',
                    data: null
                });
            }

            if (
                !parsedSpecifications ||
                typeof parsedSpecifications !== 'object' ||
                Array.isArray(parsedSpecifications)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Specifications must be a valid object',
                    data: null
                });
            }

            product.specifications = parsedSpecifications;
        }

        const oldImages = [...(product?.images || [])];

        let retainedImages = [...oldImages];

        if (existingImages !== undefined) {
            try {
                retainedImages = JSON.parse(existingImages);

                if (
                    !Array.isArray(retainedImages) ||
                    !retainedImages.every(
                        (image) =>
                            typeof image === 'string' &&
                            image.startsWith('https://')
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid existing images',
                        data: null
                    });
                }
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid existing images JSON',
                    data: null
                });
            }
        }

        if (req.files && req.files.length > 0) {
            const uploadedImages = await Promise.all(
                req.files.map((file) =>
                    uploadToCloudinary(file.buffer, 'products')
                )
            );

            retainedImages = [...retainedImages, ...uploadedImages];
        }

        if (retainedImages.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'A maximum of 5 images is allowed',
                data: null
            });
        }

        product.images = retainedImages;


        const updatedProduct = await product.save();

        // Find images removed from this product.
        const removedImages = oldImages.filter(
            (image) => !retainedImages.includes(image)
        );

        // Delete removed images from Cloudinary after the DB save succeeds.
        for (const imageUrl of removedImages) {
            const publicId = getCloudinaryPublicId(imageUrl);

            if (!publicId) {
                console.warn('Skipped invalid Cloudinary image URL:', imageUrl);
                continue;
            }

            try {
                const result = await cloudinary.uploader.destroy(publicId, {
                    resource_type: 'image',
                    invalidate: true
                });

                if (result.result !== 'ok' && result.result !== 'not found') {
                    console.error(
                        `Cloudinary deletion was not confirmed for ${publicId}:`,
                        result
                    );
                }
            } catch (cloudinaryError) {
                // The product is already saved. Do not report the update as failed.
                console.error(
                    `Cloudinary deletion failed for ${publicId}:`,
                    cloudinaryError.message
                );
            }
        }

        const populatedProduct = await Product.findById(updatedProduct._id)
            .populate('category', 'name slug')
            .populate('brand', 'name slug logo');

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: populatedProduct
        });
    } catch (error) {
        console.error('Update Product Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID',
                data: null
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                data: null
            });
        }

        // Save image URLs before deleting the product.
        const productImages = product.images || [];

        // Delete the product from the database first.
        await product.deleteOne();

        // Delete product images from Cloudinary.
        for (const imageUrl of productImages) {
            const publicId = getCloudinaryPublicId(imageUrl);

            if (!publicId) {
                console.warn(
                    'Skipped invalid Cloudinary image URL:',
                    imageUrl
                );
                continue;
            }

            try {
                const result = await cloudinary.uploader.destroy(publicId, {
                    resource_type: 'image',
                    invalidate: true
                });

                if (
                    result.result !== 'ok' &&
                    result.result !== 'not found'
                ) {
                    console.error(
                        `Cloudinary deletion was not confirmed for ${publicId}:`,
                        result
                    );
                }
            } catch (cloudinaryError) {
                console.error(
                    `Cloudinary deletion failed for ${publicId}:`,
                    cloudinaryError.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: null
        });
    } catch (error) {
        console.error('Delete Product Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};