
import { Link } from 'react-router-dom';
import { Home, ShoppingBag, SearchX, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        {/* 404 Illustration */}
        <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-indigo-100" />
          <div className="absolute inset-4 rounded-full bg-indigo-50" />
          <SearchX
            size={76}
            strokeWidth={1.5}
            className="relative text-[#6366F1]"
          />
          <span className="absolute -right-2 top-2 rounded-xl bg-[#F59E0B] px-3 py-1.5 text-sm font-bold text-white shadow-md">
            404
          </span>
        </div>

        {/* Message */}
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#6366F1]">
          Page not found
        </p>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Oops! This page is missing.
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-gray-600">
          The page you’re looking for may have been moved, deleted,
          or the link might be incorrect. Let’s get you back to shopping.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          >
            <Home size={19} />
            Back to Home
          </Link>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <ShoppingBag size={19} />
            Explore Shop
          </Link>
        </div>

        {/* Secondary navigation */}
        <div className="mt-10 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            Need help finding something?
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium">
            <Link
              to="/contact"
              className="text-[#6366F1] transition hover:text-indigo-800"
            >
              Contact Support
            </Link>

            <Link
              to="/help"
              className="text-[#6366F1] transition hover:text-indigo-800"
            >
              Help & Support
            </Link>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1 text-gray-600 transition hover:text-gray-900"
            >
              <ArrowLeft size={15} />
              Go back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotFound;