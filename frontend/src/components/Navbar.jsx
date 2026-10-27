import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search,
    Heart,
    ShoppingCart,
    User,
    Menu,
    X,
    LogOut,
    ShieldCheck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [search, setSearch] = useState('');
    const { cartCount } = useCart();
    const { wishlist } = useWishlist();
    const wishlistCount = wishlist.length;

    const isAdmin = isAuthenticated && user?.role === 'admin';

    const handleSearch = (e) => {
        e.preventDefault();

        const query = search.trim();

        setIsMenuOpen(false);

        if (!query) {
            navigate('/shop');
            return;
        }

        navigate(`/shop?search=${encodeURIComponent(query)}`);
    };

    useEffect(() => {
        setSearch(searchParams.get('search') || '');
    }, [searchParams]);

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366F1]">
                        <span className="text-lg font-bold text-white">IE</span>
                    </div>

                    <span className="text-xl font-bold text-[#111827]">
                        Infinity <span className="text-[#6366F1]">Electronics</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-8 md:flex">
                    <Link
                        to="/"
                        className="font-medium text-[#111827] transition hover:text-[#6366F1]"
                    >
                        Home
                    </Link>

                    <Link
                        to="/shop"
                        className="font-medium text-[#111827] transition hover:text-[#6366F1]"
                    >
                        Shop
                    </Link>
                </div>

                {/* Search */}
                <form
                    onSubmit={handleSearch}
                    className="mx-6 hidden max-w-md flex-1 md:flex"
                >
                    <div className="relative w-full">
                        <Search
                            size={19}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search electronics..."
                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                        />
                    </div>
                </form>

                {/* Right Actions */}
                <div className="hidden items-center gap-4 md:flex">

                    {/* Wishlist - authenticated users only */}
                    {isAuthenticated && (
                        <Link
                            to="/wishlist"
                            className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-red-500"
                            aria-label="Wishlist"
                            title="Wishlist"
                        >
                            <Heart size={22} />
                            {wishlistCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                    {wishlistCount > 99 ? '99+' : wishlistCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* Cart */}
                    <Link
                        to="/cart"
                        className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-[#6366F1]"
                        aria-label="Shopping Cart"
                    >
                        <ShoppingCart size={22} />

                        {/* Cart count */}
                        {cartCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[10px] font-bold text-white">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>

                    {/* User */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-gray-100"
                            >
                                <User size={19} />
                                <span>{user?.name || 'Profile'}</span>
                            </Link>

                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2
                                    text-sm font-semibold text-indigo-600
                                    transition hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                    <ShieldCheck size={18} />
                                    <span>Admin</span>
                                </Link>
                            )}

                            <button
                                onClick={logout}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="rounded-lg px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-gray-100"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4F46E5]"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="rounded-lg p-2 text-[#111827] hover:bg-gray-100 md:hidden"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">

                    {/* Mobile Search */}
                    <form
                        onSubmit={handleSearch}
                        className="mb-4"
                    >
                        <div className="relative">
                            <Search
                                size={19}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search electronics..."
                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-[#6366F1]"
                            />
                        </div>
                    </form>

                    <div className="flex flex-col gap-2">
                        <Link
                            to="/"
                            onClick={() => setIsMenuOpen(false)}
                            className="rounded-lg px-3 py-2 font-medium text-[#111827] hover:bg-gray-100"
                        >
                            Home
                        </Link>

                        <Link
                            to="/shop"
                            onClick={() => setIsMenuOpen(false)}
                            className="rounded-lg px-3 py-2 font-medium text-[#111827] hover:bg-gray-100"
                        >
                            Shop
                        </Link>

                        {isAuthenticated && (
                            <Link
                                to="/wishlist"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-[#111827] hover:bg-gray-100"
                            >
                                <Heart size={19} />
                                Wishlist
                                {wishlistCount > 0 && (
                                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                                        {wishlistCount > 99 ? '99+' : wishlistCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        <Link
                            to="/cart"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-[#111827] hover:bg-gray-100"
                        >
                            <ShoppingCart size={19} />
                            Cart
                            {cartCount > 0 && (
                                <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 text-xs font-bold text-white">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-[#111827] hover:bg-gray-100"
                                >
                                    <User size={19} />
                                    Profile
                                </Link>

                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 rounded-lg px-4 py-3
                                            font-semibold text-indigo-600
                                            transition hover:bg-indigo-50"
                                    >
                                        <ShieldCheck size={20} />
                                        Admin
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left font-medium text-red-600 hover:bg-red-50"
                                >
                                    <LogOut size={19} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="rounded-lg px-3 py-2 font-medium text-[#111827] hover:bg-gray-100"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="rounded-lg bg-[#6366F1] px-3 py-2 text-center font-medium text-white hover:bg-[#4F46E5]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;