import {
    ShieldCheck,
    BadgeCheck,
    Headset,
    ShoppingBag,
} from 'lucide-react';

const benefits = [
    {
        title: 'Secure Shopping',
        description:
            'Enjoy a smoother shopping experience with secure checkout options.',
        icon: ShieldCheck,
        iconColor: 'text-indigo-600',
        iconBg: 'bg-indigo-50',
    },
    {
        title: 'Quality Products',
        description:
            'Explore electronics and gadgets selected for your everyday needs.',
        icon: BadgeCheck,
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50',
    },
    {
        title: 'Customer Support',
        description:
            'Get assistance when you need help with a product or order.',
        icon: Headset,
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-50',
    },
    {
        title: 'Easy Shopping',
        description:
            'Find your favourite electronics with a simple shopping experience.',
        icon: ShoppingBag,
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-50',
    },
];

const WhyChooseUs = () => {
    return (
        <section className="bg-gray-50 px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16 lg:pb-10 lg:pt-4">
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto mb-9 max-w-2xl text-center sm:mb-12">
                    <p className="mb-2 text-sm font-bold uppercase tracking-wider text-indigo-600">
                        The Infinity Advantage
                    </p>

                    <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">
                        Why Choose Infinity Electronics?
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                        Everything you need for a simple and convenient
                        electronics shopping experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 min-[481px]:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    {benefits.map((benefit) => {
                        const Icon = benefit.icon;

                        return (
                            <div
                                key={benefit.title}
                                className="group rounded-2xl border border-gray-100 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6"
                            >
                                <div
                                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${benefit.iconBg} ${benefit.iconColor} transition duration-300 group-hover:scale-105`}
                                >
                                    <Icon size={25} strokeWidth={1.8} />
                                </div>

                                <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                                    {benefit.title}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    {benefit.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;