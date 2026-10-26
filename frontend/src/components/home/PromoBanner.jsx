import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import BannerImage from '../../assets/promo-tech.png';

const PromoBanner = () => {
    return (
        <section className="px-4 pt-2 pb-8 sm:px-6 sm:pt-2 lg:px-8 lg:pt-2 lg:pb-8">
            <div className="mx-auto max-w-7xl">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-gray-950 px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
                    {/* Decorative Background */}
                    <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />

                    <div className="relative grid items-center gap-8 md:grid-cols-2 lg:gap-12">
                        {/* Banner Content */}
                        <div>
                            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-100 sm:text-sm">
                                <Zap size={15} className="text-amber-300" />
                                Upgrade Your Setup
                            </span>

                            <h2 className="max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                                Upgrade Your Tech Game
                            </h2>

                            <p className="mt-4 max-w-lg text-sm leading-6 text-indigo-100 sm:text-base sm:leading-7">
                                Discover powerful electronics and everyday
                                gadgets designed to make life smarter,
                                easier, and more enjoyable.
                            </p>

                            <Link
                                to="/shop"
                                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-gray-950 transition hover:bg-amber-300 sm:px-6"
                            >
                                Shop Deals
                                <ArrowRight size={18} />
                            </Link>
                        </div>

                        {/* Banner Image */}
                        <div className="flex items-center justify-center">
                            <img
                                src={BannerImage}
                                alt="Discover new electronics and gadgets"
                                loading="lazy"
                                className="w-full max-w-md rounded-2xl object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromoBanner;