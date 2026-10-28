const Footer = () => {
    return (
        <footer className="bg-[#111827] text-gray-300">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">

                    {/* Logo / Brand */}
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366F1]">
                                <span className="font-bold text-white">IE</span>
                            </div>

                            <span className="text-xl font-bold text-white">
                                Infinity <span className="text-[#6366F1]">Electronics</span>
                            </span>
                        </div>

                        <p className="max-w-sm text-sm leading-6 text-gray-400">
                            Your trusted destination for quality electronics,
                            gadgets, and technology products.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                            Quick Links
                        </h3>

                        <div className="flex flex-col gap-3 text-sm">
                            <a href="/" className="transition hover:text-[#6366F1]">
                                Home
                            </a>

                            <a href="/shop" className="transition hover:text-[#6366F1]">
                                Shop
                            </a>

                            <a href="/about" className="transition hover:text-[#6366F1]">
                                About
                            </a>

                            <a href="/contact" className="transition hover:text-[#6366F1]">
                                Contact
                            </a>
                        </div>
                    </div>

                    {/* Customer Support */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                            Customer Support
                        </h3>

                        <div className="flex flex-col gap-3 text-sm">
                            <a href="/profile" className="transition hover:text-[#6366F1]">
                                My Account
                            </a>

                            <a href="/cart" className="transition hover:text-[#6366F1]">
                                My Cart
                            </a>

                            <a href="/orders" className="transition hover:text-[#6366F1]">
                                My Orders
                            </a>

                            <a href="/help" className="transition hover:text-[#6366F1]">
                                Help & Support
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 border-t border-gray-700 pt-6 text-center">
                    <p className="text-sm text-gray-400">
                        © 2026 Infinity Electronics. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;