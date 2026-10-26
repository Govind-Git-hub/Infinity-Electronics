
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
    return (
        <section className="overflow-hidden bg-gradient-to-r from-indigo-50 via-white to-violet-100">
            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16 lg:pt-4 lg:pb-4">

                {/* Hero Content */}
                <div className="relative z-10">
                    <span className="inline-flex rounded-full bg-[#6366F1] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                        Discover What's New
                    </span>

                    <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-[#111827] sm:text-5xl lg:text-6xl">
                        Next-Gen
                        <span className="block text-[#4F46E5]">
                            Electronics for
                        </span>
                        Everyone
                    </h1>

                    <p className="mt-5 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
                        Discover the latest gadgets and accessories.
                        Explore technology designed for your everyday life.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                            to="/shop"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#4338CA]"
                        >
                            Shop Now
                            <ArrowRight size={19} />
                        </Link>
                    </div>

                    <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                        <span>✓ Quality Products</span>
                        <span>✓ Easy Shopping</span>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="relative">
                    <div className="absolute inset-8 rounded-full bg-indigo-200/40 blur-3xl" />

                    <img
                        src="https://placehold.co/900x650/eeedff/4f46e5?text=Your+Electronics+Banner"
                        alt="Explore electronics and modern gadgets"
                        className="relative mx-auto aspect-[5/4] w-full max-w-xl rounded-3xl object-cover"
                    />
                </div>

            </div>
        </section>
    );
};

export default HeroSection;