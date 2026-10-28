import { Link } from 'react-router-dom';
import {
    ArrowRight,
    BadgeCheck,
    Headphones,
    Laptop,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
} from 'lucide-react';

const values = [
    {
        icon: BadgeCheck,
        title: 'Products for everyday needs',
        description:
            'Explore electronics, accessories, and useful gadgets selected for work, study, and everyday life.',
    },
    {
        icon: ShieldCheck,
        title: 'A straightforward checkout',
        description:
            'Review your cart and order details before placing an order. Online payments are supported through our integrated Razorpay checkout.',
    },
    {
        icon: Headphones,
        title: 'Help when you need it',
        description:
            'Have a question about an order or a product? Visit our Help page or get in touch through Contact.',
    },
];

const About = () => {
    return (
        <main className="min-h-[65vh] bg-gray-50">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 text-white">
                <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-medium text-indigo-50">
                            <Sparkles size={16} /> About Infinity Electronics
                        </span>
                        <h1 className="mt-5 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            Tech for the way you live.
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-indigo-100 sm:text-lg">
                            Infinity Electronics is an online destination for electronics, accessories, and everyday gadgets. Our goal is to make exploring products and placing an order clear and convenient.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                to="/shop"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                            >
                                Explore products <ArrowRight size={18} />
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center rounded-xl border border-white/40 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                            >
                                Contact us
                            </Link>
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-md items-center justify-center">
                        <div className="relative flex aspect-square w-full items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-sm">
                            <div className="absolute inset-5 rounded-[1.5rem] border border-white/15" />
                            <div className="relative flex h-40 w-40 items-center justify-center rounded-3xl bg-white text-indigo-600 shadow-xl sm:h-48 sm:w-48">
                                <Laptop size={104} strokeWidth={1.5} />
                            </div>
                            <div className="absolute bottom-7 left-7 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-lg sm:bottom-10 sm:left-10">
                                <ShoppingBag size={18} className="text-indigo-600" />
                                Everyday tech, made simple
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Intro */}
            <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Who we are</p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        A simpler way to shop for tech
                    </h2>
                    <p className="mt-5 text-base leading-7 text-gray-600 sm:text-lg">
                        Finding the right gadget should feel simple. Infinity Electronics brings products together in one place, with product details, cart management, order access, and an online checkout experience designed to help you shop with confidence.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="border-y border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">What matters to us</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Built around your shopping experience
                        </h2>
                    </div>

                    <div className="mt-10 grid gap-5 md:grid-cols-3">
                        {values.map(({ icon: Icon, title, description }) => (
                            <article
                                key={title}
                                className="rounded-2xl border border-gray-200 bg-gray-50 p-6 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                    <Icon size={24} />
                                </div>
                                <h3 className="mt-5 text-lg font-bold text-gray-900">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
                <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gray-900 p-7 text-white sm:p-10 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-2xl font-bold sm:text-3xl">Ready to find your next gadget?</h2>
                        <p className="mt-2 max-w-2xl leading-6 text-gray-300">
                            Browse the shop, save products to your wishlist, or reach out if you need help.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400"
                        >
                            Shop now <ArrowRight size={18} />
                        </Link>
                        <Link
                            to="/help"
                            className="inline-flex items-center rounded-xl border border-gray-600 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                        >
                            Help & Support
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default About;