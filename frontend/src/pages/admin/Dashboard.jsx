
import { useEffect, useState } from 'react';
import {
    Package,
    ShoppingBag,
    Users,
    IndianRupee,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const currency = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
});

const dateFormat = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
});

const statusStyles = {
    Processing: 'bg-amber-100 text-amber-700',
    Shipped: 'bg-blue-100 text-blue-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700'
};

const statCards = [
    {
        key: 'totalProducts',
        title: 'Total Products',
        icon: Package,
        color: 'bg-indigo-50 text-indigo-600'
    },
    {
        key: 'totalOrders',
        title: 'Total Orders',
        icon: ShoppingBag,
        color: 'bg-amber-50 text-amber-600'
    },
    {
        key: 'totalCustomers',
        title: 'Total Customers',
        icon: Users,
        color: 'bg-emerald-50 text-emerald-600'
    },
    {
        key: 'totalRevenue',
        title: 'Delivered Revenue',
        icon: IndianRupee,
        color: 'bg-purple-50 text-purple-600',
        isCurrency: true
    }
];

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/admin/stats');

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message || 'Unable to load dashboard.'
                );
            }

            setStats(response.data.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to load dashboard statistics.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading && !stats) {
        return (
            <div className="flex min-h-64 items-center justify-center gap-3 text-gray-500">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Loading dashboard...
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-2 font-semibold text-red-700">
                    <AlertCircle size={20} />
                    Could not load dashboard
                </div>
                <p className="mt-2 text-sm text-red-600">{error}</p>
                <button
                    onClick={fetchStats}
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Overview of your Infinity Electronics store.
                    </p>
                </div>

                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? 'animate-spin' : ''}
                    />
                    Refresh
                </button>
            </div>

            {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    const value = stats?.[card.key] ?? 0;

                    return (
                        <div
                            key={card.key}
                            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-500">
                                    {card.title}
                                </p>
                                <div className={`rounded-xl p-3 ${card.color}`}>
                                    <Icon size={21} />
                                </div>
                            </div>

                            <p className="mt-4 text-2xl font-bold text-gray-900">
                                {card.isCurrency
                                    ? currency.format(value)
                                    : value.toLocaleString('en-IN')}
                            </p>
                        </div>
                    );
                })}
            </div>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                    Orders by Status
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {Object.entries(stats?.ordersByStatus || {}).map(
                        ([status, count]) => (
                            <div
                                key={status}
                                className="rounded-xl bg-gray-50 p-4"
                            >
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                        statusStyles[status] ||
                                        'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {status}
                                </span>
                                <p className="mt-3 text-2xl font-bold text-gray-900">
                                    {count}
                                </p>
                            </div>
                        )
                    )}
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-5">
                    <h2 className="text-lg font-bold text-gray-900">
                        Recent Orders
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        The latest five orders placed in your store.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-5 py-3 font-medium">Order ID</th>
                                <th className="px-5 py-3 font-medium">Customer</th>
                                <th className="px-5 py-3 font-medium">Date</th>
                                <th className="px-5 py-3 font-medium">Amount</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {stats?.recentOrders?.length ? (
                                stats.recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4 font-medium text-gray-900">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">
                                            {order.user?.name ||
                                                order.user?.email ||
                                                'Unknown customer'}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">
                                            {dateFormat.format(
                                                new Date(order.createdAt)
                                            )}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-gray-900">
                                            {currency.format(order.totalAmount)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    statusStyles[order.orderStatus] ||
                                                    'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-10 text-center text-gray-500"
                                    >
                                        No orders found yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
