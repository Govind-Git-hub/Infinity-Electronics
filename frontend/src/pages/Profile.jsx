import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  LoaderCircle,
  Pencil,
  Save,
  X,
  ShoppingBag,
  CalendarDays,
  ChevronRight,
  Plus,
  Phone,
  Trash2,
  Check,
  ArrowRight,
  CreditCard,
  WalletCards,
  Truck,
} from 'lucide-react';
import dayjs from 'dayjs';
import { toast } from 'sonner';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, loading, updateUser, } = useAuth();
  const searchParams = new URLSearchParams(window?.location?.search);

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFetched, setOrdersFetched] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [settingDefaultAddressId, setSettingDefaultAddressId] = useState(null);
  const [deleteAddress, setDeleteAddress] = useState(null);

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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
  });

  // Profile
  const handleEditProfile = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      avatar: user.avatar || '',
    });

    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        '/auth/profile',
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          avatar: formData.avatar.trim(),
        }
      );

      if (!response.data.success) {
        toast.error(
          response.data.message ||
          'Unable to update profile'
        );
        return;
      }

      updateUser(response.data.user);

      setIsEditing(false);

      toast.success(
        'Profile updated successfully!'
      );
    } catch (error) {
      console.error(
        'Update profile error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Unable to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSetDefaultAddress = async (addressId) => {
    if (!addressId) {
      return;
    }

    try {
      setSettingDefaultAddressId(addressId);

      const response = await api.put(
        `/auth/address/${addressId}`,
        {
          isDefault: true,
        }
      );

      if (!response.data.success) {
        toast.error(
          response.data.message ||
          'Unable to set default address'
        );
        return;
      }

      const updatedAddresses = normalizeAddresses(
        response.data.addresses || []
      );

      setAddresses(updatedAddresses);

      updateUser({
        ...user,
        addresses: updatedAddresses,
      });

      toast.success('Default address updated!');
    } catch (error) {
      console.error(
        'Set default address error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Unable to set default address'
      );
    } finally {
      setSettingDefaultAddressId(null);
    }
  };

  // Order
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);

      const response = await api.get(
        '/orders/my-orders'
      );

      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        toast.error(
          response.data.message ||
          'Unable to load orders'
        );
      }
    } catch (error) {
      console.error(
        'Fetch orders error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Unable to load your orders'
      );
    } finally {
      setOrdersLoading(false);
      setOrdersFetched(true);
    }
  };

  useEffect(() => {
    if (
      activeTab === 'orders' &&
      !ordersFetched
    ) {
      fetchOrders();
    }
  }, [activeTab, ordersFetched]);

  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
    } else {
      setAddresses([]);
    }
  }, [user]);

  // Addresses
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;

    setAddressForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      fullName: address.fullName || '',
      phone: address.phone || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      country: address.country || 'India',
      isDefault: Boolean(address.isDefault),
    });

    setEditingAddressId(address._id);
    setShowAddressForm(true);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    if (!addressForm.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (!addressForm.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    if (!addressForm.street.trim()) {
      toast.error('Street address is required');
      return;
    }

    if (!addressForm.city.trim()) {
      toast.error('City is required');
      return;
    }

    if (!addressForm.state.trim()) {
      toast.error('State is required');
      return;
    }

    if (!addressForm.pincode.trim()) {
      toast.error('Pincode is required');
      return;
    }

    try {
      setSavingAddress(true);

      const response = await api.post('/auth/address',
        {
          fullName: addressForm.fullName.trim(),
          phone: addressForm.phone.trim(),
          street: addressForm.street.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          pincode: addressForm.pincode.trim(),
          country: addressForm.country.trim() || 'India',
          isDefault: addressForm.isDefault,
        }
      );

      if (!response.data.success) {
        toast.error(
          response.data.message ||
          'Unable to add address'
        );
        return;
      }

      const updatedAddresses = normalizeAddresses(
        response.data.addresses || []
      );

      setAddresses(updatedAddresses);

      updateUser({
        ...user,
        addresses: updatedAddresses,
      });

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
        'Address added successfully!'
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

  const handleCancelAddress = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);

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
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();

    if (!editingAddressId) {
      return;
    }

    if (!addressForm.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (!addressForm.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    if (!addressForm.street.trim()) {
      toast.error('Street address is required');
      return;
    }

    if (!addressForm.city.trim()) {
      toast.error('City is required');
      return;
    }

    if (!addressForm.state.trim()) {
      toast.error('State is required');
      return;
    }

    if (!addressForm.pincode.trim()) {
      toast.error('Pincode is required');
      return;
    }

    const currentAddress = addresses.find(
      (address) => address._id === editingAddressId
    );

    const isRemovingDefault =
      currentAddress?.isDefault &&
      !addressForm.isDefault;

    const anotherDefaultExists = addresses.some(
      (address) =>
        address._id !== editingAddressId &&
        address.isDefault
    );

    if (isRemovingDefault && !anotherDefaultExists) {
      toast.error(
        'At least one address must remain as the default address.'
      );
      return;
    }

    try {
      setSavingAddress(true);

      const response = await api.put(
        `/auth/address/${editingAddressId}`,
        {
          fullName: addressForm.fullName.trim(),
          phone: addressForm.phone.trim(),
          street: addressForm.street.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          pincode: addressForm.pincode.trim(),
          country:
            addressForm.country.trim() || 'India',
          isDefault: addressForm.isDefault,
        }
      );

      if (!response.data.success) {
        toast.error(
          response.data.message ||
          'Unable to update address'
        );
        return;
      }

      const updatedAddresses = normalizeAddresses(
        response.data.addresses || []
      );
      setAddresses(updatedAddresses);

      updateUser({
        ...user,
        addresses: updatedAddresses,
      });

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

      setEditingAddressId(null);
      setShowAddressForm(false);

      toast.success(
        'Address updated successfully!'
      );
    } catch (error) {
      console.error(
        'Update address error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Unable to update address'
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleConfirmDeleteAddress = () => {
    if (!deleteAddress?._id) {
      return;
    }

    handleDeleteAddress(deleteAddress._id);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!addressId) {
      return;
    }

    try {
      setDeletingAddressId(addressId);

      const response = await api.delete(
        `/auth/address/${addressId}`
      );

      if (!response.data.success) {
        toast.error(
          response.data.message ||
          'Unable to delete address'
        );
        return;
      }

      const updatedAddresses = normalizeAddresses(
        response.data.addresses || []
      );
      setAddresses(updatedAddresses);

      updateUser({
        ...user,
        addresses: updatedAddresses,
      });

      // If the deleted address was being edited,
      // close the edit form.
      if (editingAddressId === addressId) {
        setEditingAddressId(null);
        setShowAddressForm(false);

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
      }

      toast.success(
        'Address deleted successfully!'
      );
    } catch (error) {
      console.error(
        'Delete address error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Unable to delete address'
      );
    } finally {
      setDeletingAddressId(null);
      setDeleteAddress(null);
    }
  };

  const normalizeAddresses = (addressList = []) => {
    const defaultFound = addressList.some(
      (address) => address.isDefault
    );

    if (!defaultFound) {
      return addressList;
    }

    let defaultAssigned = false;

    return addressList.map((address) => {
      if (address.isDefault && !defaultAssigned) {
        defaultAssigned = true;
        return address;
      }

      return {
        ...address,
        isDefault: false,
      };
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle
            size={38}
            className="animate-spin text-[#6366F1]"
          />

          <p className="text-sm font-medium text-gray-500">
            Loading your profile...
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
        state={{ from: '/profile' }}
      />
    );
  }

  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: Package,
    },
    {
      id: 'addresses',
      label: 'Addresses',
      icon: MapPin,
    },
  ];

  return (<>
    <div className="min-h-screen bg-gray-50 py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl">
            My Account
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your profile, orders and saved
            addresses.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="min-w-0 rounded-xl border border-gray-200 bg-white p-2 shadow-sm lg:h-fit">
            <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition sm:px-4 lg:w-full lg:justify-start ${isActive
                      ? 'bg-[#6366F1] text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#111827]'
                      }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span> {tab.label} </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <section className="min-w-0">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                {!isEditing ? (
                  <>
                    {/* View Mode Header */}
                    <div className="flex flex-col gap-5 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-2xl font-bold text-[#6366F1]">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            user.name
                              ?.charAt(0)
                              ?.toUpperCase() || 'U'
                          )}
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-xl font-bold text-[#111827]">
                            {user.name}
                          </h2>

                          <p className="mt-1 break-all text-sm text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleEditProfile}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5] sm:w-auto"                      >
                        <Pencil size={17} />
                        Edit Profile
                      </button>
                    </div>

                    {/* Profile Information */}
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Full Name
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#111827]">
                          {user.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Email Address
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-[#111827]">
                          {user.email}
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Account Role
                        </p>

                        <span className="mt-1 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-[#6366F1]">
                          {user.role || 'user'}
                        </span>
                      </div>

                    </div>
                  </>
                ) : (
                  <>
                    {/* Edit Mode Header */}
                    <div className="border-b border-gray-200 pb-5">
                      <h2 className="text-xl font-bold text-[#111827]">
                        Edit Profile
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Update your account information.
                      </p>
                    </div>

                    <form
                      onSubmit={handleSaveProfile}
                      className="mt-6 space-y-5"
                    >

                      {/* Avatar Preview */}
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-2xl font-bold text-[#6366F1]">
                          {formData.avatar ? (
                            <img
                              src={formData.avatar}
                              alt="Avatar preview"
                              className="h-full w-full object-cover"
                            // onError={(e) => {
                            //   e.currentTarget.style.display =
                            //     'none';
                            // }}
                            />
                          ) : (
                            formData.name
                              ?.charAt(0)
                              ?.toUpperCase() || 'U'
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#111827]">
                            Profile Avatar
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Enter an image URL below.
                          </p>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label
                          htmlFor="profile-name"
                          className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                          Name
                        </label>

                        <input
                          id="profile-name"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          htmlFor="profile-email"
                          className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                          Email
                        </label>

                        <input
                          id="profile-email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                        />
                      </div>

                      {/* Avatar URL */}
                      <div>
                        <label
                          htmlFor="profile-avatar"
                          className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                          Avatar URL
                        </label>

                        <input
                          id="profile-avatar"
                          type="url"
                          name="avatar"
                          value={formData.avatar}
                          onChange={handleChange}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                        />

                        <p className="mt-1.5 text-xs text-gray-400">
                          Image upload will be added later.
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">

                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X size={17} />
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? (
                            <>
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={17} />
                              Save Changes
                            </>
                          )}
                        </button>

                      </div>
                    </form>
                  </>
                )}

              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-[#6366F1]">
                      <Package size={20} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#111827]">
                        My Orders
                      </h2>

                      <p className="text-sm text-gray-500">
                        View your order history and order
                        details.
                      </p>
                    </div>
                  </div>

                  {orders.length > 0 && (
                    <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {orders.length}{' '}
                      {orders.length === 1
                        ? 'Order'
                        : 'Orders'}
                    </span>
                  )}
                </div>

                {/* Loading */}
                {ordersLoading && (
                  <div className="flex min-h-[260px] flex-col items-center justify-center">
                    <LoaderCircle
                      size={36}
                      className="animate-spin text-[#6366F1]"
                    />

                    <p className="mt-3 text-sm font-medium text-gray-500">
                      Loading your orders...
                    </p>
                  </div>
                )}

                {/* Empty */}
                {!ordersLoading &&
                  ordersFetched &&
                  orders.length === 0 && (
                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                        <ShoppingBag
                          size={30}
                          className="text-[#6366F1]"
                        />
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-[#111827]">
                        No Orders Yet
                      </h3>

                      <p className="mt-1 max-w-sm text-sm text-gray-500">
                        You haven't placed any orders yet.
                        Start shopping and your orders will
                        appear here.
                      </p>

                      <Link
                        to="/shop"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5]"
                      >
                        <ShoppingBag size={17} />
                        Start Shopping
                      </Link>
                    </div>
                  )}

                {/* Orders */}
                {!ordersLoading && orders.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {orders.map((order) => {
                      const itemCount =
                        order.orderItems?.reduce(
                          (total, item) =>
                            total + Number(item.quantity || 0),
                          0
                        ) || 0;

                      const status =
                        order.orderStatus || 'Processing';

                      const statusConfig = {
                        Processing: {
                          bg: 'bg-amber-50',
                          text: 'text-amber-700',
                          border: 'border-amber-200',
                          dot: 'bg-amber-500',
                        },
                        Shipped: {
                          bg: 'bg-blue-50',
                          text: 'text-blue-700',
                          border: 'border-blue-200',
                          dot: 'bg-blue-500',
                        },
                        Delivered: {
                          bg: 'bg-green-50',
                          text: 'text-green-700',
                          border: 'border-green-200',
                          dot: 'bg-green-500',
                        },
                        Cancelled: {
                          bg: 'bg-red-50',
                          text: 'text-red-700',
                          border: 'border-red-200',
                          dot: 'bg-red-500',
                        },
                      };

                      const currentStatus =
                        statusConfig[status] || statusConfig.Processing;

                      return (
                        <div
                          key={order._id}
                          className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-md"
                        >
                          {/* Order Header */}
                          <div className="min-w-0 border-b border-gray-100 bg-gray-50/70 px-3 py-4 sm:px-5">
                            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Order ID
                                  </p>

                                  <span className="break-all text-sm font-bold text-[#111827]">
                                    #{order._id}
                                  </span>
                                </div>

                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                  <span>
                                    {dayjs(order.createdAt).format(
                                      'DD MMM YYYY, hh:mm A'
                                    )}
                                  </span>

                                  <span className="hidden text-gray-300 sm:inline">
                                    •
                                  </span>

                                  <span>
                                    {itemCount}{' '}
                                    {itemCount === 1
                                      ? 'Item'
                                      : 'Items'}
                                  </span>
                                </div>
                              </div>

                              {/* Status */}
                              <span
                                className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot}`}
                                />

                                {status}
                              </span>
                            </div>
                          </div>

                          {/* Order Body */}
                          <div className="p-4 sm:p-5">
                            {/* Status & Payment Info */}
                            <div className="mb-5 grid grid-cols-1 gap-3 border-b border-gray-100 pb-5 sm:grid-cols-2 lg:grid-cols-4">
                              {/* Order Status */}
                              <div className="rounded-xl bg-gray-50 p-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-[#6366F1]">
                                    <Package size={16} />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                      Order Status
                                    </p>

                                    <p
                                      className={`mt-0.5 truncate text-sm font-semibold ${currentStatus.text}`}
                                    >
                                      {status}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Status */}
                              <div className="rounded-xl bg-gray-50 p-3.5">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${order.isPaid
                                      ? 'bg-green-50 text-green-600'
                                      : 'bg-amber-50 text-amber-600'
                                      }`}
                                  >
                                    <CreditCard size={16} />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                      Payment
                                    </p>

                                    <p
                                      className={`mt-0.5 text-sm font-semibold ${order.isPaid
                                        ? 'text-green-600'
                                        : 'text-amber-600'
                                        }`}
                                    >
                                      {order.isPaid ? 'Paid' : 'Pending'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Method */}
                              <div className="rounded-xl bg-gray-50 p-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <WalletCards size={16} />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                      Payment Method
                                    </p>

                                    <p className="mt-0.5 truncate text-sm font-semibold text-[#111827]">
                                      {order.paymentMethod || 'Razorpay'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Delivery Status */}
                              <div className="rounded-xl bg-gray-50 p-3.5">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${order.isDelivered
                                      ? 'bg-green-50 text-green-600'
                                      : 'bg-gray-100 text-gray-500'
                                      }`}
                                  >
                                    <Truck size={16} />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                      Delivery
                                    </p>

                                    <p
                                      className={`mt-0.5 text-sm font-semibold ${order.isDelivered
                                        ? 'text-green-600'
                                        : 'text-gray-600'
                                        }`}
                                    >
                                      {order.isDelivered
                                        ? 'Delivered'
                                        : 'Not Delivered'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex min-w-0 flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
                              {/* Product Preview */}
                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-start gap-3 sm:gap-4">                                  {/* Product Images */}
                                  <div className="flex shrink-0 -space-x-2 sm:-space-x-3">                                    {order.orderItems?.slice(0, 4).map((item, index) => (
                                    <div
                                      key={item._id || `${order._id}-${index}`}
                                      className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-gray-100 shadow-sm sm:h-14 sm:w-14"
                                      title={item.name}
                                    >
                                      {item.image ? (
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="h-full w-full object-contain"
                                        />
                                      ) : (
                                        <Package
                                          size={20}
                                          className="text-gray-400"
                                        />
                                      )}
                                    </div>
                                  ))}

                                    {order.orderItems?.length > 4 && (
                                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-white bg-gray-100 text-xs font-bold text-gray-600 shadow-sm">
                                        +{order.orderItems.length - 4}
                                      </div>
                                    )}
                                  </div>

                                  {/* Product Information */}
                                  <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-[#111827]">
                                      {order.orderItems?.length > 0
                                        ? order.orderItems
                                          .slice(0, 2)
                                          .map((item) => item.name)
                                          .join(', ')
                                        : 'Order Items'}

                                      {order.orderItems?.length > 2 && (
                                        <span className="font-medium text-gray-500">
                                          {' '}
                                          +{order.orderItems.length - 2}{' '}
                                          {order.orderItems.length - 2 === 1
                                            ? 'more product'
                                            : 'more products'}
                                        </span>
                                      )}
                                    </p>

                                    <p className="mt-1.5 text-xs text-gray-500">
                                      {order.orderItems?.length || 0}{' '}
                                      {order.orderItems?.length === 1
                                        ? 'product'
                                        : 'products'}
                                      {' • '}
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
                                </div>
                              </div>

                              {/* Total + Action */}
                              <div className="flex min-w-0 flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between lg:min-w-[280px] lg:border-t-0 lg:pt-0">                                <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                  Order Total
                                </p>

                                <p className="mt-1 text-lg font-bold text-[#111827]">
                                  ₹
                                  {Number(order.totalAmount || 0).toLocaleString('en-IN')}
                                </p>
                              </div>

                                <Link
                                  to={`/orders/${order._id}`}
                                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5] sm:w-auto"
                                >
                                  View Details
                                  <ArrowRight size={16} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-[#111827]">
                      My Addresses
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Manage your saved shipping addresses
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddressId(null);
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
                      setShowAddressForm(true);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <Plus size={18} />
                    Add New Address
                  </button>
                </div>
                {showAddressForm && (
                  <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-[#111827]">
                          {editingAddressId
                            ? 'Edit Address'
                            : 'Add New Address'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {editingAddressId
                            ? 'Update your shipping address details.'
                            : 'Enter your shipping address details.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCancelAddress}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <form
                      onSubmit={
                        editingAddressId
                          ? handleUpdateAddress
                          : handleAddAddress
                      }
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Full Name */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Full Name
                          </label>

                          <input
                            type="text"
                            name="fullName"
                            value={addressForm.fullName}
                            onChange={handleAddressChange}
                            placeholder="Enter full name"
                            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Phone
                          </label>

                          <input
                            type="tel"
                            name="phone"
                            value={addressForm.phone}
                            onChange={handleAddressChange}
                            placeholder="Enter phone number"
                            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>

                        {/* Street */}
                        <div className="md:col-span-2">
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Street Address
                          </label>

                          <input
                            type="text"
                            name="street"
                            value={addressForm.street}
                            onChange={handleAddressChange}
                            placeholder="House number, street, area"
                            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>

                        {/* City */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            City
                          </label>

                          <input
                            type="text"
                            name="city"
                            value={addressForm.city}
                            onChange={handleAddressChange}
                            placeholder="Enter city"
                            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            State
                          </label>

                          <input
                            type="text"
                            name="state"
                            value={addressForm.state}
                            onChange={handleAddressChange}
                            placeholder="Enter state"
                            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>

                        {/* Pincode */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Pincode
                          </label>

                          <input
                            type="text"
                            name="pincode"
                            value={addressForm.pincode}
                            onChange={handleAddressChange}
                            placeholder="Enter pincode"
                            inputMode="numeric"
                            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>

                        {/* Country */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Country
                          </label>

                          <input
                            type="text"
                            name="country"
                            value={addressForm.country}
                            onChange={handleAddressChange}
                            placeholder="Enter country"
                            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                          />
                        </div>
                      </div>

                      {/* Default Address */}
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={addressForm.isDefault}
                          onChange={handleAddressChange}
                          className="h-4 w-4 rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1]"
                        />

                        <span className="text-sm font-medium text-gray-700">
                          Set as default address
                        </span>
                      </label>

                      {/* Actions */}
                      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={handleCancelAddress}
                          disabled={savingAddress}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                          <X size={17} />
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={savingAddress}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                          {savingAddress ? (
                            <>
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                              {editingAddressId
                                ? 'Updating...'
                                : 'Saving...'}
                            </>
                          ) : (
                            <>
                              <Save size={17} />
                              {editingAddressId
                                ? 'Update Address'
                                : 'Save Address'}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {addresses?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {addresses.map((address, index) => (
                      <div
                        key={address._id || index}
                        className={`relative overflow-hidden rounded-2xl border bg-white p-5 transition-all duration-200 ${address.isDefault
                          ? 'border-[#6366F1]/50 bg-indigo-50/30 shadow-md shadow-indigo-100'
                          : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'
                          }`}
                      >
                        {/* Default top accent */}
                        {address.isDefault && (
                          <div className="absolute inset-x-0 top-0 h-1 bg-[#6366F1]" />
                        )}

                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            {/* Address Icon */}
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${address.isDefault
                                ? 'bg-[#6366F1] text-white'
                                : 'bg-indigo-50 text-[#6366F1]'
                                }`}
                            >
                              <MapPin size={20} />
                            </div>

                            {/* Name + Phone */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="truncate text-base font-semibold text-gray-900">
                                  {address.fullName}
                                </h4>

                                {address.isDefault && (
                                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#6366F1] px-2.5 py-1 text-[11px] font-semibold text-white">
                                    <Check size={12} strokeWidth={2.5} />
                                    Default
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 truncate text-sm text-gray-500">
                                {address.phone}
                              </p>
                            </div>
                          </div>

                          {/* Edit / Delete */}
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditAddress(address)}
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-indigo-50 hover:text-[#6366F1]"
                              title="Edit address"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteAddress(address)}
                              disabled={
                                deletingAddressId === address._id
                              }
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete address"
                            >
                              {deletingAddressId === address._id ? (
                                <LoaderCircle
                                  size={17}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={17} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="my-4 border-t border-gray-100" />

                        {/* Address Details */}
                        <div className="space-y-1.5 text-sm leading-6 text-gray-600">
                          <p className="font-medium text-gray-700">
                            {address.street}
                          </p>

                          <p>
                            {address.city}, {address.state} -{' '}
                            {address.pincode}
                          </p>

                          <p>{address.country || 'India'}</p>
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">                          {address.isDefault ? (
                          <div className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-[#6366F1]">
                            <span className="truncate">
                              <Check size={13} />
                            </span>

                            Default shipping address
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleSetDefaultAddress(address._id)
                            }
                            disabled={
                              settingDefaultAddressId === address._id
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3.5 py-2 text-sm font-medium text-[#6366F1] transition hover:border-[#6366F1] hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {settingDefaultAddressId === address._id ? (
                              <>
                                <LoaderCircle
                                  size={15}
                                  className="animate-spin"
                                />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Check size={15} />
                                Set as Default
                              </>
                            )}
                          </button>
                        )}

                          <span className="text-xs text-gray-400">
                            Address {index + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <MapPin size={26} />
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-[#111827]">
                      No saved addresses
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                      Add a shipping address to make your checkout
                      faster and easier.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5]"
                    >
                      <Plus size={18} />
                      Add New Address
                    </button>
                  </div>
                )}
              </div>
            )}

          </section>
        </div>
      </div>
    </div>

    {
      deleteAddress && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm"
          onClick={() => {
            if (!deletingAddressId) {
              setDeleteAddress(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            {/* Content */}
            <div className="mt-4">
              <h3 className="text-lg font-bold text-[#111827]">
                Delete Address?
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Are you sure you want to delete this address?
                This action cannot be undone.
              </p>
            </div>

            {/* Address Preview */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">
                {deleteAddress.fullName}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {deleteAddress.street}
              </p>

              <p className="text-sm text-gray-500">
                {deleteAddress.city},{' '}
                {deleteAddress.state} -{' '}
                {deleteAddress.pincode}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteAddress(null)}
                disabled={Boolean(deletingAddressId)}
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteAddress}
                disabled={Boolean(deletingAddressId)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingAddressId ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Delete Address
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )
    }
  </>
  );

};

export default Profile;