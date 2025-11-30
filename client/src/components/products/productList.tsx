import React, { useState, useMemo } from 'react';
import { useGetAllProductsQuery } from '../../features/products/productApi';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import { selectAllProducts } from '../../features/products/productSlice';
import { Link } from 'react-router-dom';
import { addToCart } from '../../features/cards/cardsSlice';
import { FaHeart, FaShoppingBag } from 'react-icons/fa';
import LoadingOverlay from '../../services/overLayLoader';
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWishlistQuery,
} from '../../features/wishlist/wishlistApi';


const ITEMS_PER_PAGE = 12;

const ProductList: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [page, setPage] = useState<number>(1);
  const [sortOption, setSortOption] = useState<string>('');

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const { isLoading, isError, error } = useGetAllProductsQuery(undefined);
  const allProducts = useSelector(selectAllProducts);

  const categories = ['All', 'fashion', 'furniture', 'electronics', 'sports', 'jewelry'];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
    setPage(1);
  };

  const handleCategoryClick = (cat: string) => {
    setCategoryFilter(cat);
    setPage(1);
  };
const { data: wishlist = [] } = useGetWishlistQuery(undefined, {
  skip: !user, // فقط للمستخدم المسجل
});

const [addToWishlist] = useAddToWishlistMutation();
const [removeFromWishlist] = useRemoveFromWishlistMutation();

const isInWishlist = (productId: string) => {
  return wishlist.some((item) => item._id === productId);
};

const toggleWishlist = async (productId: string) => {
  if (isInWishlist(productId)) {
    await removeFromWishlist({ productId });
  } else {
    await addToWishlist({ productId });
  }
};


  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (categoryFilter !== 'All') {
      products = products.filter((p) => p.category === categoryFilter);
    }

    if (sortOption === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'newest') {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'rating') {
      products.sort((a, b) => b.averageRating - a.averageRating);
    }

    return products;
  }, [allProducts, categoryFilter, sortOption]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, page]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  if (isLoading) return <LoadingOverlay />;

  if (isError)
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        Error: {(error as any)?.message ?? 'Unknown error'}
      </div>
    );

  return (
    <div className="bg-white dark:bg-gray-900 text-[#1E1E1E] dark:text-white font-sans px-6 md:px-20 py-10 pt-[100px]">
      {/* Category Pills + Sort */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                categoryFilter === cat
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={sortOption}
          onChange={handleSortChange}
          className="px-4 py-2 border rounded-md bg-gray-100 text-gray-800 shadow-sm dark:bg-gray-700 dark:text-white"
        >
          <option value="">Sort By</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Seller Add Product Button */}
      {user?.role === 'seller' && (
        <div className="text-end mb-6">
          <Link
            to="/products/add"
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-[#333]"
          >
            + Add Product
          </Link>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((product) => (
            <div
              key={product._id}
              className="border p-4 rounded-lg group hover:shadow-lg transition bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <img
                src={product.image || '/no-image.jpg'}
                alt={product.name}
                className="w-full h-48 object-cover rounded"
              />
              <h3 className="mt-4 font-medium text-lg truncate">{product.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                {product.description?.slice(0, 50)}
              </p>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-black dark:text-white">${product.price}</span>
                <div className="flex gap-2">
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className={isInWishlist(product._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}
                >
                  <FaHeart />
                </button>
                  <button
                    onClick={() =>
                      dispatch(
                        addToCart({
                          productId: product._id,
                          name: product.name,
                          image: product.image,
                          price: product.price,
                          quantity: 1,
                          sellerId: product.seller._id,
                        })
                      )
                    }
                  >
                    <FaShoppingBag />
                  </button>
                </div>
              </div>
              <Link
                to={`/products/${product._id}`}
                className="block mt-3 text-center text-sm text-blue-600 hover:underline"
              >
                View Details
              </Link>

              {/* Seller Only Controls */}
              {user?.role === 'seller' && user.id === product.seller._id && (
                <div className="flex gap-4 mt-2 justify-center">
                  <Link
                    to={`/products/edit/${product._id}`}
                    className="text-sm text-yellow-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/products/delete/${product._id}`}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </Link>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
            No products found.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-10 gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-4 py-2 rounded-md border transition text-sm font-medium shadow-sm ${
              page === p
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
