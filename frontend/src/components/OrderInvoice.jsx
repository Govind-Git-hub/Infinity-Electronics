
import dayjs from 'dayjs';
import { createPortal } from 'react-dom';

const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const OrderInvoice = ({ order }) => {
    if (!order) return null;

    const address = order.shippingAddress || {};
    const items = order.orderItems || [];

    return createPortal(
        <section className="invoice-print overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Invoice Header */}
            <div className="border-b border-gray-200 p-5 sm:p-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row">
                    <div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl font-extrabold text-[#6366F1]">
                            IE
                        </div>

                        <h2 className="mt-4 text-2xl font-extrabold text-[#111827]">
                            Infinity Electronics
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Electronics for everyday life
                        </p>

                    </div>

                    <div className="sm:text-right">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6366F1]">
                            Invoice / Order Receipt
                        </p>
                        <p className="mt-3 break-all text-sm font-bold text-gray-900">
                            Order ID: {order._id}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Date:{' '}
                            {order.createdAt
                                ? dayjs(order.createdAt).format('DD MMM YYYY, hh:mm A')
                                : 'Not available'}
                        </p>

                        <span
                            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${order.isPaid
                                ? 'bg-green-50 text-green-700'
                                : 'bg-amber-50 text-amber-700'
                                }`}
                        >
                            Payment: {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-8 p-5 sm:p-8">
                {/* Billing and Order Status */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Bill To / Ship To
                        </h3>

                        <p className="mt-3 font-bold text-gray-900">
                            {address.fullName || 'Customer'}
                        </p>

                        {address.phone && (
                            <p className="mt-1 text-sm text-gray-600">
                                Phone: {address.phone}
                            </p>
                        )}

                        <div className="mt-2 space-y-1 text-sm leading-6 text-gray-600">
                            {address.street && <p>{address.street}</p>}

                            {(address.city || address.state || address.pincode) && (
                                <p>
                                    {[address.city, address.state]
                                        .filter(Boolean)
                                        .join(', ')}
                                    {address.pincode ? ` - ${address.pincode}` : ''}
                                </p>
                            )}

                            {address.country && <p>{address.country}</p>}
                        </div>

                        {!order.shippingAddress && (
                            <p className="mt-3 text-sm text-gray-500">
                                Shipping address is not available.
                            </p>
                        )}
                    </div>

                    <div className="sm:text-right">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Order Information
                        </h3>

                        <p className="mt-3 text-sm text-gray-600">
                            <span className="font-semibold text-gray-800">
                                Order status:
                            </span>{' '}
                            {order.orderStatus || 'Processing'}
                        </p>

                        <p className="mt-2 text-sm text-gray-600">
                            <span className="font-semibold text-gray-800">
                                Payment method:
                            </span>{' '}
                            {order.paymentMethod || 'Razorpay'}
                        </p>

                        {order.isPaid && order.paidAt && (
                            <p className="mt-2 text-sm text-gray-600">
                                <span className="font-semibold text-gray-800">
                                    Paid on:
                                </span>{' '}
                                {dayjs(order.paidAt).format('DD MMM YYYY, hh:mm A')}
                            </p>
                        )}
                    </div>
                </div>

                {/* Products Table */}
                <div>
                    <h3 className="mb-3 text-base font-bold text-gray-900">
                        Items Ordered
                    </h3>

                    <div className="overflow-x-auto rounded-xl border border-gray-200 print:overflow-visible">
                        <table className="w-full min-w-0 text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">#</th>
                                    <th className="px-4 py-3 font-semibold">Product</th>
                                    <th className="px-4 py-3 text-right font-semibold">
                                        Price
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold">
                                        Total
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {items.length > 0 ? (
                                    items.map((item, index) => {
                                        const price = Number(item.price || 0);
                                        const quantity = Number(item.quantity || 0);

                                        return (
                                            <tr
                                                key={item._id || `${order._id}-${index}`}
                                                className="text-gray-700"
                                            >
                                                <td className="px-4 py-4">
                                                    {index + 1}
                                                </td>

                                                <td className="max-w-[240px] whitespace-normal px-4 py-4 font-medium text-gray-900">
                                                    {item.name || 'Product'}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 text-right">
                                                    {formatCurrency(price)}
                                                </td>

                                                <td className="px-4 py-4 text-center">
                                                    {quantity}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-gray-900">
                                                    {formatCurrency(price * quantity)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-8 text-center text-gray-500"
                                        >
                                            No order items available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Price Summary */}
                <div className="flex justify-end">
                    <div className="w-full space-y-3 sm:max-w-sm">
                        <div className="flex justify-between gap-4 text-sm">
                            <span className="text-gray-500">Items Price</span>
                            <span className="font-semibold text-gray-900">
                                {formatCurrency(order.itemsPrice)}
                            </span>
                        </div>

                        <div className="flex justify-between gap-4 text-sm">
                            <span className="text-gray-500">Shipping</span>
                            <span className="font-semibold text-gray-900">
                                {Number(order.shippingPrice || 0) === 0
                                    ? 'Free'
                                    : formatCurrency(order.shippingPrice)}
                            </span>
                        </div>

                        <div className="flex justify-between gap-4 text-sm">
                            <span className="text-gray-500">Tax</span>
                            <span className="font-semibold text-gray-900">
                                {formatCurrency(order.taxPrice)}
                            </span>
                        </div>

                        <div className="border-t border-dashed border-gray-300 pt-4">
                            <div className="flex items-center justify-between gap-4">
                                <span className="font-bold text-gray-900">
                                    Grand Total
                                </span>

                                <span className="text-xl font-extrabold text-[#6366F1]">
                                    {formatCurrency(order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-6 text-center">
                    <p className="font-semibold text-gray-800">
                        Thank you for shopping with Infinity Electronics!
                    </p>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                        Please keep this receipt for your records.
                        For assistance, visit our Contact page.
                    </p>
                </div>
            </div>
        </section>,
        document.body
    );
};

export default OrderInvoice;