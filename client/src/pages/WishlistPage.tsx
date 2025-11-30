// src/pages/WishlistPage.tsx
import React from 'react';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '../features/wishlist/wishlistApi';
import LoadingOverlay from '../services/overLayLoader';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

const WishlistPage = () => {
  const { data: wishlist = [], isLoading, isError } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  if (isLoading) return <LoadingOverlay />;
  if (isError) return <div className="text-red-500 p-4">Failed to load wishlist.</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <p className="text-gray-500">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 relative group"
            >
              <Link to={`/product/${product._id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-md"
                />
                <h2 className="mt-2 text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-600 dark:text-gray-300">{product.price}₪</p>
              </Link>

              <button
                onClick={() => removeFromWishlist({ productId: product._id })}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
