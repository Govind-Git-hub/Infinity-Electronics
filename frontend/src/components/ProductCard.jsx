import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

// Same fractional star rating as Product Detail page
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
                        className="relative inline-block h-3.5 w-3.5"
                    >
                        <Star
                            size={14}
                            className="absolute inset-0 text-gray-300"
                        />

                        <span
                            className="absolute inset-y-0 left-0 overflow-hidden"
                            style={{ width: `${fill}%` }}
                        >
                            <Star
                                size={14}
                                className="max-w-none fill-[#F59E0B] text-[#F59E0B]"
                            />
                        </span>
                    </span>
                );
            })}
        </div>
    );
};

const ProductCard = ({ product }) => {
    const { cartItems, addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const price = Number(product.price) || 0;
    const discountPrice = Number(product.discountPrice);

    const hasDiscount = Number.isFinite(discountPrice) &&
        discountPrice > 0 &&
        discountPrice < price;

    const displayPrice = hasDiscount ? product.discountPrice : product.price;

    const discountPercentage = hasDiscount
        ? Math.round(((price - discountPrice) / price) * 100)
        : 0;

    const stock = Number(product.stock) || 0;
    const outOfStock = stock <= 0;

    const cartItem = cartItems.find(
        (item) => item.product?._id === product._id
    );

    const isInCart = Boolean(cartItem);
    const inWishlist = isInWishlist(product._id);

    const image = product.images?.length > 0
        ? product.images[0]
        : 'https://placehold.co/600x600?text=No+Image';

    const productUrl = `/product/${product._id}`;

    const handleToggleWishlist = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please login to use your wishlist.');
            navigate('/login');
            return;
        }

        if (wishlistLoading) return;

        const wasInWishlist = isInWishlist(product._id);

        try {
            setWishlistLoading(true);
            await toggleWishlist(product._id);
            toast.success(wasInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Unable to update wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (outOfStock) {
            toast.error('This product is out of stock');
            return;
        }

        if (isInCart) {
            navigate('/cart');
            return;
        }

        addToCart(product);
        toast.success('Product added to cart');
    };

    return (
        <div className="group min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-md">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Link to={productUrl} className="block h-full w-full">
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {/* Discount */}
                    {hasDiscount && (
                        <span className="absolute left-3 top-3 rounded-md bg-[#F59E0B] px-2 py-1 text-xs font-bold text-white">
                            -{discountPercentage}%
                        </span>
                    )}
                </Link>

                {/* Wishlist heart */}
                <button
                    type="button"
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-pressed={inWishlist}
                    title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-400 shadow-sm transition hover:scale-105 hover:text-red-500 disabled:cursor-wait disabled:opacity-60"
                >
                    <Heart
                        size={19}
                        strokeWidth={2}
                        className={inWishlist ? 'fill-red-500 text-red-500' : 'fill-transparent'}
                    />
                </button>

            </div>

            {/* Product Information */}
            <div className="p-2.5 sm:p-3">
                {/* Brand and Featured badge */}
                <div className="mb-1 flex min-h-5 items-center justify-between gap-2">
                    {product.brand?.name ? (
                        <p className="min-w-0 truncate text-xs font-medium uppercase tracking-wide text-[#6366F1]">
                            {product.brand.name}
                        </p>
                    ) : (
                        <span />
                    )}

                    {product.isFeatured && (
                        <span className="shrink-0 rounded-md bg-[#6366F1] px-2 py-1 text-[10px] font-semibold leading-tight text-white sm:text-xs">
                            Featured
                        </span>
                    )}
                </div>

                {/* Product Name */}
                <Link to={productUrl}>
                    <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold text-[#111827] transition hover:text-[#6366F1]">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1">
                    <RatingStars rating={product.ratings} />
                    <span className="text-[11px] font-semibold text-gray-700 sm:text-xs">
                        {Number(product.ratings || 0).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-gray-400 sm:text-xs">
                        ({product.numReviews || 0})
                    </span>
                </div>

                {/* Price */}
                <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-[#111827] sm:text-base">
                        ₹{Number(displayPrice).toLocaleString('en-IN')}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                            ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                    )}
                </div>

                {/* Stock */}
                <p
                    className={`mt-2 text-xs font-medium ${product.stock > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                        }`}
                >
                    {product.stock > 0
                        ? `${product.stock} in stock`
                        : 'Out of stock'}
                </p>

                {/* Add to Cart */}
                <button
                    type="button"
                    disabled={outOfStock}
                    onClick={handleAddToCart}
                    className="mt-3 flex w-full items-center justify-center gap-1 rounded-md bg-indigo-600 px-1.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:gap-1.5 sm:text-sm"
                >
                    <ShoppingCart size={15} strokeWidth={2} />
                    <span>
                        {outOfStock
                            ? 'Out of Stock'
                            : isInCart
                                ? 'Go to Cart'
                                : 'Add to Cart'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ProductCard;