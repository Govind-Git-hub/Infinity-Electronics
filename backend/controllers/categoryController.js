const Category = require('../models/Category');
const Product = require('../models/Product');
const slugify = require('slugify');
const { createCloudinaryImage, deleteCloudinaryImage } = require('../utils/cloudinaryImage');


const getCategories = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );
        const skip = (page - 1) * limit;
        const search = req.query.search?.trim() || '';

        const filter = {};

        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true';
        }

        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            filter.$or = [
                { name: { $regex: escapedSearch, $options: 'i' } },
                { slug: { $regex: escapedSearch, $options: 'i' } },
                { description: { $regex: escapedSearch, $options: 'i' } }
            ];
        }

        const [categories, totalCategories] = await Promise.all([
            Category.find(filter)
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Category.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalCategories / limit);

        return res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            data: categories,
            pagination: {
                currentPage: page,
                limit,
                totalCategories,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Get Categories Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};


const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found', data: null });
        }

        res.status(200).json({ success: true, message: 'Category fetched successfully', data: category });
    } catch (error) {
        console.error('Get Category Error:', error);
        res.status(500).json({ success: false, message: 'Server error', data: null });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, slug, description, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required', data: null });
        }

        const existingCategory = await Category.findOne({ name: name.trim() });

        if (existingCategory) {
            return res.status(400).json({ success: false, message: 'Category already exists', data: null });
        }

        const categoryName = name.trim();

        const categorySlug = slug?.trim()
            ? slugify(slug, { lower: true, strict: true, trim: true })
            : slugify(categoryName, { lower: true, strict: true, trim: true });

        const existingSlug = await Category.findOne({ slug: categorySlug });

        if (existingSlug) {
            return res.status(400).json({ success: false, message: 'Category slug already exists', data: null });
        }

        let imageUrl = null;

        if (req.file) {
            imageUrl = await createCloudinaryImage(
                req.file.buffer,
                'categories'
            );
        }

        const parseBoolean = (value) => value === true || value === 'true' || value === '1';
        const category = await Category.create({
            name: categoryName,
            slug: categorySlug,
            description,
            image: imageUrl,
            isActive: isActive === undefined ? true : parseBoolean(isActive)
        });

        res.status(201).json({ success: true, message: 'Category created successfully', data: category });
    } catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ success: false, message: 'Server error', data: null });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { name, slug, description, isActive } = req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found', data: null });
        }

        if (name !== undefined) {
            const trimmedName = name.trim();
            if (!trimmedName) {
                return res.status(400).json({ success: false, message: 'Category name is required', data: null });
            }

            const existingCategory = await Category.findOne({
                name: trimmedName,
                _id: { $ne: category._id }
            });

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name already exists',
                    data: null
                });
            }

            category.name = trimmedName;
        }

        if (slug !== undefined || name !== undefined) {
            const slugSource =
                typeof slug === 'string' && slug.trim()
                    ? slug
                    : category.name;

            const categorySlug = slugify(slugSource, {
                lower: true,
                strict: true,
                trim: true
            });

            if (!categorySlug) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid category slug',
                    data: null
                });
            }

            const existingSlug = await Category.findOne({
                slug: categorySlug,
                _id: { $ne: category._id }
            });

            if (existingSlug) {
                return res.status(400).json({
                    success: false,
                    message: 'Category slug already exists',
                    data: null
                });
            }

            category.slug = categorySlug;
        }

        if (description !== undefined) category.description = description;
        const parseBoolean = (value) => value === true || value === 'true' || value === '1';
        if (isActive !== undefined) category.isActive = parseBoolean(isActive);

        const oldImage = category.image;
        let newImageUrl = null;
        const shouldRemoveImage = !req.file && parseBoolean(req.body.removeImage);

        if (req?.file) {
            newImageUrl = await createCloudinaryImage(
                req.file.buffer,
                'categories'
            );

            category.image = newImageUrl;
        } else if (shouldRemoveImage) {
            category.image = null;
        }

        const updatedCategory = await category.save();

        if (oldImage && (newImageUrl || shouldRemoveImage) && oldImage !== category.image) {
            try {
                await deleteCloudinaryImage(oldImage);
            } catch (cloudinaryError) {
                console.error(
                    'Old category image deletion failed:',
                    cloudinaryError.message
                );
            }
        }

        res.status(200).json({ success: true, message: 'Category updated successfully', data: updatedCategory });
    } catch (error) {
        console.error('Update Category Error:', error);
        res.status(500).json({ success: false, message: 'Server error', data: null });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found', data: null });
        }

        const productsUsingCategory = await Product.exists({ category: category._id });

        if (productsUsingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category because products are using it',
                data: null
            });
        }

        const categoryImage = category.image;

        await category.deleteOne();

        if (categoryImage) {
            try {
                await deleteCloudinaryImage(categoryImage);
            } catch (cloudinaryError) {
                console.error(
                    'Category image deletion failed:',
                    cloudinaryError.message
                );
            }
        }
        res.status(200).json({ success: true, message: 'Category deleted successfully', data: null });
    } catch (error) {
        console.error('Delete Category Error:', error);
        res.status(500).json({ success: false, message: 'Server error', data: null });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};