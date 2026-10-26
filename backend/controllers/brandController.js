const Brand = require('../models/Brand');
const Product = require('../models/Product');
const slugify = require('slugify');
const {
    createCloudinaryImage,
    deleteCloudinaryImage
} = require('../utils/cloudinaryImage');

const parseBoolean = (value) =>
    value === true || value === 'true' || value === '1';

const getBrands = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const skip = (page - 1) * limit;
        const filter = {};

        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true';
        }

        if (req.query.search?.trim()) {
            const search = req.query.search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            );

            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        const [brands, totalBrands] = await Promise.all([
            Brand.find(filter)
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Brand.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalBrands / limit);

        res.status(200).json({
            success: true,
            message: 'Brands fetched successfully',
            data: brands,
            pagination: {
                currentPage: page,
                limit,
                totalBrands,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Get Brands Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

const getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found',
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: 'Brand fetched successfully',
            data: brand
        });
    } catch (error) {
        console.error('Get Brand Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

const createBrand = async (req, res) => {
    let uploadedLogo = null;

    try {
        const name = req.body.name?.trim();
        const slug = req.body.slug?.trim();
        const isActive = req.body.isActive === undefined
            ? true
            : parseBoolean(req.body.isActive);

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Brand name is required',
                data: null
            });
        }

        const existingBrand = await Brand.findOne({
            name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
        });

        if (existingBrand) {
            return res.status(400).json({
                success: false,
                message: 'Brand name already exists',
                data: null
            });
        }

        const brandSlug = slugify(slug || name, {
            lower: true,
            strict: true,
            trim: true
        });

        if (!brandSlug) {
            return res.status(400).json({
                success: false,
                message: 'A valid brand slug is required',
                data: null
            });
        }

        const existingSlug = await Brand.findOne({ slug: brandSlug });

        if (existingSlug) {
            return res.status(400).json({
                success: false,
                message: 'Brand slug already exists',
                data: null
            });
        }

        if (req.file) {
            uploadedLogo = await createCloudinaryImage(
                req.file.buffer,
                'brands'
            );
        }

        const brand = await Brand.create({
            name,
            slug: brandSlug,
            logo: uploadedLogo,
            isActive
        });

        return res.status(201).json({
            success: true,
            message: 'Brand created successfully',
            data: brand
        });
    } catch (error) {
        // Clean up a logo if the database operation failed.
        if (uploadedLogo) {
            try {
                await deleteCloudinaryImage(uploadedLogo);
            } catch (cleanupError) {
                console.error('Uploaded logo cleanup failed:', cleanupError.message);
            }
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Brand name or slug already exists',
                data: null
            });
        }

        console.error('Create Brand Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};


const updateBrand = async (req, res) => {
    let uploadedLogo = null;

    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found',
                data: null
            });
        }

        const name = req.body.name?.trim();
        const slug = req.body.slug?.trim();

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Brand name is required',
                data: null
            });
        }

        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const existingName = await Brand.findOne({
            name: { $regex: `^${escapedName}$`, $options: 'i' },
            _id: { $ne: brand._id }
        });

        if (existingName) {
            return res.status(400).json({
                success: false,
                message: 'Brand name already exists',
                data: null
            });
        }

        const brandSlug = slugify(slug || name, {
            lower: true,
            strict: true,
            trim: true
        });

        if (!brandSlug) {
            return res.status(400).json({
                success: false,
                message: 'A valid brand slug is required',
                data: null
            });
        }

        const existingSlug = await Brand.findOne({
            slug: brandSlug,
            _id: { $ne: brand._id }
        });

        if (existingSlug) {
            return res.status(400).json({
                success: false,
                message: 'Brand slug already exists',
                data: null
            });
        }

        brand.name = name;
        brand.slug = brandSlug;

        if (req.body.isActive !== undefined) {
            brand.isActive = parseBoolean(req.body.isActive);
        }

        const oldLogo = brand.logo;
        const shouldRemoveLogo =
            !req.file && req.body.removeLogo === 'true';

        // A newly uploaded logo takes precedence over removal.
        if (req.file) {
            uploadedLogo = await createCloudinaryImage(
                req.file.buffer,
                'brands'
            );

            brand.logo = uploadedLogo;
        } else if (shouldRemoveLogo) {
            brand.logo = null;
        }

        let updatedBrand;

        try {
            updatedBrand = await brand.save();
        } catch (saveError) {
            // If saving fails, clean up the new upload.
            // Do not delete the existing logo.
            if (uploadedLogo) {
                try {
                    await deleteCloudinaryImage(uploadedLogo);
                } catch (cleanupError) {
                    console.error(
                        'New brand logo cleanup failed:',
                        cleanupError.message
                    );
                }

                uploadedLogo = null;
            }

            throw saveError;
        }

        // Delete the old logo only after the database save succeeds.
        if (oldLogo && (req.file || shouldRemoveLogo)) {
            try {
                await deleteCloudinaryImage(oldLogo);
            } catch (cloudinaryError) {
                console.error(
                    'Old brand logo deletion failed:',
                    cloudinaryError.message
                );
            }
        }

        const message = req.file
            ? 'Brand logo updated successfully'
            : shouldRemoveLogo
                ? 'Brand logo removed successfully'
                : 'Brand updated successfully';

        return res.status(200).json({
            success: true,
            message,
            data: updatedBrand
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Brand name or slug already exists',
                data: null
            });
        }

        console.error('Update Brand Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

const deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found',
                data: null
            });
        }

        const productsUsingBrand = await Product.exists({
            brand: brand._id
        });

        if (productsUsingBrand) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete brand because products are using it',
                data: null
            });
        }

        const brandLogo = brand.logo;

        await brand.deleteOne();

        if (brandLogo) {
            try {
                await deleteCloudinaryImage(brandLogo);
            } catch (cloudinaryError) {
                console.error(
                    'Brand logo deletion failed:',
                    cloudinaryError.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Brand deleted successfully',
            data: null
        });
    } catch (error) {
        console.error('Delete Brand Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

module.exports = {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};