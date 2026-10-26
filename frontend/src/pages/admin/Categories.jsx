
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    LoaderCircle,
    FolderOpen,
    Image as ImageIcon,
    X,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const Categories = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 10,
        totalCategories: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const { data } = await api.get('/categories', {
                params: {
                    page: pagination.currentPage,
                    limit: pagination.limit,
                    search: search.trim() || undefined
                }
            });

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch categories');
            }

            const result = data.pagination;

            if (
                result &&
                result.totalPages > 0 &&
                pagination.currentPage > result.totalPages
            ) {
                setPagination((previous) => ({
                    ...previous,
                    currentPage: result.totalPages
                }));
                return;
            }

            setCategories(Array.isArray(data.data) ? data.data : []);

            setPagination((previous) => ({
                ...previous,
                ...(data.pagination || {})
            }));
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to load categories';

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, pagination.limit, search]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        setPagination((previous) => ({
            ...previous,
            currentPage: 1
        }));
    }, [search]);

    const filteredCategories = categories;

    const handleDelete = async () => {
        if (!selectedCategory || deleting) return;

        try {
            setDeleting(true);

            const { data } = await api.delete(
                `/categories/${selectedCategory._id}`
            );

            if (!data.success) {
                throw new Error(data.message || 'Failed to delete category');
            }

            toast.success(data.message || 'Category deleted successfully');
            setSelectedCategory(null);

            if (categories.length === 1 && pagination.currentPage > 1) {
                setPagination((previous) => ({
                    ...previous,
                    currentPage: previous.currentPage - 1
                }));
            } else {
                await fetchCategories();
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Failed to delete category'
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Categories
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your product categories and their visibility.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/admin/categories/new')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {/* Search and count */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search categories by name or slug..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <p className="text-sm text-gray-500">
                        Showing{' '}
                        <span className="font-semibold text-gray-900">
                            {categories.length}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-gray-900">
                            {pagination.totalCategories}
                        </span>{' '}
                        categories
                    </p>
                </div>
            </div>

            {/* Categories table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex min-h-64 flex-col items-center justify-center gap-3">
                        <LoaderCircle
                            size={32}
                            className="animate-spin text-indigo-600"
                        />
                        <p className="text-sm text-gray-500">
                            Loading categories...
                        </p>
                    </div>
                ) : error ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                        <AlertTriangle
                            size={32}
                            className="mb-3 text-red-500"
                        />
                        <p className="font-semibold text-gray-900">
                            Could not load categories
                        </p>
                        <p className="mt-1 text-sm text-gray-500">{error}</p>

                        <button
                            type="button"
                            onClick={fetchCategories}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                        <div className="mb-4 rounded-2xl bg-indigo-50 p-4">
                            <FolderOpen
                                size={32}
                                className="text-indigo-600"
                            />
                        </div>

                        <h2 className="font-semibold text-gray-900">
                            {search
                                ? 'No matching categories'
                                : 'No categories yet'}
                        </h2>

                        <p className="mt-1 max-w-sm text-sm text-gray-500">
                            {search
                                ? 'Try another search term.'
                                : 'Create your first category to organize your products.'}
                        </p>

                        {!search && (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate('/admin/categories/new')
                                }
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                <Plus size={17} />
                                Create Category
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Slug
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredCategories.map((category) => (
                                    <tr
                                        key={category._id}
                                        className="transition hover:bg-gray-50/80"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                                    {category.image ? (
                                                        <img
                                                            src={category.image}
                                                            alt={category.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon
                                                            size={20}
                                                            className="text-gray-400"
                                                        />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900">
                                                        {category.name}
                                                    </p>
                                                    <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                                                        {category.description ||
                                                            'No description'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="rounded-md bg-gray-100 px-2.5 py-1.5 font-mono text-xs text-gray-600">
                                                {category.slug}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${category.isActive
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${category.isActive
                                                        ? 'bg-emerald-500'
                                                        : 'bg-gray-400'
                                                        }`}
                                                />
                                                {category.isActive
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    title="Edit category"
                                                    aria-label={`Edit ${category.name}`}
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/categories/${category._id}/edit`
                                                        )
                                                    }
                                                    className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Delete category"
                                                    aria-label={`Delete ${category.name}`}
                                                    onClick={() =>
                                                        setSelectedCategory(
                                                            category
                                                        )
                                                    }
                                                    className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {!loading && !error && pagination.totalCategories > 0 && (
                <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                        Showing{' '}
                        <span className="font-semibold text-gray-900">
                            {(pagination.currentPage - 1) * pagination.limit + 1}
                        </span>
                        {' '}to{' '}
                        <span className="font-semibold text-gray-900">
                            {Math.min(
                                pagination.currentPage * pagination.limit,
                                pagination.totalCategories
                            )}
                        </span>
                        {' '}of{' '}
                        <span className="font-semibold text-gray-900">
                            {pagination.totalCategories}
                        </span>
                        {' '}categories
                    </p>

                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                        <button
                            type="button"
                            disabled={!pagination.hasPrevPage}
                            onClick={() =>
                                setPagination((previous) => ({
                                    ...previous,
                                    currentPage: previous.currentPage - 1
                                }))
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="px-2 text-sm font-medium text-gray-700">
                            Page {pagination.currentPage} of {Math.max(1, pagination.totalPages)}
                        </span>

                        <button
                            type="button"
                            disabled={!pagination.hasNextPage}
                            onClick={() =>
                                setPagination((previous) => ({
                                    ...previous,
                                    currentPage: previous.currentPage + 1
                                }))
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}


            {/* Delete confirmation modal */}
            {selectedCategory && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4"
                    onClick={() => {
                        if (!deleting) setSelectedCategory(null);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-category-title"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
                                <AlertTriangle
                                    size={24}
                                    className="text-red-600"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2
                                    id="delete-category-title"
                                    className="text-lg font-bold text-gray-900"
                                >
                                    Delete Category?
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Are you sure you want to delete{' '}
                                    <span className="font-semibold text-gray-900">
                                        {selectedCategory.name}
                                    </span>
                                    ? This action cannot be undone.
                                </p>

                                <p className="mt-2 text-xs leading-5 text-amber-700">
                                    Categories used by products cannot be
                                    deleted. The server will check this before
                                    deleting.
                                </p>
                            </div>

                            <button
                                type="button"
                                aria-label="Close dialog"
                                disabled={deleting}
                                onClick={() => setSelectedCategory(null)}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setSelectedCategory(null)}
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting ? (
                                    <>
                                        <LoaderCircle
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Delete Category
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;