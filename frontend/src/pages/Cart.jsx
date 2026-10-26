import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';

import { useCart } from '../context/CartContext';

const Cart = () => {
  const {
    cartItems,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">

          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm">
            <ShoppingBag
              size={46}
              className="text-gray-400"
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#111827] sm:text-3xl">
            Your cart is empty
          </h1>

          <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
            Looks like you haven't added anything
            to your cart yet. Explore our products
            and find something you love.
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4F46E5]"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl">
            Shopping Cart
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {cartCount}{' '}
            {cartCount === 1
              ? 'item'
              : 'items'}{' '}
            in your cart
          </p>
        </div>
      </section>

      {/* Cart Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* Cart Items */}
          <div className="space-y-4">

            {cartItems.map((item) => {
              const product = item.product;

              const hasDiscount =
                product.discountPrice &&
                product.discountPrice <
                product.price;

              const price = hasDiscount
                ? product.discountPrice
                : product.price;

              const lineTotal =
                price * item.quantity;

              const image =
                product.images?.length > 0
                  ? product.images[0]
                  : 'https://placehold.co/300x300?text=No+Image';

              return (
                <div
                  key={product._id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-4">

                    {/* Product Image */}
                    <Link
                      to={`/product/${product._id}`}
                      className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-32 sm:w-32"
                    >
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    </Link>

                    {/* Product Information */}
                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">
                          {product.brand?.name && (
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#6366F1]">
                              {product.brand.name}
                            </p>
                          )}

                          <Link
                            to={`/product/${product._id}`}
                            className="mt-1 block text-sm font-semibold leading-5 text-[#111827] transition hover:text-[#6366F1] sm:text-base"
                          >
                            {product.name}
                          </Link>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              product._id
                            )
                          }
                          className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>

                      {/* Price */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-base font-bold text-[#111827]">
                          ₹
                          {Number(
                            price
                          ).toLocaleString(
                            'en-IN'
                          )}
                        </span>

                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹
                            {Number(
                              product.price
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </span>
                        )}
                      </div>

                      {/* Quantity + Line Total */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

                        <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                product._id,
                                item.quantity -
                                1
                              )
                            }
                            disabled={
                              item.quantity <=
                              1
                            }
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="flex h-9 min-w-10 items-center justify-center border-x border-gray-300 px-2 text-sm font-semibold text-[#111827]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                product._id,
                                item.quantity +
                                1
                              )
                            }
                            disabled={
                              item.quantity >=
                              product.stock
                            }
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus size={16} />
                          </button>

                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Item Total
                          </p>

                          <p className="text-base font-bold text-[#111827]">
                            ₹
                            {Number(
                              lineTotal
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </p>
                        </div>

                      </div>

                      {/* Low Stock */}
                      {product.stock > 0 &&
                        product.stock <= 5 && (
                          <p className="mt-2 text-xs font-medium text-[#F59E0B]">
                            Only{' '}
                            {
                              product.stock
                            }{' '}
                            left in stock
                          </p>
                        )}

                      {product.stock <= 0 && (
                        <p className="mt-2 text-xs font-semibold text-red-600">
                          Currently out of stock
                        </p>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}

            {/* Continue Shopping */}
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#6366F1] transition hover:text-[#4F46E5]"
            >
              <ArrowLeft size={17} />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">

            <h2 className="text-lg font-bold text-[#111827]">
              Order Summary
            </h2>

            <div className="mt-5 space-y-4">

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal
                </span>

                <span className="font-semibold text-[#111827]">
                  ₹
                  {Number(
                    cartTotal
                  ).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Shipping
                </span>

                <span className="text-sm font-medium text-gray-500">
                  Calculated at checkout
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-[#111827]">
                    Total
                  </span>

                  <span className="text-xl font-bold text-[#111827]">
                    ₹
                    {Number(
                      cartTotal
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>

            <Link
              to="/checkout"
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-[#6366F1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4F46E5]"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/shop"
              className="mt-3 flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:border-[#6366F1] hover:text-[#6366F1]"
            >
              Continue Shopping
            </Link>

          </aside>

        </div>
      </main>
    </div>
  );
};

export default Cart;