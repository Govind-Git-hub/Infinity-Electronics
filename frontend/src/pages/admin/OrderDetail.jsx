import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, LoaderCircle, Package, MapPin, UserRound, CreditCard,
    RefreshCw, CheckCircle2, Clock3, Truck, Ban, Printer
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import OrderInvoice from '../../components/OrderInvoice';

const STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusClasses = {
    Processing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Shipped: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    Delivered: 'bg-green-50 text-green-700 ring-green-600/20',
    Cancelled: 'bg-red-50 text-red-700 ring-red-600/20'
};

const statusIcons = {
    Processing: Clock3,
    Shipped: Truck,
    Delivered: CheckCircle2,
    Cancelled: Ban
};

const money = (value) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(Number(value) || 0);

const shortId = (id) => id ? `#${String(id).slice(-8).toUpperCase()}` : '—';

const allowedNextStatuses = {
    Processing: ['Shipped', 'Cancelled'],
    Shipped: ['Delivered', 'Cancelled'],
    Delivered: [],
    Cancelled: []
};

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/orders/${id}`);
            if (!data.success || !data.data) throw new Error(data.message || 'Order not found');
            setOrder(data.data);
            setSelectedStatus(data.data.orderStatus || 'Processing');
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to load order');
            setOrder(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleStatusUpdate = async () => {
        if (!order || selectedStatus === order.orderStatus) return;

        const allowed = allowedNextStatuses[order.orderStatus] || [];

        if (!allowed.includes(selectedStatus)) {
            toast.error(`Cannot change order status from ${order.orderStatus} to ${selectedStatus}.`);
            setSelectedStatus(order.orderStatus);
            return;
        }

        if (selectedStatus === 'Cancelled') {
            setShowCancelModal(true);
            return;
        }

        confirmStatusUpdate();
    };

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-500">
                <LoaderCircle size={24} className="animate-spin text-indigo-600" />
                Loading order...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <p className="font-semibold text-gray-900">Order not found</p>
                <Link to="/admin/orders" className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    Back to orders
                </Link>
            </div>
        );
    }

    const CurrentStatusIcon = statusIcons[order.orderStatus] || Package;
    const address = order.shippingAddress || {};
    const items = order.orderItems || [];
    const nextStatuses = allowedNextStatuses[order.orderStatus] || [];

    const confirmStatusUpdate = async () => {
        if (!order || !selectedStatus || saving) return;

        try {
            setSaving(true);

            const { data } = await api.put(`/orders/${id}/status`, {
                status: selectedStatus
            });

            if (!data.success || !data.data) {
                throw new Error(data.message || 'Failed to update status');
            }

            setOrder(data.data);
            setSelectedStatus(data.data.orderStatus);
            setShowCancelModal(false);

            toast.success(data.message || 'Order status updated');
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Failed to update status'
            );

            setSelectedStatus(order.orderStatus);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/orders')}
                        aria-label="Back to orders"
                        className="mt-1 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 transition hover:bg-gray-50 hover:text-indigo-600"
                    >
                        <ArrowLeft size={19} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order {shortId(order._id)}</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Placed {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'date unavailable'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {order.isPaid && (
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4F46E5]"
                        >
                            <Printer size={16} />
                            Print Invoice
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={fetchOrder}
                        disabled={loading || saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-6">
                    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <Package size={19} className="text-indigo-600" />
                                <h2 className="font-semibold text-gray-900">Order items</h2>
                            </div>
                            <span className="text-sm text-gray-500">{items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} items</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {items.map((item, index) => (
                                <div key={item._id || `${item.product?._id || item.product}-${index}`} className="flex gap-4 p-5">
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                        {item.image || item.product?.images?.[0] ? (
                                            <img
                                                src={item.image || item.product?.images?.[0]}
                                                alt={item.name || item.product?.name || 'Product'}
                                                className="h-full w-full object-contain p-2"
                                            />
                                        ) : (
                                            <Package size={25} className="text-gray-300" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900">{item.name || item.product?.name || 'Product unavailable'}</p>
                                        <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                                        <p className="mt-2 text-sm font-medium text-gray-700">{money(item.price)} each</p>
                                    </div>
                                    <p className="whitespace-nowrap font-semibold text-gray-900">{money(Number(item.price || 0) * Number(item.quantity || 0))}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <MapPin size={19} className="text-indigo-600" />
                            <h2 className="font-semibold text-gray-900">Shipping address</h2>
                        </div>
                        <p className="font-semibold text-gray-900">{address.fullName || '—'}</p>
                        <p className="mt-1 text-sm text-gray-600">{address.street || '—'}</p>
                        <p className="text-sm text-gray-600">{[address.city, address.state, address.pincode].filter(Boolean).join(', ')}</p>
                        <p className="text-sm text-gray-600">{address.country || 'India'}</p>
                        <p className="mt-3 text-sm text-gray-600">Phone: {address.phone || '—'}</p>
                    </section>
                </div>

                <aside className="space-y-6">
                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <CurrentStatusIcon size={19} className="text-indigo-600" />
                            <h2 className="font-semibold text-gray-900">Order status</h2>
                        </div>
                        <div className="mt-4">
                            <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${statusClasses[order.orderStatus] || 'bg-gray-100 text-gray-700 ring-gray-500/20'}`}>
                                {order.orderStatus}
                            </span>
                        </div>

                        <label htmlFor="order-status" className="mb-2 mt-5 block text-sm font-medium text-gray-700">
                            Update status
                        </label>
                        <select
                            id="order-status"
                            value={selectedStatus}
                            disabled={saving || nextStatuses.length === 0}
                            onChange={(event) => setSelectedStatus(event.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                        >
                            <option value={order.orderStatus}>{order.orderStatus} (current)</option>
                            {nextStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                        <button
                            type="button"
                            onClick={handleStatusUpdate}
                            disabled={saving || selectedStatus === order.orderStatus || nextStatuses.length === 0}
                            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving && <LoaderCircle size={17} className="animate-spin" />}
                            {saving ? 'Updating...' : 'Save status'}
                        </button>
                        {nextStatuses.length === 0 && (
                            <p className="mt-3 text-xs leading-5 text-gray-500">This order is in a final state and cannot be changed.</p>
                        )}
                        {selectedStatus === 'Cancelled' && order.orderStatus !== 'Cancelled' && (
                            <p className="mt-3 text-xs leading-5 text-red-600">Cancelling restores the ordered quantities to product stock.</p>
                        )}
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <UserRound size={19} className="text-indigo-600" />
                            <h2 className="font-semibold text-gray-900">Customer</h2>
                        </div>
                        <p className="font-semibold text-gray-900">{order.user?.name || address.fullName || 'Customer'}</p>
                        <p className="mt-1 break-all text-sm text-gray-500">{order.user?.email || '—'}</p>
                        <div className="mt-4 border-t border-gray-100 pt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Payment method</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">{order.paymentMethod || '—'}</p>
                            <p className={`mt-1 text-sm ${order.isPaid ? 'text-green-700' : 'text-amber-700'}`}>
                                {order.isPaid ? 'Paid' : 'Payment not marked as paid'}
                            </p>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <CreditCard size={19} className="text-indigo-600" />
                            <h2 className="font-semibold text-gray-900">Price summary</h2>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between gap-3 text-gray-600"><span>Items subtotal</span><span>{money(order.itemsPrice)}</span></div>
                            <div className="flex justify-between gap-3 text-gray-600"><span>Shipping</span><span>{money(order.shippingPrice)}</span></div>
                            <div className="flex justify-between gap-3 text-gray-600"><span>Tax</span><span>{money(order.taxPrice)}</span></div>
                            <div className="flex justify-between gap-3 border-t border-gray-100 pt-3 text-base font-bold text-gray-900"><span>Total</span><span>{money(order.totalAmount)}</span></div>
                        </div>
                    </section>
                </aside>
            </div>

            {/* Cancelled Modal */}
            {showCancelModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
                    onClick={() => {
                        if (!saving) {
                            setShowCancelModal(false);
                            setSelectedStatus(order.orderStatus);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cancel-order-title"
                        className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <Ban size={24} />
                        </div>

                        <h2
                            id="cancel-order-title"
                            className="mt-4 text-xl font-bold text-gray-900"
                        >
                            Cancel this order?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Are you sure you want to cancel order{' '}
                            <span className="font-semibold text-gray-900">
                                {shortId(order._id)}
                            </span>
                            ? This action cannot be undone.
                        </p>

                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                            <p className="text-sm leading-5 text-amber-800">
                                The ordered product quantities will be restored to stock
                                by the backend when cancellation succeeds.
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setSelectedStatus(order.orderStatus);
                                }}
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Keep Order
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={confirmStatusUpdate}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving && (
                                    <LoaderCircle size={16} className="animate-spin" />
                                )}
                                {saving ? 'Cancelling...' : 'Yes, Cancel Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <OrderInvoice order={order} />

        </div>
    );
};

export default OrderDetail;