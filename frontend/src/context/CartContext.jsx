import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');

            return savedCart
                ? JSON.parse(savedCart)
                : [];
        } catch (error) {
            console.error('Failed to load cart:', error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(
            'cart',
            JSON.stringify(cartItems)
        );
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        setCartItems((currentItems) => {
            const existingItem = currentItems.find(
                (item) => item.product._id === product._id
            );

            const newQuantity = existingItem
                ? existingItem.quantity + quantity
                : quantity;

            const finalQuantity = Math.min(
                newQuantity,
                product.stock || newQuantity
            );

            if (existingItem) {
                return currentItems.map((item) =>
                    item.product._id === product._id
                        ? {
                            ...item,
                            quantity: finalQuantity,
                        }
                        : item
                );
            }

            return [
                ...currentItems,
                {
                    product,
                    quantity: finalQuantity,
                },
            ];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((currentItems) =>
            currentItems.filter(
                (item) => item.product._id !== productId
            )
        );
    };

    const updateQuantity = (productId, quantity) => {
        setCartItems((currentItems) =>
            currentItems.map((item) => {
                if (item.product._id !== productId) {
                    return item;
                }

                const finalQuantity = Math.min(
                    Math.max(1, quantity),
                    item.product.stock || quantity
                );

                return {
                    ...item,
                    quantity: finalQuantity,
                };
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const cartTotal = cartItems.reduce(
        (total, item) => {
            const price =
                item.product.discountPrice &&
                    item.product.discountPrice <
                    item.product.price
                    ? item.product.discountPrice
                    : item.product.price;

            return total + price * item.quantity;
        },
        0
    );

    const value = {
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};