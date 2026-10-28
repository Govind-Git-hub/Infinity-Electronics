
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    ChevronDown,
    CircleHelp,
    CreditCard,
    Heart,
    Package,
    RotateCcw,
    UserRound,
    MessageCircle,
    Search,
} from 'lucide-react';

const faqs = [
    {
        category: 'Orders & Delivery',
        icon: Package,
        questions: [
            {
                question: 'How do I track my order?',
                answer: (
                    <>
                        Open your <strong>Profile → Orders</strong> section to view
                        your orders and their current status. Select an order to
                        see its available details.
                    </>
                ),
            },
            {
                question: 'Where can I find my order details?',
                answer: (
                    <>
                        Visit your <strong>Profile</strong> and open the Orders
                        section. Select an order to view its details and status.
                    </>
                ),
            },
            {
                question: 'What is your shipping policy?',
                answer:
                    'Our shipping policy and estimated delivery details will be published here once finalized.',
            },
        ],
    },
    {
        category: 'Payments',
        icon: CreditCard,
        questions: [
            {
                question: 'How do I pay for my order?',
                answer: (
                    <>
                        Proceed to checkout and use <strong>Razorpay</strong> to
                        complete your payment. Follow the payment instructions
                        displayed during checkout.
                    </>
                ),
            },
            {
                question: 'What if my payment fails?',
                answer: (
                    <>
                        Check your order status in your Profile → Orders before
                        trying again. If you need assistance, please{' '}
                        <Link
                            to="/contact"
                            className="font-semibold text-[#6366F1] hover:underline"
                        >
                            contact support
                        </Link>.
                    </>
                ),
            },
        ],
    },
    {
        category: 'Account & Wishlist',
        icon: UserRound,
        questions: [
            {
                question: 'How do I manage my account?',
                answer: (
                    <>
                        Sign in and visit your{' '}
                        <Link
                            to="/profile"
                            className="font-semibold text-[#6366F1] hover:underline"
                        >
                            Profile
                        </Link>{' '}
                        to access the account features currently available.
                    </>
                ),
            },
            {
                question: 'How does the wishlist work?',
                answer: (
                    <>
                        Select the heart icon on a product to add it to your
                        wishlist. Visit your{' '}
                        <Link
                            to="/wishlist"
                            className="font-semibold text-[#6366F1] hover:underline"
                        >
                            Wishlist
                        </Link>{' '}
                        to view your saved products. Sign in if prompted.
                    </>
                ),
            },
        ],
    },
    {
        category: 'Returns & Support',
        icon: RotateCcw,
        questions: [
            {
                question: 'What is your return or refund policy?',
                answer:
                    'Our return, replacement, and refund policy details will be published here once finalized. Please contact support if you have a question about a specific order.',
            },
            {
                question: 'How can I contact support?',
                answer: (
                    <>
                        Visit our{' '}
                        <Link
                            to="/contact"
                            className="font-semibold text-[#6366F1] hover:underline"
                        >
                            Contact page
                        </Link>{' '}
                        to send us your question.
                    </>
                ),
            },
        ],
    },
];

const Help = () => {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [openFaq, setOpenFaq] = useState(null);

    const categories = ['All', ...faqs.map((item) => item.category)];

    const filteredFaqs = faqs
        .map((group) => ({
            ...group,
            questions: group.questions.filter((faq) => {
                const matchesSearch =
                    faq.question.toLowerCase().includes(search.toLowerCase()) ||
                    group.category.toLowerCase().includes(search.toLowerCase());

                return matchesSearch;
            }),
        }))
        .filter(
            (group) =>
                group.questions.length > 0 &&
                (activeCategory === 'All' ||
                    group.category === activeCategory)
        );

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-4 py-16 text-white sm:py-20">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                        <CircleHelp size={34} />
                    </div>

                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-200">
                        Help Center
                    </p>

                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
                        How can we help you?
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">
                        Find answers about orders, payments, your account,
                        wishlist, and more.
                    </p>

                    <div className="relative mx-auto mt-8 max-w-xl">
                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setOpenFaq(null);
                            }}
                            placeholder="Search for answers..."
                            aria-label="Search help questions"
                            className="w-full rounded-2xl border border-white/20 bg-white py-4 pl-12 pr-4 text-sm text-gray-900 shadow-xl outline-none transition placeholder:text-gray-400 focus:ring-4 focus:ring-white/20"
                        />
                    </div>
                </div>
            </section>

            {/* Quick links */}
            <section className="mx-auto -mt-6 max-w-6xl px-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Link
                        to="/profile"
                        className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#6366F1]">
                            <Package size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="font-bold text-gray-900">
                                My Orders
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                View order status
                            </p>
                        </div>
                        <ArrowRight
                            size={18}
                            className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#6366F1]"
                        />
                    </Link>

                    <Link
                        to="/wishlist"
                        className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-500">
                            <Heart size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="font-bold text-gray-900">
                                My Wishlist
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Find saved products
                            </p>
                        </div>
                        <ArrowRight
                            size={18}
                            className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#6366F1]"
                        />
                    </Link>

                    <Link
                        to="/contact"
                        className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <MessageCircle size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="font-bold text-gray-900">
                                Contact Support
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Get help with a question
                            </p>
                        </div>
                        <ArrowRight
                            size={18}
                            className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#6366F1]"
                        />
                    </Link>
                </div>
            </section>

            {/* FAQ */}
            <section className="mx-auto max-w-4xl px-4 py-14 sm:py-16">
                <div className="text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-[#6366F1]">
                        Frequently Asked Questions
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                        Answers to common questions
                    </h2>
                    <p className="mt-3 text-sm text-gray-500 sm:text-base">
                        Choose a topic or search to find what you need.
                    </p>
                </div>

                {/* Categories */}
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => {
                                setActiveCategory(category);
                                setOpenFaq(null);
                            }}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeCategory === category
                                    ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-200'
                                    : 'border border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:text-[#6366F1]'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="mt-10 space-y-8">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((group) => {
                            const CategoryIcon = group.icon;

                            return (
                                <div key={group.category}>
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-[#6366F1]">
                                            <CategoryIcon size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {group.category}
                                        </h3>
                                    </div>

                                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                        {group.questions.map((faq, index) => {
                                            const faqId = `${group.category}-${faq.question}`;
                                            const isOpen = openFaq === faqId;

                                            return (
                                                <div
                                                    key={faq.question}
                                                    className={
                                                        index > 0
                                                            ? 'border-t border-gray-100'
                                                            : ''
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        aria-expanded={isOpen}
                                                        onClick={() =>
                                                            setOpenFaq(
                                                                isOpen
                                                                    ? null
                                                                    : faqId
                                                            )
                                                        }
                                                        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-gray-50 sm:px-6"
                                                    >
                                                        <span className="text-sm font-semibold leading-6 text-gray-800 sm:text-base">
                                                            {faq.question}
                                                        </span>
                                                        <ChevronDown
                                                            size={20}
                                                            className={`shrink-0 text-gray-400 transition-transform ${isOpen
                                                                    ? 'rotate-180 text-[#6366F1]'
                                                                    : ''
                                                                }`}
                                                        />
                                                    </button>

                                                    {isOpen && (
                                                        <div className="px-5 pb-5 text-sm leading-7 text-gray-600 sm:px-6">
                                                            {faq.answer}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                            <Search
                                size={32}
                                className="mx-auto text-gray-400"
                            />
                            <h3 className="mt-4 font-bold text-gray-900">
                                No answers found
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Try another search term or choose a different
                                category.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setActiveCategory('All');
                                    setOpenFaq(null);
                                }}
                                className="mt-4 font-semibold text-[#6366F1] hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Bottom support CTA */}
            <section className="border-t border-gray-200 bg-white px-4 py-14">
                <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 rounded-3xl bg-indigo-50 p-7 text-center sm:flex-row sm:p-10 sm:text-left">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
                            Still need help?
                        </h2>
                        <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600">
                            If you couldn’t find your answer, get in touch
                            through our Contact page.
                        </p>
                    </div>

                    <Link
                        to="/contact"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                    >
                        Contact Us <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default Help;