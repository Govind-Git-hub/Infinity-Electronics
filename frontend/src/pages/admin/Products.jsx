
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Package,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    RefreshCw,
    Star,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(Number(price) || 0);

const Products = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
    });
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);

        try {
            const response = await api.get('/products', {
                params: {
                    page,
                    limit: 10,
                    search: search.trim() || undefined,
                    sort: 'createdAt',
                    order: 'desc',
                },
            });

            if (response.data.success) {
                setProducts(response.data.data || []);
                setPagination(
                    response.data.pagination || {
                        currentPage: page,
                        totalPages: 0,
                        totalProducts: 0,
                    }
                );
            } else {
                toast.error(response.data.message || 'Failed to fetch products');
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Unable to load products'
            );
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        const timer = setTimeout(fetchProducts, 350);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const handleSearch = (value) => {
        setSearch(value);
        setPage(1);
    };


    const handleDelete = async () => {
        if (!selectedProduct) return;

        setDeletingId(selectedProduct._id);

        try {
            const response = await api.delete(
                `/products/${selectedProduct._id}`
            );

            if (response.data.success) {
                toast.success(
                    response.data.message || 'Product deleted successfully'
                );

                setSelectedProduct(null);

                // If the last item on a page was deleted, go to the previous page.
                if (products.length === 1 && page > 1) {
                    setPage((currentPage) => currentPage - 1);
                } else {
                    await fetchProducts();
                }
            } else {
                toast.error(
                    response.data.message || 'Failed to delete product'
                );
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Unable to delete product'
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page heading */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Admin</span>
                        <span>/</span>
                        <span className="text-slate-700">Products</span>
                    </div>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        Products
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your electronics inventory and product details.
                    </p>
                </div>

                <Link
                    to="/admin/products/new"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Products
                            </p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {pagination.totalProducts}
                            </p>
                        </div>
                        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                            <Package size={22} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Current Page
                            </p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {pagination.totalPages > 0
                                    ? `${pagination.currentPage} / ${pagination.totalPages}`
                                    : '0 / 0'}
                            </p>
                        </div>
                        <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                            <Star size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Products table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            All Products
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Search and manage your product catalogue.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1 sm:w-72">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => handleSearch(event.target.value)}
                                placeholder="Search products..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={fetchProducts}
                            disabled={loading}
                            title="Refresh products"
                            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={18}
                                className={loading ? 'animate-spin' : ''}
                            />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-5 py-4 font-semibold">Product</th>
                                <th className="px-5 py-4 font-semibold">Category</th>
                                <th className="px-5 py-4 font-semibold">Brand</th>
                                <th className="px-5 py-4 font-semibold">Price</th>
                                <th className="px-5 py-4 font-semibold">Stock</th>
                                <th className="px-5 py-4 font-semibold">Status</th>
                                <th className="px-5 py-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-5 py-16 text-center">
                                        <LoaderCircle
                                            size={28}
                                            className="mx-auto animate-spin text-indigo-600"
                                        />
                                        <p className="mt-3 text-sm text-slate-500">
                                            Loading products...
                                        </p>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-5 py-16 text-center">
                                        <Package
                                            size={36}
                                            className="mx-auto text-slate-300"
                                        />
                                        <p className="mt-3 font-medium text-slate-700">
                                            No products found
                                        </p>
                                        <p className="mt-1 text-slate-500">
                                            Try another search or add your first product.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr
                                        key={product._id}
                                        className="transition hover:bg-slate-50/70"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="h-full w-full object-contain p-1"
                                                        />
                                                    ) : (
                                                        <Package
                                                            size={22}
                                                            className="text-slate-400"
                                                        />
                                                    )}
                                                </div>

                                                <div className="max-w-[240px]">
                                                    <p className="font-semibold text-slate-900">
                                                        {product.name}
                                                    </p>
                                                    {product.isFeatured && (
                                                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                                                            <Star size={12} fill="currentColor" />
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {product.category?.name || '—'}
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {product.brand?.name || '—'}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-900">
                                                {formatPrice(
                                                    product.discountPrice ?? product.price
                                                )}
                                            </div>

                                            {product.discountPrice != null &&
                                                Number(product.discountPrice) <
                                                Number(product.price) && (
                                                    <div className="mt-0.5 text-xs text-slate-400 line-through">
                                                        {formatPrice(product.price)}
                                                    </div>
                                                )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${Number(product.stock) <= 0
                                                    ? 'bg-red-50 text-red-700'
                                                    : Number(product.stock) < 10
                                                        ? 'bg-amber-50 text-amber-700'
                                                        : 'bg-emerald-50 text-emerald-700'
                                                    }`}
                                            >
                                                {Number(product.stock) <= 0
                                                    ? 'Out of stock'
                                                    : `${product.stock} units`}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                Active
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/admin/products/${product._id}/edit`}
                                                    title="Edit product"
                                                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                                >
                                                    <Pencil size={16} />
                                                </Link>

                                                <button
                                                    type="button"
                                                    title="Delete product"
                                                    onClick={() => setSelectedProduct(product)}
                                                    disabled={deletingId === product._id}
                                                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                >
                                                    {deletingId === product._id ? (
                                                        <LoaderCircle
                                                            size={16}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-sm text-slate-500">
                        Showing{' '}
                        <span className="font-semibold text-slate-700">
                            {products.length}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-slate-700">
                            {pagination.totalProducts}
                        </span>{' '}
                        products
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={page <= 1 || loading}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>

                        <span className="px-2 text-sm text-slate-600">
                            {pagination.totalPages > 0 ? page : 0} /{' '}
                            {pagination.totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setPage((current) =>
                                    Math.min(pagination.totalPages, current + 1)
                                )
                            }
                            disabled={page >= pagination.totalPages || loading}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {selectedProduct && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
                    onClick={() => {
                        if (!deletingId) setSelectedProduct(null);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-product-title"
                        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <Trash2 size={24} />
                        </div>

                        <h2
                            id="delete-product-title"
                            className="text-xl font-bold text-slate-900"
                        >
                            Delete Product?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-slate-900">
                                "{selectedProduct.name}"
                            </span>
                            ? This action cannot be undone. Its product images will
                            also be removed from Cloudinary.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={deletingId !== null}
                                onClick={() => setSelectedProduct(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deletingId === selectedProduct._id}
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deletingId === selectedProduct._id && (
                                    <LoaderCircle size={16} className="animate-spin" />
                                )}
                                {deletingId === selectedProduct._id
                                    ? 'Deleting...'
                                    : 'Delete Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;