import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, } from 'swiper/modules';
import {
  ArrowLeft,
  Minus,
  PackageSearch,
  Plus,
  ShoppingCart,
  Star,
} from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const RatingStars = ({ rating = 0 }) => {
  const value = Math.min(5, Math.max(0, Number(rating) || 0));

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.min(
          100,
          Math.max(0, (value - index) * 100)
        );

        return (
          <span
            key={index}
            className="relative inline-block h-4 w-4"
          >
            <Star
              size={16}
              className="absolute inset-0 text-gray-300"
            />

            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fill}%` }}
            >
              <Star
                size={16}
                className="max-w-none fill-[#F59E0B] text-[#F59E0B]"
              />
            </span>
          </span>
        );
      })}
    </div>
  );
};


const ProductDetail = () => {
  const { id } = useParams();
  const { cartItems, addToCart, updateQuantity, } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const cartItem = cartItems.find(
    (item) => item.product._id === product?._id
  );

  const isInCart = Boolean(cartItem);
  const cartQuantity = cartItem?.quantity || 0;

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/products/${id}`);

      if (response.data.success) {
        setProduct(response.data.data);
        setQuantity(1);
      } else {
        toast.error(
          response.data.message ||
          'Failed to load product'
        );
      }
    } catch (error) {
      console.error(
        'Fetch product error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Unable to load product'
      );

      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setThumbsSwiper(null);
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product?._id || !product?.category?._id) {
      setRelatedProducts([]);
      return;
    }

    let isActive = true;

    const fetchRelatedProducts = async () => {
      try {
        const response = await api.get('/products', {
          params: {
            category: product.category._id,
            limit: 6,
          },
        });

        if (isActive) {
          const related = (response.data.data || [])
            .filter((item) => item._id !== product._id)
            .slice(0, 4);

          setRelatedProducts(related);
        }
      } catch (error) {
        if (isActive) {
          setRelatedProducts([]);
        }
      }
    };

    fetchRelatedProducts();

    return () => {
      isActive = false;
    };
  }, [product?._id, product?.category?._id]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gray-50">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#6366F1]" />

            <p className="text-sm font-medium text-gray-500">
              Loading product...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not Found

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-gray-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
            <PackageSearch
              size={40}
              className="text-gray-400"
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#111827]">
            Product Not Found
          </h1>

          <p className="mt-2 max-w-md text-sm text-gray-500">
            The product you're looking for
            doesn't exist or may have been
            removed.
          </p>

          <Link
            to="/shop"
            className="mt-6 flex items-center gap-2 rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5]"
          >
            <ArrowLeft size={18} />
            Back to Shop
          </Link>

        </div>
      </div>
    );
  }

  /* --------------------------------
     Price
  --------------------------------- */

  const hasDiscount =
    product.discountPrice &&
    product.discountPrice < product.price;

  const displayPrice = hasDiscount
    ? product.discountPrice
    : product.price;

  const discountPercentage = hasDiscount
    ? Math.round(
      ((product.price -
        product.discountPrice) /
        product.price) *
      100
    )
    : 0;

  // Image
  const images = product.images?.length > 0 ? product.images : ['https://placehold.co/800x800?text=No+Image',];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#6366F1]"
          >
            <ArrowLeft size={17} />
            Back to Shop
          </Link>

        </div>
      </div>


      {/* Product */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Product Image Gallery */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">

            {/* Main Image */}
            <Swiper
              modules={[Navigation, Thumbs]}
              navigation={images.length > 1}
              thumbs={{
                swiper:
                  thumbsSwiper &&
                    !thumbsSwiper.destroyed
                    ? thumbsSwiper
                    : null,
              }}
              spaceBetween={10}
              className="product-main-swiper"
            >
              {images.map((image, index) => (
                <SwiperSlide key={`${image}-${index}`}>
                  <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">

                    <img
                      src={image}
                      alt={`${product.name} - Image ${index + 1
                        }`}
                      className="h-full w-full object-cover"
                    />

                  </div>
                </SwiperSlide>
              ))}
            </Swiper>


            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <Swiper
                onSwiper={setThumbsSwiper}
                modules={[Thumbs]}
                spaceBetween={10}
                slidesPerView={4}
                watchSlidesProgress
                breakpoints={{
                  640: {
                    slidesPerView: 5,
                  },
                  768: {
                    slidesPerView: 6,
                  },
                }}
                className="mt-3"
              >
                {images.map((image, index) => (
                  <SwiperSlide
                    key={`thumb-${image}-${index}`}
                    className="cursor-pointer"
                  >
                    <div className="aspect-square overflow-hidden rounded-lg border-2 border-transparent bg-gray-100 transition hover:border-[#6366F1]">

                      <img
                        src={image}
                        alt={`${product.name} thumbnail ${index + 1
                          }`}
                        className="h-full w-full object-cover"
                      />

                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

          </div>

          {/* Product Information */}
          <div className="flex flex-col">

            {/* Brand */}
            {product.brand?.name && (
              <p className="text-sm font-semibold uppercase tracking-wide text-[#6366F1]">
                {product.brand.name}
              </p>
            )}


            {/* Name */}
            <h1 className="mt-2 text-3xl font-bold leading-tight text-[#111827] sm:text-4xl">
              {product.name}
            </h1>


            {/* Category */}
            {product.category?.name && (
              <p className="mt-2 text-sm text-gray-500">
                Category:{' '}
                <span className="font-medium text-gray-700">
                  {product.category.name}
                </span>
              </p>
            )}

            {/* Rating */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1">
                <div className="flex items-center gap-2">
                  <RatingStars rating={product.ratings} />

                  <span className="text-sm font-semibold text-gray-700">
                    {Number(product.ratings || 0).toFixed(1)}
                  </span>

                  <span className="text-sm text-gray-500">
                    ({product.numReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>


            {/* Price */}
            <div className="mt-6 flex flex-wrap items-center gap-3">

              <span className="text-3xl font-bold text-[#111827]">
                ₹
                {Number(
                  displayPrice
                ).toLocaleString(
                  'en-IN'
                )}
              </span>

              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ₹
                    {Number(
                      product.price
                    ).toLocaleString(
                      'en-IN'
                    )}
                  </span>

                  <span className="rounded-md bg-[#F59E0B] px-2.5 py-1 text-xs font-bold text-white">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}

            </div>


            {/* Stock */}
            <div className="mt-5">

              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-green-600">

                  <span className="h-2 w-2 rounded-full bg-green-500" />

                  In Stock

                  <span className="font-normal text-gray-500">
                    ({product.stock}{' '}
                    available)
                  </span>

                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-semibold text-red-600">

                  <span className="h-2 w-2 rounded-full bg-red-500" />

                  Out of Stock

                </div>
              )}

            </div>

            {/* quantity controls */}
            {product.stock > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex flex-wrap items-center gap-4">

                  <div>
                    <p className="mb-2 text-sm font-semibold text-[#111827]">
                      Quantity
                    </p>

                    <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">
                      <button
                        type="button"
                        onClick={() => {
                          if (isInCart) {
                            const nextQuantity = Math.max(1, cartQuantity - 1);

                            updateQuantity(product._id, nextQuantity);
                            setQuantity(nextQuantity);
                          } else {
                            setQuantity((current) => Math.max(1, current - 1));
                          }
                        }}
                        disabled={(isInCart ? cartQuantity : quantity) <= 1}
                        className="flex h-10 w-10 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus size={17} />
                      </button>

                      <div className="flex h-10 min-w-12 items-center justify-center border-x border-gray-300 px-3 text-sm font-semibold text-[#111827]">
                        {isInCart ? cartQuantity : quantity}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (isInCart) {
                            const nextQuantity = Math.min(
                              product.stock,
                              cartQuantity + 1
                            );

                            updateQuantity(product._id, nextQuantity);
                            setQuantity(nextQuantity);
                          } else {
                            setQuantity((current) =>
                              Math.min(product.stock, current + 1)
                            );
                          }
                        }}
                        disabled={(isInCart ? cartQuantity : quantity) >= product.stock}
                        className="flex h-10 w-10 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-5 text-xs text-gray-500">
                    Maximum {product.stock} available
                  </div>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="mt-5">
              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() => {
                  if (!product || product.stock <= 0) {
                    toast.error('This product is out of stock');
                    return;
                  }

                  if (quantity < 1 || quantity > product.stock) {
                    toast.error('Selected quantity is not available');
                    return;
                  }

                  if (isInCart) {
                    navigate('/cart');
                    return;
                  }

                  addToCart(product, quantity);

                  toast.success(
                    `${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart`
                  );
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto sm:min-w-[240px]"
              >
                <ShoppingCart size={19} />

                {product.stock <= 0
                  ? 'Out of Stock'
                  : isInCart
                    ? 'Go to Cart'
                    : 'Add to Cart'}
              </button>
            </div>

            {/* Description */}
            {product.description?.trim() && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h2 className="text-base font-semibold text-[#111827]">
                  Description
                </h2>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                  {product.description}
                </p>
              </div>
            )}


            {/* Specifications */}
            {product.specifications &&
              Object.keys(
                product.specifications
              ).length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-6">

                  <h2 className="text-base font-semibold text-[#111827]">
                    Specifications
                  </h2>

                  <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">

                    {Object.entries(
                      product.specifications
                    ).map(
                      (
                        [
                          key,
                          value,
                        ],
                        index
                      ) => (
                        <div
                          key={key}
                          className={`grid grid-cols-2 gap-4 px-4 py-3 text-sm ${index %
                            2 ===
                            0
                            ? 'bg-gray-50'
                            : 'bg-white'
                            }`}
                        >
                          <span className="font-medium capitalize text-gray-600">
                            {key.replace(
                              /([A-Z])/g,
                              ' $1'
                            )}
                          </span>

                          <span className="break-words text-gray-900">
                            {String(
                              value
                            )}
                          </span>
                        </div>
                      )
                    )}

                  </div>

                </div>
              )}


            {/* Step 3 will add buttons here */}

          </div>

        </div>

      </main>


      {relatedProducts.length > 0 && (
        <section className="mt-12 border-t border-gray-200 pt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#111827]">
              Related Products
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Explore more products from the same category.
            </p>
          </div>

          <div className="grid grid-cols-1 min-[481px]:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct._id}
                product={relatedProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;