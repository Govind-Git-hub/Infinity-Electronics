import { Link } from 'react-router-dom';
import { Heart, LoaderCircle, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { wishlist, loading } = useWishlist();

    if (authLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <LoaderCircle className="animate-spin text-indigo-600" size={36} />
                <span className="sr-only">Checking login status...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <section className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
                <Heart size={48} className="mb-4 text-gray-300" />
                <h1 className="text-2xl font-bold text-gray-900">Your wishlist</h1>
                <p className="mt-2 text-gray-600">Please log in to view and manage your wishlist.</p>
                <Link
                    to="/login"
                    className="mt-6 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                >
                    Login to continue
                </Link>
            </section>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center gap-3 text-indigo-600">
                <LoaderCircle className="animate-spin" size={32} />
                <span className="font-medium">Loading your wishlist...</span>
            </div>
        );
    }

    return (
        <main className="mx-auto min-h-[60vh] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-indigo-600">
                        <Heart size={22} className="fill-red-500 text-red-500" />
                        <span className="text-sm font-semibold uppercase tracking-wide">Saved for later</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
                    </p>
                </div>
                <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 transition hover:border-indigo-300 hover:text-indigo-600"
                >
                    <ShoppingBag size={18} />
                    Continue shopping
                </Link>
            </div>

            {wishlist.length === 0 ? (
                <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 px-5 py-16 text-center">
                    <div className="mb-4 rounded-full bg-gray-100 p-5">
                        <Heart size={36} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Your wishlist is empty</h2>
                    <p className="mt-2 max-w-md text-gray-500">
                        Save products you love by selecting the heart on any product.
                    </p>
                    <Link
                        to="/shop"
                        className="mt-6 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                    >
                        Explore products
                    </Link>
                </section>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                    {wishlist.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </main>
    );
};

export default Wishlist;