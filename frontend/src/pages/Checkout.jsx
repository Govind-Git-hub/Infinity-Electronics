import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
  LoaderCircle,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();
  const { cartItems, cartTotal, updateQuantity, clearCart, } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [addressLoading, setAddressLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);


  const shipping = 50;
  const tax = 0;
  const grandTotal = cartTotal + shipping + tax;

  if (authLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle
            size={38}
            className="animate-spin text-[#6366F1]"
          />

          <p className="text-sm font-medium text-gray-500">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: '/checkout',
        }}
      />
    );
  }

  if (cartItems.length === 0 && !orderPlaced) {
    return <Navigate to="/cart" replace />;
  }

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;

    setAddressForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    try {
      setSavingAddress(true);

      const response = await api.post('/auth/address', addressForm);

      if (!response.data.success) {
        toast.error(
          response.data.message ||
          'Unable to add address'
        );
        return;
      }

      const newAddress = response.data.address ||
        response.data.user?.addresses?.[response.data.user.addresses.length - 1];

      const updatedAddresses = response.data.addresses || [];

      setAddresses(updatedAddresses);

      if (newAddress) {
        setSelectedAddress(newAddress);
      } else if (updatedAddresses.length > 0) {
        setSelectedAddress(
          updatedAddresses[
          updatedAddresses.length - 1
          ]
        );
      }

      setAddressForm({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false,
      });

      setShowAddressForm(false);

      toast.success(
        'Address added successfully'
      );
    } catch (error) {
      console.error(
        'Add address error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Unable to add address'
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);

      const response = await api.get('/auth/me');

      if (response.data.success) {
        const userAddresses =
          response.data.user?.addresses || [];

        setAddresses(userAddresses);

        if (userAddresses.length > 0) {
          const defaultAddress =
            userAddresses.find(
              (address) => address.isDefault
            );

          setSelectedAddress(
            defaultAddress || userAddresses[0]
          );
        }
      }
    } catch (error) {
      console.error(
        'Fetch addresses error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Unable to load saved addresses'
      );
    } finally {
      setAddressLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    try {
      setPlacingOrder(true);

      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          country: selectedAddress.country || 'India',
        },
        paymentMethod: 'Razorpay',
      };

      // Step 1: Create the MongoDB order.
      const response = await api.post('/orders', orderData);

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Unable to place order.'
        );
      }

      const createdOrder = response.data.data;

      if (!createdOrder?._id) {
        throw new Error('Order ID was not returned by the server.');
      }

      // Step 2: Open Razorpay for this order.
      // Do NOT clear the cart or navigate here.
      await startRazorpayPayment(createdOrder);
    } catch (error) {
      console.error('Place order error:', error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Unable to place order. Please try again.'
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const startRazorpayPayment = async (createdOrder) => {
    if (!window.Razorpay) {
      toast.error('Payment gateway could not load. Please refresh and try again.');
      return;
    }

    try {
      const response = await api.post('/payment/create-order', {
        orderId: createdOrder._id
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Unable to initialize payment.'
        );
      }

      const paymentData = response.data.data;

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'Infinity Electronics',
        description: `Order #${createdOrder._id}`,
        order_id: paymentData.razorpayOrderId,

        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await api.post('/payment/verify', {
              orderId: createdOrder._id,
              razorpay_order_id:
                paymentResponse.razorpay_order_id,
              razorpay_payment_id:
                paymentResponse.razorpay_payment_id,
              razorpay_signature:
                paymentResponse.razorpay_signature
            });

            if (!verifyResponse.data.success) {
              throw new Error(
                verifyResponse.data.message ||
                'Payment verification failed.'
              );
            }

            setOrderPlaced(true);
            
            // Clear cart and navigate only after backend verification.
            clearCart();
            toast.success('Payment successful!');

            navigate(`/order-success/${createdOrder._id}`, { replace: true });
          } catch (error) {
            toast.error(
              error.response?.data?.message ||
              error.message ||
              'Payment verification failed. Please check your order.'
            );
          }
        },

        modal: {
          ondismiss: () => {
            toast.error(
              'Payment was not completed. You can retry later.'
            );
          }
        },

        theme: {
          color: '#6366F1'
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', (event) => {
        toast.error(
          event.error?.description || 'Payment failed. Please try again.'
        );
      });

      razorpay.open();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Unable to start payment.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#6366F1]"
          >
            <ArrowLeft size={17} />
            Back to Cart
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl">
              Checkout
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Complete your order details below.
            </p>
          </div>

        </div>
      </section>

      {/* Checkout Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* Left Column */}
          <div className="space-y-6">

            {/* Shipping Address */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-[#111827]">
                    <MapPin
                      size={20}
                      className="text-[#6366F1]"
                    />
                    Shipping Address
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Select where you want your order
                    delivered.
                  </p>
                </div>

                {!showAddressForm && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowAddressForm(true)
                    }
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#6366F1] px-3 py-2 text-sm font-semibold text-[#6366F1] transition hover:bg-[#6366F1] hover:text-white"
                  >
                    <Plus size={16} />
                    Add New
                  </button>
                )}
              </div>

              {/* Loading */}
              {addressLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <LoaderCircle
                      size={20}
                      className="animate-spin text-[#6366F1]"
                    />
                    Loading saved addresses...
                  </div>
                </div>
              ) : (
                <>
                  {/* Saved Addresses */}
                  {addresses.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {addresses.map((address) => {
                        const isSelected =
                          selectedAddress?._id ===
                          address._id;

                        return (
                          <button
                            key={address._id}
                            type="button"
                            onClick={() =>
                              setSelectedAddress(
                                address
                              )
                            }
                            className={`w-full rounded-xl border p-4 text-left transition ${isSelected
                              ? 'border-[#6366F1] bg-[#6366F1]/5 ring-1 ring-[#6366F1]'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            <div className="flex items-start gap-3">

                              {/* Radio */}
                              <div
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected
                                  ? 'border-[#6366F1] bg-[#6366F1]'
                                  : 'border-gray-300 bg-white'
                                  }`}
                              >
                                {isSelected && (
                                  <Check
                                    size={13}
                                    strokeWidth={3}
                                    className="text-white"
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-bold text-[#111827]">
                                    {address.fullName}
                                  </p>

                                  {address.isDefault && (
                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                      Default
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 text-sm text-gray-600">
                                  {address.phone}
                                </p>

                                <p className="mt-2 text-sm leading-5 text-gray-600">
                                  {address.street},{' '}
                                  {address.city},{' '}
                                  {address.state}{' '}
                                  -{' '}
                                  {address.pincode}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  {address.country}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* No Saved Address */}
                  {addresses.length === 0 &&
                    !showAddressForm && (
                      <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                        <MapPin
                          size={34}
                          className="mx-auto text-gray-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-[#111827]">
                          No saved addresses
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Add a shipping address to
                          continue with your order.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setShowAddressForm(true)
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5]"
                        >
                          <Plus size={17} />
                          Add Address
                        </button>
                      </div>
                    )}

                  {/* Add New Address Form */}
                  {showAddressForm && (
                    <form
                      onSubmit={handleAddAddress}
                      className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-[#111827]">
                            Add New Address
                          </h3>

                          <p className="mt-0.5 text-xs text-gray-500">
                            Enter your delivery
                            details.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setShowAddressForm(false)
                          }
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-white hover:text-gray-700"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        {/* Full Name */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                            Full Name
                          </label>

                          <input
                            type="text"
                            name="fullName"
                            value={
                              addressForm.fullName
                            }
                            onChange={
                              handleAddressChange
                            }
                            required
                            placeholder="Enter full name"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                            Phone
                          </label>

                          <input
                            type="tel"
                            name="phone"
                            value={
                              addressForm.phone
                            }
                            onChange={
                              handleAddressChange
                            }
                            required
                            placeholder="Enter phone number"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>

                        {/* Street */}
                        <div className="sm:col-span-2">
                          <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                            Street Address
                          </label>

                          <input
                            type="text"
                            name="street"
                            value={
                              addressForm.street
                            }
                            onChange={
                              handleAddressChange
                            }
                            required
                            placeholder="House no., street, area"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>

                        {/* City */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                            City
                          </label>

                          <input
                            type="text"
                            name="city"
                            value={
                              addressForm.city
                            }
                            onChange={
                              handleAddressChange
                            }
                            required
                            placeholder="Enter city"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                            State
                          </label>

                          <input
                            type="text"
                            name="state"
                            value={
                              addressForm.state
                            }
                            onChange={
                              handleAddressChange
                            }
                            required
                            placeholder="Enter state"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>

                        {/* Pincode */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                            Pincode
                          </label>

                          <input
                            type="text"
                            name="pincode"
                            value={
                              addressForm.pincode
                            }
                            onChange={
                              handleAddressChange
                            }
                            required
                            inputMode="numeric"
                            placeholder="Enter pincode"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>

                        {/* Country */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                            Country
                          </label>

                          <input
                            type="text"
                            name="country"
                            value={
                              addressForm.country
                            }
                            onChange={
                              handleAddressChange
                            }
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>

                      </div>

                      {/* Default Address */}
                      <label className="mt-4 flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={
                            addressForm.isDefault
                          }
                          onChange={
                            handleAddressChange
                          }
                          className="h-4 w-4 rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1]"
                        />

                        <span className="text-sm text-gray-600">
                          Set as default address
                        </span>
                      </label>

                      {/* Form Actions */}
                      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setShowAddressForm(false)
                          }
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={savingAddress}
                          className="flex items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingAddress && (
                            <LoaderCircle
                              size={17}
                              className="animate-spin"
                            />
                          )}

                          {savingAddress
                            ? 'Saving...'
                            : 'Save Address'}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* Payment Method */}
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-200 px-5 py-4">
                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                    <CreditCard
                      size={19}
                      className="text-[#6366F1]"
                    />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[#111827]">
                      Payment Method
                    </h2>

                    <p className="text-xs text-gray-500">
                      Choose your preferred payment method
                    </p>
                  </div>

                </div>
              </div>

              <div className="p-5">

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#6366F1] bg-indigo-50/50 p-4">

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Razorpay"
                    defaultChecked
                    className="mt-1 h-4 w-4 accent-[#6366F1]"
                  />

                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      Razorpay
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Secure online payment
                    </p>
                  </div>

                </label>

              </div>
            </section>

          </div>

          {/* Right Column */}
          <aside className="h-fit rounded-xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-24">

            {/* Summary Header */}
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                  <ShoppingBag
                    size={19}
                    className="text-[#F59E0B]"
                  />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#111827]">
                    Order Summary
                  </h2>

                  <p className="text-xs text-gray-500">
                    {cartItems.length}{' '}
                    {cartItems.length === 1
                      ? 'product'
                      : 'products'}
                  </p>
                </div>

              </div>
            </div>

            {/* Items */}
            <div className="max-h-[360px] space-y-4 overflow-y-auto p-5">

              {cartItems.map((item) => {
                const product = item.product;

                const price =
                  product.discountPrice &&
                    product.discountPrice < product.price
                    ? product.discountPrice
                    : product.price;

                const image =
                  product.images?.length > 0
                    ? product.images[0]
                    : 'https://placehold.co/120x120?text=No+Image';

                const lineTotal = price * item.quantity;

                return (
                  <div
                    key={product._id}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex gap-3">

                      {/* Product Image */}
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="min-w-0 flex-1">

                        <p className="line-clamp-2 text-sm font-semibold text-[#111827]">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          ₹
                          {Number(price).toLocaleString(
                            'en-IN'
                          )}{' '}
                          each
                        </p>

                        {/* Quantity Controls */}
                        <div className="mt-3 flex items-center justify-between gap-3">

                          <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">

                            {/* Minus */}
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  product._id,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>

                            {/* Actual Quantity */}
                            <span className="flex h-8 min-w-9 items-center justify-center border-x border-gray-300 px-2 text-sm font-semibold text-[#111827]">
                              {item.quantity}
                            </span>

                            {/* Plus */}
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  product._id,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                item.quantity >=
                                product.stock
                              }
                              className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>

                          </div>

                          {/* Line Total */}
                          <p className="shrink-0 text-sm font-bold text-[#111827]">
                            ₹
                            {Number(
                              lineTotal
                            ).toLocaleString('en-IN')}
                          </p>

                        </div>

                        {/* Stock Information */}
                        {product.stock > 0 &&
                          product.stock <= 5 && (
                            <p className="mt-2 text-xs font-medium text-[#F59E0B]">
                              Only {product.stock} left
                            </p>
                          )}

                      </div>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Pricing */}
            <div className="border-t border-gray-200 px-5 py-5">

              <div className="space-y-3">

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-[#111827]">
                    ₹
                    {Number(
                      cartTotal
                    ).toLocaleString(
                      'en-IN'
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="font-medium text-[#111827]">
                    ₹
                    {shipping.toLocaleString(
                      'en-IN'
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Tax
                  </span>

                  <span className="font-medium text-[#111827]">
                    ₹
                    {tax.toLocaleString(
                      'en-IN'
                    )}
                  </span>
                </div>

              </div>

              <div className="mt-5 border-t border-gray-200 pt-5">

                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#111827]">
                    Grand Total
                  </span>

                  <span className="text-xl font-bold text-[#111827]">
                    ₹
                    {Number(
                      grandTotal
                    ).toLocaleString(
                      'en-IN'
                    )}
                  </span>
                </div>

              </div>

              {/* Place Order */}
              {!selectedAddress && (
                <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700">
                  Please select a shipping address before
                  placing your order.
                </div>
              )}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={
                  placingOrder ||
                  !selectedAddress ||
                  cartItems.length === 0
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {placingOrder ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    Place Order
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                By placing your order, you agree
                to our terms and conditions.
              </p>

            </div>

          </aside>

        </div>
      </main>
    </div>
  );
};

export default Checkout;