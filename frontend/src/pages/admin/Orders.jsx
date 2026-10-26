import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, RefreshCw, Eye, ShoppingBag, ChevronLeft, ChevronRight,
    LoaderCircle, PackageSearch, X
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusClasses = {
    Processing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Shipped: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    Delivered: 'bg-green-50 text-green-700 ring-green-600/20',
    Cancelled: 'bg-red-50 text-red-700 ring-red-600/20'
};

const money = (value) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(Number(value) || 0);

const shortId = (id) => id ? `#${String(id).slice(-8).toUpperCase()}` : '—';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1, totalPages: 1, totalOrders: 0, limit: 10
    });
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            setSearch(searchInput.trim());
        }, 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const fetchOrders = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const { data } = await api.get('/orders', {
                params: { page, limit: 10, search, status: status || undefined }
            });

            if (!data.success) throw new Error(data.message || 'Could not fetch orders');

            setOrders(Array.isArray(data.data) ? data.data : []);
            setPagination(data.pagination || {
                currentPage: page,
                totalPages: 1,
                totalOrders: Array.isArray(data.data) ? data.data.length : 0,
                limit: 10
            });
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to load orders');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(1);
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <ShoppingBag size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                            <p className="mt-1 text-sm text-gray-500">Manage customer orders and fulfillment.</p>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => fetchOrders(true)}
                    disabled={loading || refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_210px]">
                <div className="relative">
                    <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search order ID, customer name or email..."
                        className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={() => setSearchInput('')}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <select
                    value={status}
                    onChange={(event) => handleStatusChange(event.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                    <option value="">All statuses</option>
                    {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h2 className="font-semibold text-gray-900">All orders</h2>
                    <span className="text-sm text-gray-500">{pagination.totalOrders ?? orders.length} orders</span>
                </div>

                {loading ? (
                    <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-500">
                        <LoaderCircle size={22} className="animate-spin text-indigo-600" />
                        Loading orders...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                        <PackageSearch size={36} className="text-gray-300" />
                        <p className="mt-3 font-semibold text-gray-900">No orders found</p>
                        <p className="mt-1 text-sm text-gray-500">Try changing your search or filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3.5 font-semibold">Order ID</th>
                                        <th className="px-5 py-3.5 font-semibold">Customer</th>
                                        <th className="px-5 py-3.5 font-semibold">Date</th>
                                        <th className="px-5 py-3.5 font-semibold">Items</th>
                                        <th className="px-5 py-3.5 font-semibold">Total</th>
                                        <th className="px-5 py-3.5 font-semibold">Payment</th>
                                        <th className="px-5 py-3.5 font-semibold">Status</th>
                                        <th className="px-5 py-3.5 text-right font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="transition hover:bg-gray-50/70">
                                            <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">{shortId(order._id)}</td>
                                            <td className="px-5 py-4">
                                                <p className="max-w-52 truncate font-medium text-gray-900">
                                                    {order.user?.name || order.shippingAddress?.fullName || 'Customer'}
                                                </p>
                                                <p className="mt-1 max-w-52 truncate text-xs text-gray-500">{order.user?.email || '—'}</p>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">{order.orderItems?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0}</td>
                                            <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">{money(order.totalAmount)}</td>
                                            <td className="px-5 py-4">
                                                <p className="text-gray-800">{order.paymentMethod || '—'}</p>
                                                <p className={`mt-1 text-xs ${order.isPaid ? 'text-green-700' : 'text-amber-700'}`}>{order.isPaid ? 'Paid' : 'Unpaid'}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[order.orderStatus] || 'bg-gray-100 text-gray-700 ring-gray-500/20'}`}>
                                                    {order.orderStatus || 'Processing'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    to={`/admin/orders/${order._id}`}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                                >
                                                    <Eye size={15} /> View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-500">
                                Page {pagination.currentPage || page} of {Math.max(1, pagination.totalPages || 1)}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <button
                                    type="button"
                                    disabled={page >= (pagination.totalPages || 1)}
                                    onClick={() => setPage((current) => current + 1)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Orders;