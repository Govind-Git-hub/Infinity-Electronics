import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    CheckCircle2,
    LoaderCircle,
    MapPin,
    Package,
    ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

import api from '../services/api';

const OrderSuccess = () => {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            setLoading(true);

            const response = await api.get(`/orders/${id}`);

            if (response.data.success) {
                setOrder(response.data.data);
            } else {
                toast.error(
                    response.data.message ||
                    'Unable to load order'
                );
            }
        } catch (error) {
            console.error(
                'Fetch order error:',
                error
            );

            toast.error(
                error.response?.data?.message ||
                'Unable to load order'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <LoaderCircle
                        size={40}
                        className="animate-spin text-[#6366F1]"
                    />

                    <p className="text-sm font-medium text-gray-500">
                        Loading your order...
                    </p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <Package
                        size={48}
                        className="mx-auto text-gray-400"
                    />

                    <h1 className="mt-4 text-2xl font-bold text-[#111827]">
                        Order Not Found
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        We couldn't find the order you're
                        looking for.
                    </p>

                    <Link
                        to="/shop"
                        className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5]"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

                {/* Success Header */}
                <div className="text-center">
                    <CheckCircle2
                        size={72}
                        className="mx-auto text-green-500"
                    />

                    <h1 className="mt-5 text-3xl font-bold text-[#111827]">
                        Order Placed Successfully!
                    </h1>

                    <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
                        Thank you for your purchase. Your
                        order has been received and is being
                        processed.
                    </p>

                    <div className="mt-4 inline-flex items-center rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-[#6366F1]">
                        Order ID: {order._id}
                    </div>
                </div>

                {/* Order Details */}
                <div className="mt-8 grid gap-6 lg:grid-cols-3">

                    {/* Items */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

                            <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
                                <Package
                                    size={20}
                                    className="text-[#6366F1]"
                                />

                                <h2 className="font-semibold text-[#111827]">
                                    Order Items
                                </h2>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {order.orderItems?.map(
                                    (item, index) => {
                                        const image =
                                            item.image ||
                                            item.product
                                                ?.images?.[0] ||
                                            'https://placehold.co/100x100?text=No+Image';

                                        const lineTotal =
                                            Number(item.price || 0) *
                                            Number(item.quantity || 0);

                                        return (
                                            <div
                                                key={
                                                    item.product?._id ||
                                                    `${item.name}-${index}`
                                                }
                                                className="flex gap-4 p-5"
                                            >
                                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                    <img
                                                        src={image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="line-clamp-2 text-sm font-semibold text-[#111827]">
                                                        {item.name}
                                                    </h3>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        ₹
                                                        {Number(
                                                            item.price
                                                        ).toLocaleString(
                                                            'en-IN'
                                                        )}{' '}
                                                        ×{' '}
                                                        {
                                                            item.quantity
                                                        }
                                                    </p>

                                                    <p className="mt-2 text-sm font-bold text-[#111827]">
                                                        ₹
                                                        {lineTotal.toLocaleString(
                                                            'en-IN'
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                            <h2 className="text-lg font-bold text-[#111827]">
                                Order Summary
                            </h2>

                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Items
                                    </span>

                                    <span className="font-medium text-[#111827]">
                                        ₹
                                        {Number(
                                            order.itemsPrice || 0
                                        ).toLocaleString(
                                            'en-IN'
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Shipping
                                    </span>

                                    <span className="font-medium text-[#111827]">
                                        ₹
                                        {Number(
                                            order.shippingPrice || 0
                                        ).toLocaleString(
                                            'en-IN'
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Tax
                                    </span>

                                    <span className="font-medium text-[#111827]">
                                        ₹
                                        {Number(
                                            order.taxPrice || 0
                                        ).toLocaleString(
                                            'en-IN'
                                        )}
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between gap-4">
                                        <span className="font-bold text-[#111827]">
                                            Total
                                        </span>

                                        <span className="text-xl font-bold text-[#6366F1]">
                                            ₹
                                            {Number(
                                                order.totalAmount || 0
                                            ).toLocaleString(
                                                'en-IN'
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 rounded-lg bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">
                                    Payment Method
                                </p>

                                <p className="mt-1 text-sm font-semibold text-[#111827]">
                                    {order.paymentMethod ||
                                        'Razorpay'}
                                </p>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2">
                                <MapPin
                                    size={19}
                                    className="text-[#6366F1]"
                                />

                                <h2 className="font-semibold text-[#111827]">
                                    Shipping Address
                                </h2>
                            </div>

                            <div className="mt-3 text-sm text-gray-600">
                                <p className="font-semibold text-[#111827]">
                                    {
                                        order.shippingAddress
                                            ?.fullName
                                    }
                                </p>

                                <p className="mt-1">
                                    {
                                        order.shippingAddress
                                            ?.phone
                                    }
                                </p>

                                <p className="mt-2">
                                    {
                                        order.shippingAddress
                                            ?.street
                                    }
                                    <br />
                                    {
                                        order.shippingAddress
                                            ?.city
                                    }
                                    ,{' '}
                                    {
                                        order.shippingAddress
                                            ?.state
                                    }{' '}
                                    -{' '}
                                    {
                                        order.shippingAddress
                                            ?.pincode
                                    }
                                    <br />
                                    {
                                        order.shippingAddress
                                            ?.country
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        to="/profile"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-[#111827] transition hover:border-[#6366F1] hover:text-[#6366F1]"
                    >
                        <Package size={18} />
                        My Orders
                    </Link>

                    <Link
                        to="/shop"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4F46E5]"
                    >
                        <ShoppingBag size={18} />
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;