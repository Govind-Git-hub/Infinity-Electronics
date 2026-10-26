import { useEffect, useRef, useState } from 'react';
import {
  Loader2,
  PackageSearch,
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const requestIdRef = useRef(0);
  const loadingMoreRef = useRef(false);

  // Search
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [category, setCategory] = useState(searchParams?.get('category') || '');
  const [brand, setBrand] = useState('');

  // Sorting
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 15;
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

  // Categories & Brands
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const activeFilterCount =
    Number(Boolean(category)) +
    Number(Boolean(brand)) +
    Number(sort !== 'createdAt' || order !== 'desc');


  const handleSearchChange = (value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);

        if (value.trim()) {
          next.set('search', value);
        } else {
          next.delete('search');
        }

        return next;
      },
      { replace: true }
    );
  };

  // Fetch Products: replace on page 1, append on later pages.
  const fetchProducts = async (
    searchValue = '',
    categoryValue = '',
    brandValue = '',
    sortValue = 'createdAt',
    orderValue = 'desc',
    pageValue = 1,
    limitValue = 15,
    requestId
  ) => {
    if (pageValue === 1) {
      setLoading(true);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    } else {
      setLoadingMore(true);
      loadingMoreRef.current = true;
    }

    try {
      const response = await api.get('/products', {
        params: {
          page: pageValue,
          limit: limitValue,
          search: searchValue,
          category: categoryValue,
          brand: brandValue,
          sort: sortValue,
          order: orderValue,
        },
      });

      // Ignore responses from an outdated search/filter/page request.
      if (requestId !== requestIdRef.current) return;

      if (response.data.success) {
        const newProducts = response.data?.data || [];

        if (pageValue === 1) {
          setProducts(newProducts);
        } else {
          setProducts((previousProducts) => {
            const existingIds = new Set(previousProducts.map((product) => product._id));
            return [
              ...previousProducts,
              ...newProducts.filter((product) => !existingIds.has(product._id)),
            ];
          });
        }

        setPagination(
          response.data?.pagination || {
            currentPage: pageValue,
            totalPages: 1,
            totalProducts: newProducts.length,
          }
        );
      } else {
        toast.error(response.data.message || 'Failed to load products');
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error('Fetch products error:', error);
      if (pageValue > 1) setPage(pageValue - 1);
      toast.error(error.response?.data?.message || 'Unable to load products');
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');

      if (response.data.success) {
        setCategories(response.data?.data || []);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);

      toast.error(
        error.response?.data?.message ||
        'Unable to load categories'
      );
    }
  };

  // Fetch Brands
  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands');

      if (response.data.success) {
        setBrands(response.data?.data || []);
      }
    } catch (error) {
      console.error('Fetch brands error:', error);

      toast.error(
        error.response?.data?.message ||
        'Unable to load brands'
      );
    }
  };

  // Load Categories & Brands
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  // Search + filters + sorting + infinite pagination.
  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const timer = setTimeout(() => {
      fetchProducts(
        search.trim(),
        category,
        brand,
        sort,
        order,
        page,
        limit,
        requestId
      );
    }, 400);

    return () => {
      clearTimeout(timer);
      requestIdRef.current += 1;
    };
  }, [search, category, brand, sort, order, page]);

  // Reset the list when search, filters, or sorting changes.
  useEffect(() => {
    setPage(1);
    setProducts([]);
    setLoading(true);
    setLoadingMore(false);
    loadingMoreRef.current = false;
  }, [search, category, brand, sort, order]);

  // Load the next page when the sentinel near the bottom enters the viewport.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const hasNextPage = pagination.currentPage < pagination.totalPages;
        if (
          entry.isIntersecting &&
          !loading &&
          !loadingMoreRef.current &&
          page === pagination.currentPage &&
          hasNextPage
        ) {
          loadingMoreRef.current = true;
          setLoadingMore(true);
          setPage((currentPageValue) => currentPageValue + 1);
        }
      },
      { root: null, rootMargin: '400px 0px', threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, page, pagination.currentPage, pagination.totalPages]);

  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';

      const handleEscape = (event) => {
        if (event.key === 'Escape') {
          setIsFilterOpen(false);
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener(
          'keydown',
          handleEscape
        );
      };
    }

    document.body.style.overflow = '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterOpen]);


  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    const categoryFromUrl = searchParams.get('category') || '';

    setSearch(searchFromUrl);
    setCategory(categoryFromUrl);
  }, [searchParams]);


  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setSort('createdAt');
    setOrder('desc');
    setPage(1);
    setSearchParams({});
  };

  const hasFilters =
    search.trim() ||
    category ||
    brand ||
    sort !== 'createdAt' ||
    order !== 'desc';

  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalProducts = pagination?.totalProducts || 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Shop Title */}
            <div className="shrink-0">
              <h1 className="text-2xl font-bold text-[#111827]">
                Shop
              </h1>

              <p className="mt-0.5 text-xs text-gray-500">
                Explore our electronics & gadgets
              </p>
            </div>

            {/* Search + Filters */}
            <div className="flex w-full gap-2 lg:max-w-2xl">

              {/* Search */}
              <div className="relative flex-1">

                <Search
                  size={19}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X size={17} />
                  </button>
                )}

              </div>

              {/* Filters Button */}
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="relative flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] transition hover:border-[#6366F1] hover:text-[#6366F1]"
              >
                <SlidersHorizontal size={18} />

                <span className="hidden sm:inline">
                  Filters
                </span>

                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6366F1] px-1.5 text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* Filter Drawer */}
      <>
        {/* Overlay */}
        <div
          className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-[1px] transition-opacity duration-300 ${isFilterOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
            }`}
          onClick={() => setIsFilterOpen(false)}
        />

        {/* Drawer */}
        <aside
          className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isFilterOpen
            ? 'translate-x-0'
            : 'translate-x-full'
            }`}
        >

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#111827]">
                  Filters
                </h2>

                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6366F1] px-1.5 text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs text-gray-500">
                Refine your product search
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close filters"
            >
              <X size={21} />
            </button>

          </div>


          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">

              <div className="flex items-center justify-between">

                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Active Filters
                </span>

                <button
                  type="button"
                  onClick={() => {
                    handleClearFilters();
                  }}
                  className="text-xs font-semibold text-[#6366F1] transition hover:text-[#4F46E5]"
                >
                  Clear All
                </button>

              </div>

              <div className="mt-2 flex flex-wrap gap-2">

                {category && (
                  <span className="rounded-full bg-[#6366F1]/10 px-3 py-1 text-xs font-medium text-[#6366F1]">
                    Category
                  </span>
                )}

                {brand && (
                  <span className="rounded-full bg-[#6366F1]/10 px-3 py-1 text-xs font-medium text-[#6366F1]">
                    Brand
                  </span>
                )}

                {(sort !== 'createdAt' || order !== 'desc') && (
                  <span className="rounded-full bg-[#6366F1]/10 px-3 py-1 text-xs font-medium text-[#6366F1]">
                    Sorting
                  </span>
                )}

              </div>

            </div>
          )}


          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">

            {/* Category */}
            <div>
              <label
                htmlFor="filter-category"
                className="mb-2 block text-sm font-semibold text-[#111827]"
              >
                Category
              </label>

              <select
                id="filter-category"
                value={category}

                onChange={(e) => {
                  const value = e.target.value;

                  setCategory(value);
                  setPage(1);

                  setSearchParams(
                    (prev) => {
                      const next = new URLSearchParams(prev);

                      if (value) {
                        next.set('category', value);
                      } else {
                        next.delete('category');
                      }

                      return next;
                    },
                    { replace: true }
                  );
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
              >
                <option value="">
                  All Categories
                </option>

                {categories.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>


            {/* Brand */}
            <div className="mt-5">
              <label
                htmlFor="filter-brand"
                className="mb-2 block text-sm font-semibold text-[#111827]"
              >
                Brand
              </label>

              <select
                id="filter-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
              >
                <option value="">
                  All Brands
                </option>

                {brands.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>


            {/* Sort */}
            <div className="mt-5">
              <label
                htmlFor="filter-sort"
                className="mb-2 block text-sm font-semibold text-[#111827]"
              >
                Sort By
              </label>

              <select
                id="filter-sort"
                value={`${sort}-${order}`}
                onChange={(e) => {
                  const [newSort, newOrder] =
                    e.target.value.split('-');

                  setSort(newSort);
                  setOrder(newOrder);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
              >
                <option value="createdAt-desc">
                  Newest
                </option>

                <option value="createdAt-asc">
                  Oldest
                </option>

                <option value="name-asc">
                  Name: A to Z
                </option>

                <option value="name-desc">
                  Name: Z to A
                </option>

                <option value="price-asc">
                  Price: Low to High
                </option>

                <option value="price-desc">
                  Price: High to Low
                </option>

                <option value="ratings-desc">
                  Rating: High to Low
                </option>

                <option value="numReviews-desc">
                  Most Reviewed
                </option>
              </select>
            </div>

          </div>


          {/* Footer */}
          <div className="border-t border-gray-200 bg-white px-5 py-4">

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() => {
                  handleClearFilters();
                  setIsFilterOpen(false);
                }}
                disabled={activeFilterCount === 0}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5]"
              >
                Apply Filters
              </button>

            </div>

          </div>

        </aside>
      </>

      {/* Shop Content */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Result Information */}
        {!loading && products.length > 0 && (
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            {/* Search / Filter Context */}
            <div className="text-sm text-gray-500">
              {search ? (
                <>
                  Results for{' '}
                  <span className="font-semibold text-[#111827]">
                    "{search}"
                  </span>
                </>
              ) : (
                <span>All Products</span>
              )}
            </div>

            {/* Product Count */}
            <div className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-semibold text-[#111827]">
                {products.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-[#111827]">
                {totalProducts}
              </span>{' '}
              products
            </div>

          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-gray-200 bg-white">
            <div className="flex flex-col items-center gap-3">

              <Loader2
                size={36}
                className="animate-spin text-[#6366F1]"
              />

              <p className="text-sm font-medium text-gray-500">
                Loading products...
              </p>

            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <PackageSearch
                size={32}
                className="text-gray-400"
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#111827]">
              No products found
            </h2>

            <p className="mt-2 max-w-md text-sm text-gray-500">
              We couldn't find any products matching your
              current search or filters.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-5 rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5]"
              >
                Clear All Filters
              </button>
            )}

          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">              {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
            </div>

            {/* Infinite-scroll sentinel and status */}
            <div ref={sentinelRef} aria-hidden="true" className="h-2 w-full" />

            {loadingMore && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm font-medium text-gray-500" role="status" aria-live="polite">
                <Loader2 size={20} className="animate-spin text-[#6366F1]" />
                Loading more products...
              </div>
            )}

            {!loading && !loadingMore && currentPage >= totalPages && products.length > 0 && (
              <p className="py-8 text-center text-sm text-gray-500">
                You've seen all products.
              </p>
            )}
          </>
        )}

      </section>
    </div>
  );
};

export default Shop;