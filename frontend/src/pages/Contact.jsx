import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const name = form.name.trim();
        const email = form.email.trim();
        const message = form.message.trim();

        if (!name || !email || !message) {
            toast.error('Please complete all fields.');
            return;
        }

        const subject = encodeURIComponent(`Infinity Electronics support request from ${name}`);
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        );

        // Replace this placeholder with your real support email before launch.
        const supportEmail = 'support@example.com';
        window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;

        toast.success('Your email app should open with your message ready to send.');
    };

    return (
        <main className="bg-gray-50">
            <section className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
                        We’re here to help
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        Contact Infinity Electronics
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-indigo-100 sm:text-lg">
                        Have a question about a product or order? Send us a message and we’ll help you find the right next step.
                    </p>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-5 lg:px-8">
                <div className="space-y-5 lg:col-span-2">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Get in touch</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Choose a contact option or use the form to prepare an email.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Mail size={21} />
                            </span>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-gray-900">Email support</h3>
                                <p className="mt-1 break-all text-sm text-gray-600">support@example.com</p>
                                <p className="mt-1 text-xs text-amber-700">Placeholder — replace before publishing.</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Phone size={21} />
                            </span>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-gray-900">Phone</h3>
                                <p className="mt-1 text-sm text-gray-600">Add your business phone number</p>
                                <p className="mt-1 text-xs text-amber-700">No phone number configured yet.</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Clock size={21} />
                            </span>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-gray-900">Business hours</h3>
                                <p className="mt-1 text-sm leading-6 text-gray-600">
                                    Please add your actual support hours here.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-indigo-50 p-5">
                        <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 shrink-0 text-indigo-600" size={20} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Business address</h3>
                                <p className="mt-1 text-sm leading-6 text-gray-600">
                                    Add your official business address if you want it displayed publicly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
                    >
                        <div className="mb-6">
                            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <MessageCircle size={23} />
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900">Send us a message</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Fill in the details below. Your default email application will open with the message pre-filled; it won’t be sent automatically.
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-gray-700">
                                    Your name
                                </label>
                                <input
                                    id="contact-name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    required
                                    maxLength={100}
                                    placeholder="Enter your name"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            <div>
                                <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <input
                                    id="contact-email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    required
                                    maxLength={254}
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-gray-700">
                                Message
                            </label>
                            <textarea
                                id="contact-message"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                required
                                rows={6}
                                maxLength={5000}
                                placeholder="How can we help?"
                                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                            <Send size={18} />
                            Prepare email
                        </button>

                        <p className="mt-4 text-xs leading-5 text-gray-500">
                            This form uses your device’s email application. It does not submit to a server or store your message.
                        </p>
                    </form>

                    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900">Need order help?</h3>
                            <p className="mt-1 text-sm text-gray-600">Visit your profile to review your orders.</p>
                        </div>
                        <Link
                            to="/profile?tab=orders"
                            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                        >
                            View my orders
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Contact;