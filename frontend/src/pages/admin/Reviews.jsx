
import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import {
    Search,
    Star,
    Trash2,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    UserRound,
    Package,
    CalendarDays,
    X,
    Filter,
    ArrowUpDown,
    LoaderCircle,
} from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

const PAGE_SIZE_OPTIONS = [
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
    { value: '100', label: '100 per page' },
];

const SORT_OPTIONS = [
    { value: 'createdAt-desc', label: 'Newest first' },
    { value: 'createdAt-asc', label: 'Oldest first' },
    { value: 'rating-desc', label: 'Highest rating' },
    { value: 'rating-asc', label: 'Lowest rating' },
    { value: 'updatedAt-desc', label: 'Recently updated' },
];

const formatDate = (date) => {
    if (!date) return '—';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return '—';

    return parsedDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getProductImage = (product) => {
    if (!product?.images?.length) return '';

    const image = product.images[0];

    return typeof image === 'string'
        ? image
        : image?.url || image?.secure_url || '';
};

const StarRating = ({ rating = 0 }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={15}
                className={
                    star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                }
            />
        ))}
        <span className="ml-1 text-sm font-semibold text-gray-700">
            {rating}/5
        </span>
    </div>
);

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 10,
        totalReviews: 0,
        totalPages: 0,
    });

    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        rating: '',
        product: '',
        sort: 'createdAt',
        order: 'desc',
    });

    const [pageSize, setPageSize] = useState('10');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);

            const params = {
                page,
                limit: Number(pageSize),
                sort: filters.sort,
                order: filters.order,
            };

            if (filters.search) params.search = filters.search;
            if (filters.rating) params.rating = filters.rating;
            if (filters.product) params.product = filters.product;

            const response = await api.get('/admin/reviews', { params });

            if (!response.data.success) {
                throw new Error(
                    response.data.message || 'Unable to load reviews'
                );
            }

            setReviews(response.data.data || []);
            setPagination(
                response.data.pagination || {
                    currentPage: page,
                    limit: Number(pageSize),
                    totalReviews: 0,
                    totalPages: 0,
                }
            );
        } catch (error) {
            console.error('Fetch reviews error:', error);
            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Failed to load reviews'
            );
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, filters]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleApplyFilters = (event) => {
        event.preventDefault();

        setFilters((current) => ({
            ...current,
            search: searchInput.trim(),
        }));

        setPage(1);
    };

    const handleSortChange = (value) => {
        const [sort, order] = value.split('-');

        setFilters((current) => ({
            ...current,
            sort,
            order,
        }));

        setPage(1);
    };

    const handleClearFilters = () => {
        setSearchInput('');
        setFilters({
            search: '',
            rating: '',
            product: '',
            sort: 'createdAt',
            order: 'desc',
        });
        setPage(1);
    };


    const handleDeleteReview = (review) => {
        setSelectedReview(review);
    };

    const handleConfirmDelete = async () => {
        if (!selectedReview) return;

        const review = selectedReview;

        try {
            setDeletingId(review._id);

            await api.delete(`/reviews/${review._id}`);

            toast.success('Review deleted successfully');
            setSelectedReview(null);

            if (reviews.length === 1 && page > 1) {
                setPage((current) => current - 1);
            } else {
                await fetchReviews();
            }
        } catch (error) {
            console.error('Delete review error:', error);

            toast.error(
                error.response?.data?.message || 'Failed to delete review'
            );
        } finally {
            setDeletingId(null);
        }
    };


    const hasActiveFilters =
        Boolean(filters.search) ||
        Boolean(filters.rating) ||
        Boolean(filters.product);

    const totalReviews = pagination.totalReviews || 0;
    const totalPages = pagination.totalPages || 0;
    const startItem = totalReviews === 0
        ? 0
        : (page - 1) * Number(pageSize) + 1;
    const endItem = Math.min(page * Number(pageSize), totalReviews);

    return (
        <div className="min-w-0 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#6366F1]">
                            <MessageSquare size={23} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-[#111827]">
                                Customer Reviews
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage and moderate customer feedback.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={fetchReviews}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#6366F1] hover:text-[#6366F1] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? 'animate-spin' : ''}
                    />
                    Refresh
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Total Reviews
                            </p>
                            <p className="mt-2 text-3xl font-bold text-[#111827]">
                                {totalReviews.toLocaleString('en-IN')}
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-[#6366F1]">
                            <MessageSquare size={23} />
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Reviews matching the current filters
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Current Page
                            </p>
                            <p className="mt-2 text-3xl font-bold text-[#111827]">
                                {totalPages ? page : 0}
                                <span className="ml-2 text-base font-medium text-gray-400">
                                    / {totalPages}
                                </span>
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                            <Star size={23} />
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        {reviews.length} reviews displayed on this page
                    </p>
                </div>
            </div>

            {/* Filters */}
            <form
                onSubmit={handleApplyFilters}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
            >
                <div className="mb-4 flex items-center gap-2">
                    <Filter size={18} className="text-[#6366F1]" />
                    <h2 className="font-semibold text-[#111827]">
                        Search & Filters
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="sm:col-span-2 xl:col-span-2">
                        <label
                            htmlFor="review-search"
                            className="mb-1.5 block text-xs font-semibold text-gray-600"
                        >
                            Search reviews
                        </label>

                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                id="review-search"
                                type="text"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                                placeholder="Comment, customer, email or product..."
                                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="review-rating"
                            className="mb-1.5 block text-xs font-semibold text-gray-600"
                        >
                            Rating
                        </label>

                        <select
                            id="review-rating"
                            value={filters.rating}
                            onChange={(event) => {
                                setFilters((current) => ({
                                    ...current,
                                    rating: event.target.value,
                                }));
                                setPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15"
                        >
                            <option value="">All ratings</option>
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <option key={rating} value={rating}>
                                    {rating} star{rating > 1 ? 's' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="review-sort"
                            className="mb-1.5 block text-xs font-semibold text-gray-600"
                        >
                            Sort by
                        </label>

                        <div className="relative">
                            <ArrowUpDown
                                size={16}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <select
                                id="review-sort"
                                value={`${filters.sort}-${filters.order}`}
                                onChange={(event) =>
                                    handleSortChange(event.target.value)
                                }
                                className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-2 xl:col-span-3">
                        <label
                            htmlFor="review-product"
                            className="mb-1.5 block text-xs font-semibold text-gray-600"
                        >
                            Product ID (optional)
                        </label>
                        <input
                            id="review-product"
                            type="text"
                            value={filters.product}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    product: event.target.value,
                                }))
                            }
                            placeholder="Paste product MongoDB ID"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15"
                        />
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                        <button
                            type="submit"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                            <Search size={16} />
                            Apply
                        </button>

                        <button
                            type="button"
                            onClick={handleClearFilters}
                            title="Clear filters"
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2.5 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                        >
                            <X size={17} />
                        </button>
                    </div>
                </div>

                {hasActiveFilters && (
                    <p className="mt-3 text-xs text-gray-500">
                        Filters are active. Use Clear to reset the search and
                        rating/product filters.
                    </p>
                )}
            </form>

            {/* Reviews table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-[#111827]">
                            All Reviews
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Review moderation and customer feedback
                        </p>
                    </div>

                    <select
                        aria-label="Reviews per page"
                        value={pageSize}
                        onChange={(event) => {
                            setPageSize(event.target.value);
                            setPage(1);
                        }}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#6366F1] sm:w-auto"
                    >
                        {PAGE_SIZE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="flex min-h-64 flex-col items-center justify-center gap-3">
                        <LoaderCircle
                            size={30}
                            className="animate-spin text-[#6366F1]"
                        />
                        <p className="text-sm text-gray-500">
                            Loading reviews...
                        </p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <MessageSquare size={25} />
                        </div>
                        <h3 className="mt-4 font-semibold text-gray-800">
                            No reviews found
                        </h3>
                        <p className="mt-1 max-w-sm text-sm text-gray-500">
                            Try changing your search or filters. Reviews will
                            appear here when available.
                        </p>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="mt-4 text-sm font-semibold text-[#6366F1] hover:text-indigo-700"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full min-w-[950px] text-left">
                                <thead className="bg-gray-50">
                                    <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        <th className="px-5 py-4">Customer</th>
                                        <th className="px-5 py-4">Product</th>
                                        <th className="px-5 py-4">Rating</th>
                                        <th className="px-5 py-4">Comment</th>
                                        <th className="px-5 py-4">Date</th>
                                        <th className="px-5 py-4 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {reviews.map((review) => {
                                        const productImage = getProductImage(
                                            review.product
                                        );

                                        return (
                                            <tr
                                                key={review._id}
                                                className="transition hover:bg-gray-50/70"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex min-w-40 items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-[#6366F1]">
                                                            {review.user?.avatar ? (
                                                                <img
                                                                    src={review.user.avatar}
                                                                    alt=""
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <UserRound size={19} />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-gray-800">
                                                                {review.user?.name || 'Deleted user'}
                                                            </p>
                                                            <p className="max-w-44 truncate text-xs text-gray-500">
                                                                {review.user?.email || '—'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex min-w-44 items-center gap-3">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                                            {productImage ? (
                                                                <img
                                                                    src={productImage}
                                                                    alt={review.product?.name || 'Product'}
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            ) : (
                                                                <Package
                                                                    size={19}
                                                                    className="text-gray-400"
                                                                />
                                                            )}
                                                        </div>
                                                        <span className="max-w-48 text-sm font-medium text-gray-700">
                                                            {review.product?.name || 'Deleted product'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <StarRating rating={review.rating} />
                                                </td>

                                                <td className="max-w-xs px-5 py-4">
                                                    <p
                                                        title={review.comment}
                                                        className="line-clamp-3 whitespace-pre-wrap text-sm leading-5 text-gray-600"
                                                    >
                                                        {review.comment || 'No comment'}
                                                    </p>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <CalendarDays
                                                            size={15}
                                                            className="shrink-0"
                                                        />
                                                        {formatDate(review.createdAt)}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteReview(review)
                                                        }
                                                        disabled={deletingId === review._id}
                                                        title="Delete review"
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {deletingId === review._id ? (
                                                            <LoaderCircle
                                                                size={16}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile and tablet cards */}
                        <div className="divide-y divide-gray-100 lg:hidden">
                            {reviews.map((review) => {
                                const productImage = getProductImage(
                                    review.product
                                );

                                return (
                                    <article
                                        key={review._id}
                                        className="space-y-4 p-4 sm:p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-[#6366F1]">
                                                    {review.user?.avatar ? (
                                                        <img
                                                            src={review.user.avatar}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <UserRound size={19} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-gray-800">
                                                        {review.user?.name || 'Deleted user'}
                                                    </p>
                                                    <p className="truncate text-xs text-gray-500">
                                                        {review.user?.email || '—'}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteReview(review)
                                                }
                                                disabled={deletingId === review._id}
                                                aria-label="Delete review"
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                            >
                                                {deletingId === review._id ? (
                                                    <LoaderCircle
                                                        size={17}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <Trash2 size={17} />
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white">
                                                {productImage ? (
                                                    <img
                                                        src={productImage}
                                                        alt={review.product?.name || 'Product'}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <Package
                                                        size={20}
                                                        className="text-gray-400"
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500">
                                                    Product
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                                    {review.product?.name || 'Deleted product'}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <StarRating rating={review.rating} />
                                            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                                                {review.comment || 'No comment'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <CalendarDays size={14} />
                                            {formatDate(review.createdAt)}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {!loading && reviews.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-semibold text-gray-700">{startItem}–{endItem}</span>
                            {' '}of <span className="font-semibold text-gray-700">{totalReviews}</span> reviews
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setPage((current) => Math.max(1, current - 1))
                                }
                                disabled={page <= 1}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>

                            <span className="min-w-20 text-center text-sm font-medium text-gray-600">
                                Page {page} of {totalPages}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage((current) =>
                                        Math.min(totalPages, current + 1)
                                    )
                                }
                                disabled={page >= totalPages}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={Boolean(selectedReview)}
                title="Delete Review?"
                message={`Are you sure you want to delete this review by ${selectedReview?.user?.name || 'this customer'
                    }? This action cannot be undone.`}
                confirmText="Delete Review"
                cancelText="Keep Review"
                variant="danger"
                loading={Boolean(deletingId)}
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    if (!deletingId) setSelectedReview(null);
                }}
            />
        </div>
    );
};

export default Reviews;