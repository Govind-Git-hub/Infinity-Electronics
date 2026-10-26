
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    ImagePlus,
    LoaderCircle,
    Save,
    X,
    FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const createSlug = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

const CategoryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        isActive: true
    });

    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [removeImage, setRemoveImage] = useState(false);

    useEffect(() => {
        if (!isEditing) return;

        const fetchCategory = async () => {
            try {
                setLoading(true);
                setError('');

                const { data } = await api.get(`/categories/${id}`);

                if (!data.success || !data.data) {
                    throw new Error(data.message || 'Category not found');
                }

                const category = data.data;

                setForm({
                    name: category.name || '',
                    slug: category.slug || '',
                    description: category.description || '',
                    isActive: Boolean(category.isActive)
                });

                setImagePreview(category.image || '');
            } catch (error) {
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to load category';

                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [id, isEditing]);

    const handleNameChange = (event) => {
        const name = event.target.value;

        setForm((previous) => ({
            ...previous,
            name,
            slug: slugManuallyEdited
                ? previous.slug
                : createSlug(name)
        }));
    };

    const handleSlugChange = (event) => {
        const slug = event.target.value;

        setSlugManuallyEdited(true);

        setForm((previous) => ({
            ...previous,
            slug
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            event.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be 5 MB or less');
            event.target.value = '';
            return;
        }

        setRemoveImage(false);
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const removeSelectedImage = () => {
        setImage(null);
        setImagePreview('');
        setRemoveImage(isEditing);

        const fileInput = document.getElementById('category-image');

        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        if (!form.slug.trim()) {
            toast.error('Category slug is required');
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();

            formData.append('name', form.name.trim());
            formData.append('slug', form.slug.trim());
            formData.append('description', form.description.trim());
            formData.append('isActive', String(form.isActive));

            if (image) {
                formData.append('image', image);
            }
            formData.append('removeImage', String(removeImage));

            const { data } = isEditing
                ? await api.put(`/categories/${id}`, formData)
                : await api.post('/categories', formData);

            if (!data.success) {
                throw new Error(
                    data.message || 'Failed to save category'
                );
            }

            toast.success(
                data.message ||
                `Category ${isEditing ? 'updated' : 'created'} successfully`
            );

            navigate('/admin/categories');
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Failed to save category'
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center gap-3">
                <LoaderCircle
                    size={28}
                    className="animate-spin text-indigo-600"
                />
                <span className="text-sm text-gray-500">
                    Loading category...
                </span>
            </div>
        );
    }

    if (error && isEditing && !form.name) {
        return (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
                <p className="font-semibold text-gray-900">
                    Could not load category
                </p>
                <p className="mt-2 text-sm text-red-600">{error}</p>

                <button
                    type="button"
                    onClick={() => navigate('/admin/categories')}
                    className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    Back to Categories
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3">
                <button
                    type="button"
                    onClick={() => navigate('/admin/categories')}
                    className="mt-1 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 transition hover:bg-gray-50 hover:text-indigo-600"
                    aria-label="Back to categories"
                >
                    <ArrowLeft size={19} />
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Category' : 'Add Category'}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {isEditing
                            ? 'Update the category details and image.'
                            : 'Create a category to organize your products.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic information */}
                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="rounded-xl bg-indigo-50 p-2.5">
                            <FolderOpen
                                size={20}
                                className="text-indigo-600"
                            />
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Category Information
                            </h2>
                            <p className="text-sm text-gray-500">
                                Enter the category details below.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="category-name"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Category Name
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <input
                                id="category-name"
                                type="text"
                                value={form.name}
                                onChange={handleNameChange}
                                placeholder="e.g. Smartphones"
                                required
                                maxLength={100}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label
                                htmlFor="category-slug"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Slug
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <input
                                id="category-slug"
                                type="text"
                                value={form.slug}
                                onChange={handleSlugChange}
                                placeholder="e.g. smartphones"
                                required
                                maxLength={150}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />

                            <p className="mt-2 text-xs text-gray-500">
                                Used in URLs. You can edit the generated slug.
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <label
                                htmlFor="category-description"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Description
                            </label>

                            <textarea
                                id="category-description"
                                value={form.description}
                                onChange={(event) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        description: event.target.value
                                    }))
                                }
                                placeholder="Describe this category..."
                                rows={4}
                                maxLength={1000}
                                className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </div>
                </section>

                {/* Image upload */}
                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5">
                        <h2 className="font-semibold text-gray-900">
                            Category Image
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Upload an image to represent this category. This
                            field is optional.
                        </p>
                    </div>

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50">
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Category preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <ImagePlus size={30} />
                                    <span className="text-xs">
                                        No image
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-start gap-3">
                            <label
                                htmlFor="category-image"
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                                <ImagePlus size={17} />
                                Choose Image
                            </label>

                            <input
                                id="category-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="sr-only"
                            />

                            <p className="text-xs text-gray-500">
                                Image formats supported by your server. Maximum
                                5 MB in this form.
                            </p>

                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={removeSelectedImage}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
                                >
                                    <X size={16} />
                                    Remove image
                                </button>
                            )}
                        </div>
                    </div>

                    {/* {isEditing && !image && !imagePreview && (
                        <p className="mt-3 text-xs text-amber-700">
                            The current image will be removed from the form
                            preview. The existing backend update endpoint does
                            not currently clear the saved image when no file
                            is submitted.
                        </p>
                    )} */}
                </section>

                {/* Status */}
                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="font-semibold text-gray-900">
                        Visibility
                    </h2>

                    <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                Active Category
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                Enable or disable this category.
                            </p>
                        </div>

                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(event) =>
                                setForm((previous) => ({
                                    ...previous,
                                    isActive: event.target.checked
                                }))
                            }
                            className="h-5 w-5 cursor-pointer rounded border-gray-300 accent-indigo-600"
                        />
                    </label>
                </section>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => navigate('/admin/categories')}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? (
                            <LoaderCircle
                                size={18}
                                className="animate-spin"
                            />
                        ) : (
                            <Save size={18} />
                        )}

                        {saving
                            ? 'Saving...'
                            : isEditing
                                ? 'Update Category'
                                : 'Create Category'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;