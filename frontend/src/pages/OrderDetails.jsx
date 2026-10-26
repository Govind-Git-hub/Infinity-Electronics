import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Copy,
    CreditCard,
    IndianRupee,
    LoaderCircle,
    MapPin,
    Package,
    ShoppingBag,
    Truck,
    WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import api from '../services/api';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [retryingPayment, setRetryingPayment] = useState(false);

    const orderStatus = order?.orderStatus || 'Processing';
    const shortOrderId = order?._id ? String(order._id).slice(-8).toUpperCase() : '';

    const handleCopyOrderId = async () => {
        try {
            await navigator.clipboard.writeText(String(order._id));
            toast.success('Full order ID copied.');
        } catch (error) {
            console.error('Could not copy order ID:', error);
            toast.error('Could not copy the order ID.');
        }
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);

                const response = await api.get(`/orders/${id}`);

                if (response.data.success) {
                    setOrder(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch order:', error);

                toast.error(
                    error.response?.data?.message ||
                    'Failed to load order details.'
                );

                navigate('/profile?tab=orders', {
                    replace: true,
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id, navigate]);

    const handleRetryPayment = async () => {
        if (!order?._id || order.isPaid || order.orderStatus === 'Cancelled') {
            return;
        }

        if (!window.Razorpay) {
            toast.error('Payment gateway could not load. Please refresh and try again.');
            return;
        }

        try {
            setRetryingPayment(true);

            // Step 1: Initialize payment for the existing order.
            const response = await api.post('/payment/create-order', {
                orderId: order._id,
            });

            if (!response.data.success) {
                throw new Error(
                    response.data.message || 'Unable to initialize payment.'
                );
            }

            const paymentData = response.data.data;

            // Step 2: Open Razorpay checkout.
            const razorpay = new window.Razorpay({
                key: paymentData.key,
                amount: paymentData.amount,
                currency: paymentData.currency,
                name: 'Infinity Electronics',
                description: `Order #${order._id}`,
                order_id: paymentData.razorpayOrderId,

                handler: async (paymentResponse) => {
                    try {
                        // Step 3: Verify payment on the backend.
                        const verifyResponse = await api.post('/payment/verify', {
                            orderId: order._id,
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature,
                        });

                        if (!verifyResponse.data.success) {
                            throw new Error(
                                verifyResponse.data.message ||
                                'Payment verification failed.'
                            );
                        }

                        // Step 4: Fetch the latest order from the backend.
                        const latestOrder = await api.get(`/orders/${order._id}`);

                        if (latestOrder.data.success) {
                            setOrder(latestOrder.data.data);
                        }

                        toast.success('Payment successful!');
                    } catch (error) {
                        console.error('Retry payment verification error:', error);

                        toast.error(
                            error.response?.data?.message ||
                            error.message ||
                            'Payment verification failed. Please check your order.'
                        );
                    }
                },

                modal: {
                    ondismiss: () => {
                        toast.info('Payment not completed. You can try again.');
                    },
                },

                theme: {
                    color: '#6366F1',
                },
            });

            razorpay.on('payment.failed', (event) => {
                toast.error(
                    event.error?.description || 'Payment failed. Please try again.'
                );
            });

            razorpay.open();
        } catch (error) {
            console.error('Retry payment error:', error);

            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Unable to start payment.'
            );
        } finally {
            setRetryingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
                <div className="flex flex-col items-center text-center">
                    <LoaderCircle
                        size={40}
                        className="animate-spin text-[#6366F1]"
                    />

                    <p className="mt-3 text-sm font-medium text-gray-500">
                        Loading order details...
                    </p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                        <Package
                            size={30}
                            className="text-[#6366F1]"
                        />
                    </div>

                    <h1 className="mt-4 text-xl font-bold text-[#111827]">
                        Order Not Found
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        We couldn't find the order you're looking for.
                    </p>

                    <Link
                        to="/profile?tab=orders"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5]"
                    >
                        <ArrowLeft size={16} />
                        Back to My Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen min-w-0 bg-gray-50">
            <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

                {/* Back */}
                <Link
                    to="/profile?tab=orders"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#6366F1]"
                >
                    <ArrowLeft size={17} />
                    Back to My Orders
                </Link>

                {/* Page Header */}
                <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#6366F1]">
                                <Package size={21} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
                                        Order #{shortOrderId}
                                    </h1>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${orderStatus === 'Delivered' ? 'bg-green-50 text-green-700' : orderStatus === 'Shipped' ? 'bg-blue-50 text-blue-700' : orderStatus === 'Cancelled' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                                        {orderStatus}
                                    </span>
                                </div>
                                <button type="button" onClick={handleCopyOrderId} className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-[#6366F1]" title={`Copy full order ID: ${order._id}`}>
                                    <Copy size={13} /> Copy full order ID
                                </button>
                            </div>
                        </div>
                        <div className="sm:text-right">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Order Date</p>
                            <p className="mt-1 text-sm font-semibold text-[#111827]">
                                {dayjs(order.createdAt).format('DD MMM YYYY, hh:mm A')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Status & Payment */}
                <div className="mt-5 space-y-5">

                    {/* Order Status and Timeline */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Order progress</p>
                                <h2 className="mt-1 text-lg font-bold text-[#111827]">{orderStatus}</h2>
                            </div>
                            {order.isDelivered && order.deliveredAt && (
                                <div className="sm:text-right">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Delivered On</p>
                                    <p className="mt-1 text-sm font-semibold text-[#111827]">{dayjs(order.deliveredAt).format('DD MMM YYYY, hh:mm A')}</p>
                                </div>
                            )}
                        </div>

                        {orderStatus === 'Cancelled' ? (
                            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                This order has been cancelled.
                            </div>
                        ) : (
                            <div className="mt-5 rounded-2xl border border-gray-100 bg-gradient-to-b from-indigo-50/70 to-white p-4 sm:p-6">
                                {(() => {
                                    const steps = [
                                        { label: 'Placed', description: 'Order confirmed', icon: ShoppingBag },
                                        { label: 'Processing', description: 'Getting it ready', icon: Package },
                                        { label: 'Shipped', description: 'On its way', icon: Truck },
                                        { label: 'Delivered', description: 'Package arrived', icon: MapPin },
                                    ];

                                    const currentIndex =
                                        order.isDelivered || orderStatus === 'Delivered'
                                            ? 3
                                            : orderStatus === 'Shipped'
                                                ? 2
                                                : orderStatus === 'Processing'
                                                    ? 1
                                                    : 0;

                                    const isDelivered = order.isDelivered || orderStatus === 'Delivered';

                                    const progress = isDelivered ? 100 : (currentIndex / 3) * 100;

                                    return (
                                        <>
                                            {/* Header */}
                                            <div className="mb-8 flex items-center justify-between gap-3">
                                                <div>
                                                    <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                                                        Track your order
                                                    </h3>
                                                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                                        Follow your package every step of the way
                                                    </p>
                                                </div>

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                                    <Truck size={23} />
                                                </div>
                                            </div>

                                            {/* Responsive timeline: truck and progress share the same rail */}
                                            <div className="relative px-1 sm:px-3">
                                                {/* Track background */}
                                                <div className="absolute left-[12.5%] right-[12.5%] top-[23px] h-1.5 overflow-hidden rounded-full bg-gray-200">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-700 ease-in-out"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>

                                                {/* Moving truck stays aligned with the timeline step centers */}
                                                {!isDelivered && (
                                                    <div className="absolute left-[12.85%] right-[12.5%] top-[2.5px] z-20 h-10">
                                                        <div
                                                            className="absolute -translate-x-1/2 transition-[left] duration-700 ease-in-out"
                                                            style={{ left: `${(currentIndex / 3) * 100}%` }}
                                                        >
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-200 bg-white text-indigo-600 shadow-md">
                                                                <Truck size={21} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Steps */}
                                                <div className="relative grid grid-cols-4">
                                                    {steps.map((step, index) => {
                                                        const Icon = step.icon;
                                                        const completed = index < currentIndex || (index === 3 && isDelivered);
                                                        const active = index === currentIndex && !isDelivered;
                                                        return (
                                                            <div
                                                                key={step.label}
                                                                className="flex min-w-0 flex-col items-center text-center"
                                                            >
                                                                <div
                                                                    className={`relative z-10 flex h-[46px] w-[46px] items-center justify-center rounded-full border-[3px] transition-all duration-300 ${completed
                                                                        ? 'border-green-500 bg-green-500 text-white shadow-md shadow-green-100'
                                                                        : active
                                                                            ? 'border-indigo-500 bg-white text-indigo-600 shadow-lg shadow-indigo-100 ring-4 ring-indigo-100'
                                                                            : 'border-gray-200 bg-white text-gray-400'
                                                                        }`}
                                                                >
                                                                    {completed ? (
                                                                        <Check size={20} strokeWidth={3} />
                                                                    ) : (
                                                                        <Icon size={19} strokeWidth={2.2} />
                                                                    )}

                                                                    {active && (
                                                                        <span className="absolute inset-[-7px] animate-ping rounded-full border border-indigo-300 opacity-30" />
                                                                    )}
                                                                </div>

                                                                <p
                                                                    className={`mt-3 text-[11px] font-bold sm:text-sm ${completed
                                                                        ? 'text-green-700'
                                                                        : active
                                                                            ? 'text-indigo-700'
                                                                            : 'text-gray-400'
                                                                        }`}
                                                                >
                                                                    {step.label}
                                                                </p>

                                                                <p className="mt-1 hidden text-[11px] text-gray-500 sm:block">
                                                                    {step.description}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Current delivery status */}
                                            <div className="mt-7 flex items-center gap-3 rounded-xl border border-indigo-100 bg-white p-3.5 sm:p-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                                    {isDelivered ? (
                                                        <Check size={21} />
                                                    ) : (
                                                        <Truck size={21} />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {isDelivered
                                                            ? 'Your order has arrived!'
                                                            : `Your order is ${orderStatus.toLowerCase()}`}
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                                        {isDelivered
                                                            ? 'Thank you for shopping with us.'
                                                            : currentIndex === 2
                                                                ? 'Your package is on its way to you.'
                                                                : currentIndex === 1
                                                                    ? 'We are preparing your items for shipment.'
                                                                    : 'We have received your order and are getting started.'}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold sm:text-xs ${isDelivered
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-indigo-50 text-indigo-700'
                                                        }`}
                                                >
                                                    {isDelivered ? 'Complete' : `${Math.round(progress)}%`}
                                                </span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Prominent payment reminder for unpaid orders */}
                    {!order.isPaid && orderStatus !== 'Cancelled' && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600">
                                        <CreditCard size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="font-bold text-amber-900">Payment pending</h2>
                                        <p className="mt-1 text-sm text-amber-800">
                                            ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')} · Pay securely with Razorpay.
                                        </p>
                                        <p className="mt-1 text-xs text-amber-700">Your order will remain unpaid until payment is verified.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRetryPayment}
                                    disabled={retryingPayment}
                                    aria-busy={retryingPayment}
                                    className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {retryingPayment ? <><LoaderCircle size={18} className="animate-spin" /> Initializing Payment...</> : <><CreditCard size={18} /> Pay Now</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Payment & Delivery Information */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        {/* Payment Status */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${order.isPaid
                                        ? 'bg-green-50 text-green-600'
                                        : 'bg-amber-50 text-amber-600'
                                        }`}
                                >
                                    <CreditCard size={19} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Payment Status
                                    </p>

                                    <p
                                        className={`mt-1 text-sm font-bold ${order.isPaid
                                            ? 'text-green-600'
                                            : 'text-amber-600'
                                            }`}
                                    >
                                        {order.isPaid ? 'Paid' : 'Pending'}
                                    </p>

                                    {order.isPaid && order.paidAt && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            {dayjs(order.paidAt).format(
                                                'DD MMM YYYY, hh:mm A'
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#6366F1]">
                                    <WalletCards size={19} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Payment Method
                                    </p>

                                    <p className="mt-1 truncate text-sm font-bold text-[#111827]">
                                        {order.paymentMethod || 'Razorpay'}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Online Payment
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Status */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${order.isDelivered
                                        ? 'bg-green-50 text-green-600'
                                        : 'bg-gray-100 text-gray-500'
                                        }`}
                                >
                                    <Truck size={19} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Delivery Status
                                    </p>

                                    <p
                                        className={`mt-1 text-sm font-bold ${order.isDelivered
                                            ? 'text-green-600'
                                            : 'text-gray-700'
                                            }`}
                                    >
                                        {order.isDelivered
                                            ? 'Delivered'
                                            : 'Not Delivered'}
                                    </p>

                                    {order.isDelivered && order.deliveredAt && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Delivered successfully
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Total */}
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#6366F1] shadow-sm">
                                    <IndianRupee size={19} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Order Total
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-[#111827]">
                                        ₹
                                        {Number(
                                            order.totalAmount || 0
                                        ).toLocaleString('en-IN')}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Final amount
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Order Items */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        {/* Section Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="text-base font-bold text-[#111827] sm:text-lg">
                                    Order Items
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                    {order.orderItems?.length || 0}{' '}
                                    {order.orderItems?.length === 1
                                        ? 'product'
                                        : 'products'}{' '}
                                    •{' '}
                                    {order.orderItems?.reduce(
                                        (total, item) =>
                                            total + Number(item.quantity || 0),
                                        0
                                    ) || 0}{' '}
                                    {(
                                        order.orderItems?.reduce(
                                            (total, item) =>
                                                total + Number(item.quantity || 0),
                                            0
                                        ) || 0
                                    ) === 1
                                        ? 'item'
                                        : 'items'}
                                </p>
                            </div>

                            <Package
                                size={20}
                                className="text-gray-400"
                            />
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-gray-100">
                            {order.orderItems?.map((item, index) => {
                                const itemPrice = Number(item.price || 0);
                                const itemQuantity = Number(item.quantity || 0);
                                const itemTotal = itemPrice * itemQuantity;

                                return (
                                    <div
                                        key={item._id || `${order._id}-${index}`}
                                        className="min-w-0 px-3 py-4 sm:px-6 sm:py-5">
                                        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                                            {/* Product Image */}

                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 sm:h-24 sm:w-24">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <Package
                                                        size={28}
                                                        className="text-gray-300"
                                                    />
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#111827] sm:text-base">
                                                    {item.product?._id || item.product?.id ? (
                                                        <Link className="transition hover:text-[#6366F1]" to={`/product/${item.product._id || item.product.id}`}>
                                                            {item.name || 'Product'}
                                                        </Link>
                                                    ) : (item.name || 'Product')}
                                                </h3>

                                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 sm:text-sm">
                                                    <span>
                                                        ₹
                                                        {itemPrice.toLocaleString(
                                                            'en-IN'
                                                        )}{' '}
                                                        each
                                                    </span>

                                                    <span className="text-gray-300">
                                                        •
                                                    </span>

                                                    <span>
                                                        Qty: {itemQuantity}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Item Total */}
                                            <div className="min-w-0 shrink-0 text-right">
                                                <p className="text-xs font-medium text-gray-400">
                                                    Total
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-[#111827] sm:text-base">
                                                    ₹
                                                    {itemTotal.toLocaleString(
                                                        'en-IN'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Shipping Address & Price Summary */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                        {/* Shipping Address */}
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
                            <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                                <h2 className="text-base font-bold text-[#111827] sm:text-lg">
                                    Shipping Address
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                    Delivery information for this order
                                </p>
                            </div>

                            <div className="p-5 sm:p-6">
                                {order.shippingAddress ? (
                                    <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-5">                                        {/* Name */}
                                        <div>
                                            <p className="text-sm font-bold text-[#111827]">
                                                {order.shippingAddress.fullName}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                {order.shippingAddress.phone}
                                            </p>
                                        </div>

                                        {/* Address */}
                                        <div className="mt-4 min-w-0 space-y-1 break-words text-sm leading-6 text-gray-600">
                                            <p>{order.shippingAddress.street}</p>

                                            <p>
                                                {order.shippingAddress.city},{' '}
                                                {order.shippingAddress.state}{' '}
                                                - {order.shippingAddress.pincode}
                                            </p>

                                            <p>
                                                {order.shippingAddress.country || 'India'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center">
                                        <p className="text-sm text-gray-500">
                                            Shipping address is not available.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-5 py-4">
                                <h2 className="text-base font-bold text-[#111827] sm:text-lg">
                                    Price Summary
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Complete order amount
                                </p>
                            </div>

                            <div className="p-5">
                                <div className="space-y-3">

                                    {/* Items Price */}
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <span className="text-gray-500">
                                            Items Price
                                        </span>

                                        <span className="font-semibold text-[#111827]">
                                            ₹
                                            {Number(
                                                order.itemsPrice || 0
                                            ).toLocaleString('en-IN')}
                                        </span>
                                    </div>

                                    {/* Shipping */}
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <span className="text-gray-500">
                                            Shipping
                                        </span>

                                        <span className="font-semibold text-[#111827]">
                                            {Number(order.shippingPrice || 0) === 0
                                                ? 'Free'
                                                : `₹${Number(
                                                    order.shippingPrice
                                                ).toLocaleString('en-IN')}`}
                                        </span>
                                    </div>

                                    {/* Tax */}
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <span className="text-gray-500">
                                            Tax
                                        </span>

                                        <span className="font-semibold text-[#111827]">
                                            ₹
                                            {Number(
                                                order.taxPrice || 0
                                            ).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="my-4 border-t border-dashed border-gray-200" />

                                {/* Total */}
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-bold text-[#111827]">
                                        Total Amount
                                    </span>

                                    <span className="text-xl font-bold text-[#6366F1]">
                                        ₹
                                        {Number(
                                            order.totalAmount || 0
                                        ).toLocaleString('en-IN')}
                                    </span>
                                </div>

                                {/* Payment Status */}
                                <div
                                    className={`mt-4 flex items-center justify-between rounded-xl px-3.5 py-3 ${order.isPaid
                                        ? 'bg-green-50'
                                        : 'bg-amber-50'
                                        }`}
                                >
                                    <span
                                        className={`text-xs font-semibold ${order.isPaid
                                            ? 'text-green-700'
                                            : 'text-amber-700'
                                            }`}
                                    >
                                        Payment
                                    </span>

                                    <span
                                        className={`text-xs font-bold ${order.isPaid
                                            ? 'text-green-700'
                                            : 'text-amber-700'
                                            }`}
                                    >
                                        {order.isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Details Actions */}
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <h2 className="text-sm font-bold text-[#111827]">Need anything else?</h2>
                                <p className="mt-1 text-sm leading-5 text-gray-500">View your other orders or continue shopping.</p>
                            </div>
                            <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
                                <Link
                                    to="/profile?tab=orders"
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#6366F1] hover:bg-indigo-50 hover:text-[#6366F1] sm:w-auto"
                                >
                                    <ArrowLeft size={17} /> My Orders
                                </Link>
                                <Link
                                    to="/shop"
                                    className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition sm:w-auto ${order.isPaid ? 'bg-[#6366F1] text-white hover:bg-[#4F46E5]' : 'border border-gray-200 bg-white text-gray-700 hover:border-[#6366F1] hover:bg-indigo-50 hover:text-[#6366F1]'}`}
                                >
                                    <ShoppingBag size={17} /> Continue Shopping <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>



            </div>
        </div>
    );
};

export default OrderDetails;