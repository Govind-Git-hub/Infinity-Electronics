import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../../context/CartContext';

const HomeProductCard = ({ product }) => {
    const { cartItems, addToCart } = useCart();
    const navigate = useNavigate();

    const isInCart = cartItems.some(
        (item) => item.product?._id === product._id
    );

    const image =
        product.images?.length > 0
            ? product.images[0]
            : 'https://placehold.co/600x600?text=No+Image';

    const price = Number(product.price) || 0;
    const discountPrice = Number(product.discountPrice);

    const hasDiscount =
        Number.isFinite(discountPrice) &&
        discountPrice > 0 &&
        discountPrice < price;

    const finalPrice = hasDiscount ? discountPrice : price;

    const discountPercentage = hasDiscount
        ? Math.round(((price - discountPrice) / price) * 100)
        : 0;

    const outOfStock = Number(product.stock) <= 0;

    const productUrl = `/product/${product?._id}`;

    return (
        <article className="group min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <Link
                to={productUrl}
                className="relative block aspect-square overflow-hidden bg-gray-50"
            >
                {hasDiscount && (
                    <span className="absolute left-2 top-2 z-10 rounded bg-amber-400 px-1.5 py-1 text-[10px] font-bold text-gray-900 sm:text-xs">
                        {discountPercentage}% OFF
                    </span>
                )}

                <img
                    src={image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                // className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105 sm:p-3"
                />
            </Link>

            <div className="p-2.5 sm:p-3">
                <Link to={productUrl}>
                    <h3 className="mb-1 line-clamp-2 min-h-9 text-xs font-semibold leading-4 text-gray-900 transition hover:text-indigo-600 sm:text-sm">
                        {product.name}
                    </h3>
                </Link>

                <div className="mb-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    <span className="text-sm font-bold text-indigo-600 sm:text-base">
                        ₹{finalPrice.toLocaleString('en-IN')}
                    </span>

                    {hasDiscount && (
                        <span className="text-[10px] text-gray-400 line-through sm:text-xs">
                            ₹{price.toLocaleString('en-IN')}
                        </span>
                    )}
                </div>



                <button
                    type="button"
                    disabled={outOfStock}
                    onClick={() => {
                        if (outOfStock) return;

                        if (isInCart) {
                            navigate('/cart');
                            return;
                        }

                        addToCart(product);
                        toast.success('Product added to cart');
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:text-sm"
                >
                    <ShoppingCart
                        size={16}
                        strokeWidth={2}
                    />

                    <span>
                        {outOfStock
                            ? 'Out of Stock'
                            : isInCart
                                ? 'Go to Cart'
                                : 'Add to Cart'}
                    </span>
                </button>

            </div>
        </article>
    );
};

export default HomeProductCard;