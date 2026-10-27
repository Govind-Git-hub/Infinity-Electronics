import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, } from 'swiper/modules';
import {
  ArrowLeft,
  Heart,
  Minus,
  PackageSearch,
  Plus,
  ShoppingCart,
  Star,
  Trash2,
  Send
} from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

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
  const { user, isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const { cartItems, addToCart, updateQuantity, } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const cartItem = cartItems.find(
    (item) => item.product._id === product?._id
  );

  const isInCart = Boolean(cartItem);
  const cartQuantity = cartItem?.quantity || 0;

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to use your wishlist');
      navigate('/login');
      return;
    }

    if (wishlistLoading) return;

    const alreadyInWishlist = isInWishlist(product?._id);

    try {
      setWishlistLoading(true);
      await toggleWishlist(product._id);
      toast.success(
        alreadyInWishlist ? 'Removed from wishlist' : 'Added to wishlist'
      );
    } catch (error) {
      console.error('Toggle wishlist error:', error);
      toast.error(
        error.response?.data?.message || error.message || 'Unable to update wishlist'
      );
    } finally {
      setWishlistLoading(false);
    }
  };

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

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);

      const response = await api.get(`/reviews/product/${id}`);

      if (response.data.success) {
        setReviews(response.data.data || []);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
      setReviews([]);
      toast.error(
        error.response?.data?.message || 'Unable to load reviews'
      );
    } finally {
      setReviewsLoading(false);
    }
  };

  const refreshProductAndReviews = async () => {
    await Promise.all([fetchProduct(), fetchReviews()]);
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      return;
    }

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      toast.error('Please select a rating from 1 to 5 stars');
      return;
    }

    try {
      setReviewSubmitting(true);

      const response = await api.post('/reviews', {
        productId: id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      if (!response.data.success) {
        toast.error(response.data.message || 'Unable to submit review');
        return;
      }

      toast.success('Review submitted successfully!');
      setReviewRating(0);
      setReviewComment('');

      await refreshProductAndReviews();
    } catch (error) {
      console.error('Submit review error:', error);

      toast.error(
        error.response?.data?.message || 'Unable to submit review'
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    const reviewId = reviewToDelete;

    try {
      setDeletingReviewId(reviewId);

      const response = await api.delete(`/reviews/${reviewId}`);

      if (!response.data.success) {
        toast.error(response.data.message || 'Unable to delete review');
        return;
      }

      toast.success('Review deleted successfully');
      setReviewToDelete(null);
      await refreshProductAndReviews();
    } catch (error) {
      console.error('Delete review error:', error);

      toast.error(
        error.response?.data?.message || 'Unable to delete review'
      );
    } finally {
      setDeletingReviewId(null);
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

  useEffect(() => {
    let isActive = true;

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);

        const response = await api.get(`/reviews/product/${id}`);

        if (isActive && response.data.success) {
          setReviews(response.data.data || []);
        }
      } catch (error) {
        console.error('Fetch reviews error:', error);

        if (isActive) {
          setReviews([]);
        }
      } finally {
        if (isActive) {
          setReviewsLoading(false);
        }
      }
    };

    setReviews([]);
    loadReviews();

    return () => {
      isActive = false;
    };
  }, [id]);

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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:pb-2 ">

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

            {/* Add to Cart + Wishlist */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
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

              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                aria-label={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={isInWishlist(product._id)}
                title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isInWishlist(product._id)
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-gray-400 hover:border-red-200 hover:text-red-500'
                }`}
              >
                <Heart
                  size={21}
                  className={isInWishlist(product._id) ? 'fill-red-500 text-red-500' : ''}
                />
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


          </div>

        </div>

      </main>

      {/* Customer Reviews */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:pb-2 lg:pt-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">

          {/* Heading and Summary */}
          <div className="flex flex-col gap-5 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#111827]">
                Customer Reviews
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Real feedback from customers about this product.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3">
              <Star
                size={28}
                className="fill-[#F59E0B] text-[#F59E0B]"
              />

              <div>
                <p className="text-2xl font-bold text-[#111827]">
                  {Number(product.ratings || 0).toFixed(1)}
                  <span className="text-sm font-medium text-gray-500">
                    {' '}/ 5
                  </span>
                </p>

                <p className="text-xs text-gray-500">
                  {product.numReviews || 0}{' '}
                  {(product.numReviews || 0) === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>

          {/* Review Form */}
          {isAuthenticated && (
            <div className="border-b border-gray-200 py-6">
              {reviews.some(
                (review) =>
                  String(review.user?._id || review.user) ===
                  String(user?._id)
              ) ? (
                <div className="rounded-xl bg-indigo-50 p-4">
                  <p className="font-semibold text-[#4338CA]">
                    You've reviewed this product
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    You can view or delete your review below.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-[#111827]">
                    Write a Review
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    How would you rate this product?
                  </p>

                  <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                    {/* Interactive Star Rating */}
                    <div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => { }}
                            aria-label={`Rate ${star} out of 5 stars`}
                            aria-pressed={reviewRating === star}
                            className="rounded p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                          >
                            <Star
                              size={28}
                              className={
                                star <= reviewRating
                                  ? 'fill-[#F59E0B] text-[#F59E0B]'
                                  : 'text-gray-300'
                              }
                            />
                          </button>
                        ))}

                        <span className="ml-2 text-sm font-medium text-gray-600">
                          {reviewRating
                            ? `${reviewRating} out of 5`
                            : 'Select rating'}
                        </span>
                      </div>
                    </div>

                    {/* Optional Comment */}
                    <div>
                      <label
                        htmlFor="review-comment"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Your Comment <span className="font-normal text-gray-400">(optional)</span>
                      </label>

                      <textarea
                        id="review-comment"
                        rows={4}
                        maxLength={1000}
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                        placeholder="Share your experience with this product..."
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#6366F1] focus:ring-2 focus:ring-indigo-100"
                      />

                      <p className="mt-1 text-right text-xs text-gray-400">
                        {reviewComment.length}/1000
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={reviewSubmitting || reviewRating === 0}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send size={16} />
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div className="border-b border-gray-200 py-5">
              <p className="text-sm text-gray-600">
                Please{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#6366F1] hover:underline"
                >
                  login
                </Link>{' '}
                to write a review.
              </p>
            </div>
          )}

          {/* Review List */}
          <div className="pt-6">
            <h3 className="text-lg font-bold text-[#111827]">
              All Reviews
            </h3>

            {reviewsLoading ? (
              <div className="flex items-center gap-3 py-8 text-sm text-gray-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-[#6366F1]" />
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <Star size={25} className="text-gray-400" />
                </div>

                <p className="mt-4 font-semibold text-gray-700">
                  No reviews yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Be the first to share your experience!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {reviews.map((review) => {
                  const reviewUserId =
                    review.user?._id || review.user;

                  const isOwnReview =
                    isAuthenticated &&
                    String(reviewUserId) === String(user?._id);

                  const reviewerName =
                    review.user?.name || 'Customer';

                  return (
                    <article
                      key={review._id}
                      className="py-5 first:pt-5 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-bold text-[#6366F1]">
                          {review.user?.avatar ? (
                            <img
                              src={review.user.avatar}
                              alt={reviewerName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            reviewerName.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#111827]">
                                {reviewerName}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-400">
                                {review.createdAt
                                  ? new Date(review.createdAt).toLocaleDateString(
                                    'en-IN',
                                    {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    }
                                  )
                                  : ''}
                              </p>
                            </div>

                            {isOwnReview && (
                              <button
                                type="button"
                                onClick={() => setReviewToDelete(review._id)}
                                disabled={deletingReviewId === review._id}
                                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                <Trash2 size={14} />
                                {deletingReviewId === review._id
                                  ? 'Deleting...'
                                  : 'Delete'}
                              </button>
                            )}
                          </div>

                          <div className="mt-2">
                            <RatingStars rating={review.rating} />
                          </div>

                          {review.comment?.trim() && (
                            <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-gray-600">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <ConfirmModal
        isOpen={Boolean(reviewToDelete)}
        title="Delete review?"
        message="Are you sure you want to delete your review? This action cannot be undone."
        confirmText="Delete Review"
        cancelText="Keep Review"
        variant="danger"
        loading={Boolean(reviewToDelete && deletingReviewId === reviewToDelete)}
        onCancel={() => {
          if (!deletingReviewId) setReviewToDelete(null);
        }}
        onConfirm={handleDeleteReview}
      />

      {relatedProducts.length > 0 && (
        <section className="mt-12 border-t border-gray-200 px-4 sm:px-6 lg:px-8 pt-4 pb-8">
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