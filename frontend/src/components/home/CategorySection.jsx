
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers3 } from 'lucide-react';
import api from '../../services/api';

const CategorySection = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setError('');

                const response = await api.get('/categories');

                const result = Array.isArray(response.data)
                    ? response.data
                    : response.data.categories ??
                    response.data.data ??
                    [];

                setCategories(
                    result.filter((category) => category.isActive !== false)
                );
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setError('Unable to load categories right now.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-6 h-7 w-48 animate-pulse rounded bg-gray-200" />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse rounded-xl border border-gray-200 p-3"
                        >
                            <div className="aspect-square rounded-lg bg-gray-100" />
                            <div className="mx-auto mt-3 h-4 w-20 rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <p className="text-sm text-red-600">{error}</p>
            </section>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#111827] sm:text-3xl">
                        Shop by Category
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 sm:text-base">
                        Find the right tech for you
                    </p>
                </div>

                <Link
                    to="/shop"
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#4F46E5] transition hover:text-[#4338CA]"
                >
                    View All
                    <ArrowRight size={17} />
                </Link>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
                {categories.slice(0, 6).map((category) => (
                    <Link
                        key={category._id}
                        to={`/shop?category=${encodeURIComponent(category._id)}`}
                        className="group flex min-w-0 flex-col items-center rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#6366F1] hover:shadow-md sm:p-4"
                    >
                        <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                            {category.image ? (
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    loading="lazy"
                                    className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <Layers3
                                    size={36}
                                    strokeWidth={1.5}
                                    className="text-[#6366F1]"
                                />
                            )}
                        </div>

                        <h3 className="mt-3 line-clamp-2 text-center text-sm font-semibold text-[#111827] transition group-hover:text-[#4F46E5] sm:text-base">
                            {category.name}
                        </h3>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default CategorySection;