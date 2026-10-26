
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    ImagePlus,
    LoaderCircle,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const initialForm = {
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    brand: '',
    stock: '0',
    isFeatured: false,
    specifications: [{ key: '', value: '' }],
};

const inputClass =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

const labelClass = 'text-sm font-medium text-slate-700';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState(initialForm);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const objectUrls = selectedFiles.map((file) =>
            URL.createObjectURL(file)
        );

        setPreviews(objectUrls);

        return () => {
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [selectedFiles]);

    useEffect(() => {
        let active = true;

        const loadFormData = async () => {
            setLoading(true);

            try {
                const requests = [
                    api.get('/categories'),
                    api.get('/brands'),
                ];

                if (isEdit) {
                    requests.push(api.get(`/products/${id}`));
                }

                const responses = await Promise.all(requests);

                if (!active) return;

                const categoryResponse = responses[0];
                const brandResponse = responses[1];

                setCategories(categoryResponse.data.data || []);
                setBrands(brandResponse.data.data || []);

                if (isEdit) {
                    const productResponse = responses[2];
                    const product = productResponse.data.data;

                    if (!product) {
                        toast.error('Product not found');
                        navigate('/admin/products', { replace: true });
                        return;
                    }

                    const specs = product.specifications || {};
                    const specificationRows = Object.entries(specs).map(
                        ([key, value]) => ({
                            key,
                            value: String(value ?? ''),
                        })
                    );

                    setForm({
                        name: product.name || '',
                        description: product.description || '',
                        price: String(product.price ?? ''),
                        discountPrice:
                            product.discountPrice != null
                                ? String(product.discountPrice)
                                : '',
                        category:
                            typeof product.category === 'object'
                                ? product.category?._id || ''
                                : product.category || '',
                        brand:
                            typeof product.brand === 'object'
                                ? product.brand?._id || ''
                                : product.brand || '',
                        stock: String(product.stock ?? 0),
                        isFeatured: Boolean(product.isFeatured),
                        specifications:
                            specificationRows.length > 0
                                ? specificationRows
                                : [{ key: '', value: '' }],
                    });

                    setExistingImages(product.images || []);
                }
            } catch (error) {
                if (!active) return;

                console.error('Load product form error:', error);
                toast.error(
                    error.response?.data?.message ||
                    'Unable to load form data'
                );

                if (isEdit) {
                    navigate('/admin/products', { replace: true });
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadFormData();

        return () => {
            active = false;
        };
    }, [id, isEdit, navigate]);

    const updateField = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFiles = (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = '';

        if (!files.length) return;

        const availableSlots = 5 - existingImages.length - selectedFiles.length;

        if (availableSlots <= 0) {
            toast.error('You can upload a maximum of 5 images');
            return;
        }

        const acceptedFiles = files.slice(0, availableSlots);
        const validFiles = acceptedFiles.filter((file) => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image`);
                return false;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} exceeds the 5 MB limit`);
                return false;
            }

            return true;
        });

        if (files.length > availableSlots) {
            toast.error(`Only ${availableSlots} more image(s) can be added`);
        }

        setSelectedFiles((current) => [...current, ...validFiles]);
    };

    const removeExistingImage = (index) => {
        setExistingImages((current) =>
            current.filter((_, imageIndex) => imageIndex !== index)
        );
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles((current) =>
            current.filter((_, fileIndex) => fileIndex !== index)
        );
    };

    const updateSpecification = (index, field, value) => {
        setForm((current) => ({
            ...current,
            specifications: current.specifications.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    const addSpecification = () => {
        setForm((current) => ({
            ...current,
            specifications: [
                ...current.specifications,
                { key: '', value: '' },
            ],
        }));
    };

    const removeSpecification = (index) => {
        setForm((current) => ({
            ...current,
            specifications: current.specifications.filter(
                (_, itemIndex) => itemIndex !== index
            ),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name.trim() || !form.description.trim()) {
            toast.error('Product name and description are required');
            return;
        }

        if (!form.category || !form.brand) {
            toast.error('Please select a category and brand');
            return;
        }

        if (form.price === '' || !Number.isFinite(Number(form.price)) ||
            Number(form.price) < 0) {
            toast.error('Enter a valid product price');
            return;
        }

        if (
            form.discountPrice !== '' &&
            (!Number.isFinite(Number(form.discountPrice)) ||
                Number(form.discountPrice) < 0 ||
                Number(form.discountPrice) >= Number(form.price))
        ) {
            toast.error('Discount price must be less than the regular price');
            return;
        }

        if (
            form.stock === '' ||
            !Number.isInteger(Number(form.stock)) ||
            Number(form.stock) < 0
        ) {
            toast.error('Stock must be a non-negative whole number');
            return;
        }

        const specifications = {};

        for (const item of form.specifications) {
            const key = item.key.trim();
            const value = item.value.trim();

            if (key && value) {
                if (Object.prototype.hasOwnProperty.call(specifications, key)) {
                    toast.error(`Duplicate specification: ${key}`);
                    return;
                }

                specifications[key] = value;
            } else if (key || value) {
                toast.error('Complete or remove each specification row');
                return;
            }
        }

        if (existingImages.length + selectedFiles.length > 5) {
            toast.error('A maximum of 5 images is allowed');
            return;
        }

        setSaving(true);

        try {
            const payload = new FormData();

            payload.append('name', form.name.trim());
            payload.append('description', form.description.trim());
            payload.append('price', String(Number(form.price)));
            payload.append('category', form.category);
            payload.append('brand', form.brand);
            payload.append('stock', String(Number(form.stock)));
            payload.append('isFeatured', String(form.isFeatured));
            payload.append('specifications', JSON.stringify(specifications));

            if (form.discountPrice !== '') {
                payload.append(
                    'discountPrice',
                    String(Number(form.discountPrice))
                );
            }

            if (isEdit) {
                payload.append(
                    'existingImages',
                    JSON.stringify(existingImages)
                );
            }

            selectedFiles.forEach((file) => {
                payload.append('images', file);
            });

            if (isEdit) {
                await api.put(`/products/${id}`, payload);
                toast.success('Product updated successfully');
            } else {
                await api.post('/products', payload);
                toast.success('Product created successfully');
            }

            navigate('/admin/products');
        } catch (error) {
            console.error('Save product error:', error);
            toast.error(
                error.response?.data?.message || 'Unable to save product'
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <LoaderCircle
                    size={30}
                    className="animate-spin text-indigo-600"
                />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <Link
                    to="/admin/products"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
                >
                    <ArrowLeft size={16} />
                    Back to Products
                </Link>

                <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                    {isEdit ? 'Edit Product' : 'Add Product'}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    {isEdit
                        ? 'Update the product information below.'
                        : 'Enter the details to add a new item to your store.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-base font-semibold text-slate-900">
                        Basic Information
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Name and description shown to customers.
                    </p>

                    <div className="mt-5 space-y-5">
                        <div>
                            <label className={labelClass} htmlFor="name">
                                Product Name *
                            </label>
                            <input
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={updateField}
                                className={inputClass}
                                placeholder="e.g. Sony WH-1000XM5 Headphones"
                                maxLength={150}
                                required
                            />
                        </div>

                        <div>
                            <label
                                className={labelClass}
                                htmlFor="description"
                            >
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={updateField}
                                className={`${inputClass} min-h-32 resize-y`}
                                placeholder="Describe the product and its key features..."
                                rows={5}
                                required
                            />
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-base font-semibold text-slate-900">
                        Pricing & Inventory
                    </h2>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className={labelClass} htmlFor="price">
                                Regular Price (₹) *
                            </label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={updateField}
                                className={inputClass}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <label
                                className={labelClass}
                                htmlFor="discountPrice"
                            >
                                Discount Price (₹)
                            </label>
                            <input
                                id="discountPrice"
                                name="discountPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.discountPrice}
                                onChange={updateField}
                                className={inputClass}
                                placeholder="Optional"
                            />
                        </div>

                        <div>
                            <label className={labelClass} htmlFor="stock">
                                Stock Quantity *
                            </label>
                            <input
                                id="stock"
                                name="stock"
                                type="number"
                                min="0"
                                step="1"
                                value={form.stock}
                                onChange={updateField}
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-base font-semibold text-slate-900">
                        Classification
                    </h2>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                            <label className={labelClass} htmlFor="category">
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={form.category}
                                onChange={updateField}
                                className={inputClass}
                                required
                            >
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                    <option
                                        key={category._id}
                                        value={category._id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {categories.length === 0 && (
                                <p className="mt-2 text-xs text-amber-600">
                                    Create a category before adding products.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass} htmlFor="brand">
                                Brand *
                            </label>
                            <select
                                id="brand"
                                name="brand"
                                value={form.brand}
                                onChange={updateField}
                                className={inputClass}
                                required
                            >
                                <option value="">Select brand</option>
                                {brands.map((brand) => (
                                    <option key={brand._id} value={brand._id}>
                                        {brand.name}
                                    </option>
                                ))}
                            </select>
                            {brands.length === 0 && (
                                <p className="mt-2 text-xs text-amber-600">
                                    Create a brand before adding products.
                                </p>
                            )}
                        </div>
                    </div>

                    <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                        <input
                            type="checkbox"
                            name="isFeatured"
                            checked={form.isFeatured}
                            onChange={updateField}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>
                            <span className="block text-sm font-medium text-slate-800">
                                Feature this product
                            </span>
                            <span className="mt-1 block text-sm text-slate-500">
                                Mark this item as featured in areas that support
                                featured products.
                            </span>
                        </span>
                    </label>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Product Images
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Upload up to 5 images, maximum 5 MB each.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={
                                existingImages.length + selectedFiles.length >= 5
                            }
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                        >
                            <ImagePlus size={17} />
                            Add Images
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFiles}
                            className="hidden"
                        />
                    </div>

                    {isEdit && existingImages.length > 0 && (
                        <div className="mt-5">
                            <p className="mb-3 text-sm font-medium text-slate-700">
                                Current Images
                            </p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {existingImages.map((image, index) => (
                                    <div
                                        key={`${image}-${index}`}
                                        className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                                    >
                                        <img
                                            src={image}
                                            alt={`Product ${index + 1}`}
                                            className="h-full w-full object-contain p-2"
                                        />
                                        <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-xs text-slate-600">
                                            Existing
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            aria-label={`Remove existing image ${index + 1}`}
                                            className="absolute right-2 top-2 rounded-lg bg-white p-1.5 text-red-600 shadow-sm transition hover:bg-red-50"
                                        >
                                            <Trash2 size={15} />
                                        </button>

                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {previews.length > 0 && (
                        <div className="mt-5">
                            <p className="mb-3 text-sm font-medium text-slate-700">
                                New Images
                            </p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {previews.map((preview, index) => (
                                    <div
                                        key={preview}
                                        className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                                    >
                                        <img
                                            src={preview}
                                            alt={`New product image ${index + 1}`}
                                            className="h-full w-full object-contain p-2"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSelectedFile(index)}
                                            aria-label="Remove selected image"
                                            className="absolute right-2 top-2 rounded-lg bg-white p-1.5 text-red-600 shadow-sm hover:bg-red-50"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {existingImages.length === 0 && previews.length === 0 && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-5 flex w-full flex-col items-center rounded-xl border-2 border-dashed border-slate-200 px-5 py-10 text-center transition hover:border-indigo-300 hover:bg-indigo-50/30"
                        >
                            <ImagePlus size={30} className="text-slate-400" />
                            <span className="mt-3 text-sm font-medium text-slate-700">
                                Click to select product images
                            </span>
                            <span className="mt-1 text-xs text-slate-500">
                                JPG, PNG or other image formats
                            </span>
                        </button>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Specifications
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Add details such as RAM, storage, colour or warranty.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={addSpecification}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                            <Plus size={16} />
                            Add row
                        </button>
                    </div>

                    <div className="mt-5 space-y-3">
                        {form.specifications.map((item, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[1fr_1fr_auto]"
                            >
                                <input
                                    value={item.key}
                                    onChange={(event) =>
                                        updateSpecification(
                                            index,
                                            'key',
                                            event.target.value
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="Property (e.g. RAM)"
                                    aria-label="Specification name"
                                />

                                <input
                                    value={item.value}
                                    onChange={(event) =>
                                        updateSpecification(
                                            index,
                                            'value',
                                            event.target.value
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="Value (e.g. 16 GB)"
                                    aria-label="Specification value"
                                />

                                <button
                                    type="button"
                                    onClick={() => removeSpecification(index)}
                                    aria-label="Remove specification"
                                    className="mt-1 rounded-lg p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                >
                                    <Trash2 size={17} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                    <Link
                        to="/admin/products"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving && (
                            <LoaderCircle size={17} className="animate-spin" />
                        )}
                        {saving
                            ? 'Saving...'
                            : isEdit
                                ? 'Update Product'
                                : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
