import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    LoaderCircle,
    Tags,
    Image as ImageIcon,
    X,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const Brands = () => {
    const navigate = useNavigate();

    const [brands, setBrands] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 10,
        totalBrands: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    const fetchBrands = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const { data } = await api.get('/brands', {
                params: {
                    page: pagination.currentPage,
                    limit: pagination.limit,
                    search: search.trim() || undefined
                }
            });

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch brands');
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

            setBrands(Array.isArray(data.data) ? data.data : []);

            setPagination((previous) => ({
                ...previous,
                ...(data.pagination || {})
            }));
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to load brands';

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, pagination.limit, search]);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    useEffect(() => {
        setPagination((previous) => ({
            ...previous,
            currentPage: 1
        }));
    }, [search]);

    const handleDelete = async () => {
        if (!selectedBrand || deleting) return;

        try {
            setDeleting(true);

            const { data } = await api.delete(
                `/brands/${selectedBrand._id}`
            );

            if (!data.success) {
                throw new Error(data.message || 'Failed to delete brand');
            }

            toast.success(data.message || 'Brand deleted successfully');

            const shouldGoBack =
                brands.length === 1 && pagination.currentPage > 1;

            setSelectedBrand(null);

            if (shouldGoBack) {
                setPagination((previous) => ({
                    ...previous,
                    currentPage: previous.currentPage - 1
                }));
            } else {
                await fetchBrands();
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Failed to delete brand'
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
                        Brands
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your product brands, logos and visibility.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/admin/brands/new')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <Plus size={18} />
                    Add Brand
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
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search brands by name or slug..."
                            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                aria-label="Clear search"
                            >
                                <X size={17} />
                            </button>
                        )}
                    </div>

                    <p className="text-sm text-gray-500">
                        Showing{' '}
                        <span className="font-semibold text-gray-900">
                            {brands.length}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-gray-900">
                            {pagination.totalBrands}
                        </span>{' '}
                        brands
                    </p>
                </div>
            </div>

            {/* Brand table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex min-h-64 items-center justify-center gap-3">
                        <LoaderCircle
                            size={28}
                            className="animate-spin text-indigo-600"
                        />
                        <span className="text-sm text-gray-500">
                            Loading brands...
                        </span>
                    </div>
                ) : error ? (
                    <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
                        <p className="font-semibold text-gray-900">
                            Could not load brands
                        </p>
                        <p className="mt-2 text-sm text-red-600">{error}</p>

                        <button
                            type="button"
                            onClick={fetchBrands}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            <RefreshCw size={16} />
                            Try again
                        </button>
                    </div>
                ) : brands.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <Tags size={27} />
                        </div>

                        <h3 className="mt-4 font-semibold text-gray-900">
                            {search ? 'No brands found' : 'No brands yet'}
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-gray-500">
                            {search
                                ? 'Try another search term.'
                                : 'Create your first brand to get started.'}
                        </p>

                        {!search && (
                            <button
                                type="button"
                                onClick={() => navigate('/admin/brands/new')}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                <Plus size={17} />
                                Add Brand
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Brand
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
                                    {brands.map((brand) => (
                                        <tr
                                            key={brand._id}
                                            className="transition hover:bg-gray-50/70"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                                        {brand.logo ? (
                                                            <img
                                                                src={brand.logo}
                                                                alt={brand.name}
                                                                className="h-full w-full object-contain p-1"
                                                            />
                                                        ) : (
                                                            <ImageIcon
                                                                size={21}
                                                                className="text-gray-400"
                                                            />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            {brand.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            ID: {brand._id.slice(-8)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {brand.slug || '—'}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${brand.isActive
                                                            ? 'bg-green-50 text-green-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                >
                                                    <span
                                                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${brand.isActive
                                                                ? 'bg-green-500'
                                                                : 'bg-gray-400'
                                                            }`}
                                                    />
                                                    {brand.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(`/admin/brands/${brand._id}/edit`)
                                                        }
                                                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                                        aria-label={`Edit ${brand.name}`}
                                                        title="Edit brand"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedBrand(brand)}
                                                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                        aria-label={`Delete ${brand.name}`}
                                                        title="Delete brand"
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

                        {/* Pagination */}
                        {pagination.totalBrands > 0 && (
                            <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <p className="text-sm text-gray-500">
                                    Showing{' '}
                                    {(pagination.currentPage - 1) * pagination.limit + 1}
                                    {' '}to{' '}
                                    {Math.min(
                                        pagination.currentPage * pagination.limit,
                                        pagination.totalBrands
                                    )}{' '}
                                    of {pagination.totalBrands} brands
                                </p>

                                <div className="flex items-center justify-between gap-3 sm:justify-end">
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
                                        Page {pagination.currentPage} of{' '}
                                        {Math.max(1, pagination.totalPages)}
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
                    </>
                )}
            </div>

            {/* Delete confirmation modal */}
            {selectedBrand && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4"
                    onClick={() => {
                        if (!deleting) setSelectedBrand(null);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-brand-title"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2
                                    id="delete-brand-title"
                                    className="text-lg font-bold text-gray-900"
                                >
                                    Delete brand?
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Are you sure you want to delete{' '}
                                    <span className="font-semibold text-gray-900">
                                        {selectedBrand.name}
                                    </span>
                                    ? This action cannot be undone.
                                </p>

                                <p className="mt-2 text-xs text-gray-500">
                                    Brands linked to products cannot be deleted.
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setSelectedBrand(null)}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                                aria-label="Close dialog"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setSelectedBrand(null)}
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting ? (
                                    <LoaderCircle size={17} className="animate-spin" />
                                ) : (
                                    <Trash2 size={17} />
                                )}
                                {deleting ? 'Deleting...' : 'Delete Brand'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Brands;