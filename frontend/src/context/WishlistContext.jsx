
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = useCallback(async () => {
        if (!isAuthenticated) {
            setWishlist([]);
            setLoading(false);
            return [];
        }

        setLoading(true);

        try {
            const response = await api.get('/wishlist');
            const products = response.data?.data || [];

            setWishlist(products);
            return products;
        } catch (error) {
            console.error('Fetch wishlist error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist().catch(() => { });
        } else {
            setWishlist([]);
            setLoading(false);
        }
    }, [isAuthenticated, fetchWishlist]);
    
    const addToWishlist = async (productId) => {
        if (!isAuthenticated) {
            throw new Error('Please login to use your wishlist.');
        }

        const response = await api.post(`/wishlist/${productId}`);
        const products = response.data?.data || [];
        setWishlist(products);
        return products;
    };

    const removeFromWishlist = async (productId) => {
        if (!isAuthenticated) {
            throw new Error('Please login to use your wishlist.');
        }

        const response = await api.delete(`/wishlist/${productId}`);
        const products = response.data?.data || [];
        setWishlist(products);
        return products;
    };

    const isInWishlist = (productId) => wishlist.some((item) => String(item._id) === String(productId));

    const toggleWishlist = async (productId) => {
        return isInWishlist(productId)
            ? removeFromWishlist(productId)
            : addToWishlist(productId);
    };

    const wishlistIds = useMemo(
        () => wishlist.map((item) => String(item._id)),
        [wishlist]
    );

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                wishlistIds,
                loading,
                fetchWishlist,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                isInWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);

    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider');
    }

    return context;
};
