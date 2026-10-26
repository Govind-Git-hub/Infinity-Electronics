import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    ImagePlus,
    LoaderCircle,
    Save,
    X,
    Tags
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

const BrandForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [form, setForm] = useState({
        name: '',
        slug: '',
        isActive: true
    });

    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [savedLogo, setSavedLogo] = useState('');
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [removeLogo, setRemoveLogo] = useState(false);

    useEffect(() => {
        if (!isEditing) return;

        const fetchBrand = async () => {
            try {
                setLoading(true);
                setError('');

                const { data } = await api.get(`/brands/${id}`);

                if (!data.success || !data.data) {
                    throw new Error(data.message || 'Brand not found');
                }

                const brand = data.data;

                setForm({
                    name: brand.name || '',
                    slug: brand.slug || '',
                    isActive: Boolean(brand.isActive)
                });

                setLogoPreview(brand.logo || '');
                setSavedLogo(brand.logo || '');
                setRemoveLogo(false);
            } catch (error) {
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to load brand';

                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchBrand();
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
        setSlugManuallyEdited(true);

        setForm((previous) => ({
            ...previous,
            slug: event.target.value
        }));
    };

    const handleLogoChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            event.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Logo size must be 5 MB or less');
            event.target.value = '';
            return;
        }

        setLogoPreview(URL.createObjectURL(file));
        setLogo(file);
        setRemoveLogo(false);
    };

    const removeSelectedLogo = () => {
        // Removing a newly selected file should restore the saved logo, not delete it.
        if (logo) {
            setLogo(null);
            setLogoPreview(removeLogo ? '' : savedLogo);
        } else if (isEditing && savedLogo && !removeLogo) {
            // Mark the existing saved logo for removal when the form is submitted.
            setLogoPreview('');
            setRemoveLogo(true);
        } else {
            setLogoPreview('');
        }

        const fileInput = document.getElementById('brand-logo');
        if (fileInput) fileInput.value = '';
    };

    const undoRemoveLogo = () => {
        setRemoveLogo(false);
        setLogo(null);
        setLogoPreview(savedLogo);

        const fileInput = document.getElementById('brand-logo');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            toast.error('Brand name is required');
            return;
        }

        if (!form.slug.trim()) {
            toast.error('Brand slug is required');
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();

            formData.append('name', form.name.trim());
            formData.append('slug', form.slug.trim());
            formData.append('isActive', String(form.isActive));

            if (logo) {
                formData.append('logo', logo);
            } else if (isEditing && removeLogo) {
                formData.append('removeLogo', 'true');
            }

            const { data } = isEditing
                ? await api.put(`/brands/${id}`, formData)
                : await api.post('/brands', formData);

            if (!data.success) {
                throw new Error(data.message || 'Failed to save brand');
            }

            toast.success(
                data.message ||
                `Brand ${isEditing ? 'updated' : 'created'} successfully`
            );

            navigate('/admin/brands');
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Failed to save brand'
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
                    Loading brand...
                </span>
            </div>
        );
    }

    if (error && isEditing && !form.name) {
        return (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
                <p className="font-semibold text-gray-900">
                    Could not load brand
                </p>

                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() => navigate('/admin/brands')}
                    className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    Back to Brands
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
                    onClick={() => navigate('/admin/brands')}
                    className="mt-1 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 transition hover:bg-gray-50 hover:text-indigo-600"
                    aria-label="Back to brands"
                >
                    <ArrowLeft size={19} />
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Brand' : 'Add Brand'}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        {isEditing
                            ? 'Update the brand details and logo.'
                            : 'Create a brand for your electronics products.'}
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
                <div className="space-y-6 p-5 sm:p-8">
                    {/* Brand name */}
                    <section>
                        <label
                            htmlFor="brand-name"
                            className="mb-2 block text-sm font-semibold text-gray-800"
                        >
                            Brand Name <span className="text-red-500">*</span>
                        </label>

                        <input
                            id="brand-name"
                            type="text"
                            value={form.name}
                            onChange={handleNameChange}
                            placeholder="e.g. Samsung"
                            required
                            maxLength={100}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </section>

                    {/* Slug */}
                    <section>
                        <label
                            htmlFor="brand-slug"
                            className="mb-2 block text-sm font-semibold text-gray-800"
                        >
                            Brand Slug <span className="text-red-500">*</span>
                        </label>

                        <input
                            id="brand-slug"
                            type="text"
                            value={form.slug}
                            onChange={handleSlugChange}
                            placeholder="e.g. samsung"
                            required
                            maxLength={120}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />

                        <p className="mt-2 text-xs text-gray-500">
                            Used in URLs. Automatically generated from the brand name,
                            but you can edit it.
                        </p>
                    </section>

                    {/* Logo upload */}
                    <section>
                        <label className="mb-2 block text-sm font-semibold text-gray-800">
                            Brand Logo
                        </label>

                        <p className="mb-3 text-xs text-gray-500">
                            Upload PNG, JPG, WEBP or another supported image format.
                            Maximum file size: 5 MB.
                        </p>

                        <input
                            id="brand-logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                        />

                        {logoPreview ? (
                            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center">
                                <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-3">
                                    <img
                                        src={logoPreview}
                                        alt="Brand logo preview"
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-gray-900">
                                        {logo
                                            ? 'New logo selected'
                                            : 'Current brand logo'}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {logo
                                            ? logo.name
                                            : 'Choose a new file to replace the existing logo.'}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <label
                                            htmlFor="brand-logo"
                                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                                        >
                                            <ImagePlus size={16} />
                                            Replace logo
                                        </label>

                                        <button
                                            type="button"
                                            onClick={removeSelectedLogo}
                                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                            <X size={16} />
                                            Remove preview
                                        </button>
                                    </div>

                                    {isEditing && !logo && !removeLogo && (
                                        <p className="mt-3 text-xs text-gray-500">
                                            Select Remove preview to mark the saved logo for deletion.
                                            The change takes effect when you save the form.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : removeLogo ? (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                <p className="text-sm font-semibold text-amber-900">
                                    Logo will be removed when you save.
                                </p>
                                <p className="mt-1 text-xs text-amber-800">
                                    You can undo this before submitting the form.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={undoRemoveLogo}
                                        className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
                                    >
                                        Undo remove
                                    </button>
                                    <label
                                        htmlFor="brand-logo"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                                    >
                                        <ImagePlus size={16} />
                                        Choose a new logo
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <label
                                htmlFor="brand-logo"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <ImagePlus size={24} />
                                </div>

                                <span className="mt-3 text-sm font-semibold text-gray-800">
                                    Click to upload a logo
                                </span>

                                <span className="mt-1 text-xs text-gray-500">
                                    Image files up to 5 MB
                                </span>
                            </label>
                        )}
                    </section>

                    {/* Active status */}
                    <section className="rounded-xl border border-gray-200 p-4">
                        <label className="flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(event) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        isActive: event.target.checked
                                    }))
                                }
                                className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 accent-indigo-600"
                            />

                            <span>
                                <span className="block text-sm font-semibold text-gray-900">
                                    Active Brand
                                </span>

                                <span className="mt-1 block text-sm text-gray-500">
                                    Active brands can be displayed in places where
                                    your storefront lists available brands.
                                </span>
                            </span>
                        </label>
                    </section>
                </div>

                {/* Form actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => navigate('/admin/brands')}
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
                            <LoaderCircle size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}

                        {saving
                            ? 'Saving...'
                            : isEditing
                                ? 'Update Brand'
                                : 'Create Brand'}
                    </button>
                </div>
            </form>

            {/* Small helper panel */}
            <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                <Tags size={20} className="mt-0.5 shrink-0 text-indigo-600" />

                <div>
                    <p className="text-sm font-semibold text-gray-900">
                        Brand management tip
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                        You cannot delete a brand while products are linked to it.
                        Reassign those products first if you need to remove the brand.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BrandForm;