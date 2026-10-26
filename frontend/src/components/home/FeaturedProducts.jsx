import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../../services/api';
import HomeProductCard from './HomeProductCard';

const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await api.get('/products', {
                    params: {
                        isFeatured: true,
                        limit: 12,
                    },
                });

                const fetchedProducts = response.data?.data;

                setProducts(
                    Array.isArray(fetchedProducts) ? fetchedProducts : []
                );
            } catch (err) {
                console.error('Featured Products Error:', err);

                setError(
                    err.response?.data?.message ||
                    'Unable to load featured products. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <section className="bg-white px-4 pt-14 pb-6 sm:px-6 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-8">            <div className="mx-auto max-w-7xl">
            {/* Section Heading */}
            <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
                <div>
                    <p className="mb-2 text-sm font-bold uppercase tracking-wider text-indigo-600">
                        Handpicked for you
                    </p>

                    <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">
                        Featured Products
                    </h2>

                    <p className="mt-2 text-sm text-gray-500 sm:text-base">
                        Explore our top picks for your everyday tech needs.
                    </p>
                </div>

                <Link
                    to="/shop"
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 sm:gap-2"
                >
                    View All
                    <ArrowRight size={18} />
                </Link>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 min-[481px]:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse overflow-hidden rounded-2xl border border-gray-100"
                        >
                            <div className="h-44 bg-gray-100 sm:h-52" />

                            <div className="space-y-3 p-4">
                                <div className="h-4 rounded bg-gray-100" />
                                <div className="h-4 w-2/3 rounded bg-gray-100" />
                                <div className="h-10 rounded-lg bg-gray-100" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-8 text-center">
                    <p className="font-medium text-red-600">{error}</p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        Reload Page
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 px-5 py-12 text-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                        No featured products yet
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                        Featured products will appear here once they are
                        added from the admin panel.
                    </p>

                    <Link
                        to="/shop"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        Browse All Products
                        <ArrowRight size={17} />
                    </Link>
                </div>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
                <div className="grid grid-cols-1 min-[481px]:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                    {products.map((product) => (
                        <HomeProductCard
                            key={product._id}
                            product={product}
                        />
                    ))}
                </div>
            )}
        </div>
        </section>
    );
};

export default FeaturedProducts;