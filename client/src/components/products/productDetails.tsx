import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetProductByIdQuery, useAddReviewMutation } from '../../features/products/productApi';
import { useGetUserByIdQuery } from '../../features/users/usersApi';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import { addToCart } from '../../features/cards/cardsSlice';
import LoadingOverlay from '../../services/overLayLoader';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: product, isLoading: isProductLoading, isError: isProductError, error: productError } = useGetProductByIdQuery(id!);
  const { data: seller, isLoading: isSellerLoading } = useGetUserByIdQuery(product?.seller._id || '', {
    skip: !product?.seller,
  });
  const [addReview] = useAddReviewMutation();

  if (isProductLoading || isSellerLoading) {
    return <LoadingOverlay />;
  }

  if (isProductError) {
    return <div className="p-6 text-center text-red-600 dark:text-red-400">Error loading product: {(productError as any)?.message ?? 'Unknown error'}</div>;
  }

  if (!product || !seller) {
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Product not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-[#1E1E1E] dark:text-white font-sans px-6 md:px-20 py-14 mt-[100px]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div className="w-full">
          <img
            src={product.image || '/no-image.jpg'}
            alt={product.name}
            className="w-full rounded-xl object-cover shadow-lg"
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold leading-snug">{product.name}</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{product.description}</p>

          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p><span className="font-semibold text-black dark:text-white">Price:</span> ${product.price}</p>
            <p><span className="font-semibold text-black dark:text-white">Category:</span> {product.category}</p>
            <p><span className="font-semibold text-black dark:text-white">Stock:</span> {product.stock} units</p>
            <p><span className="font-semibold text-black dark:text-white">Rating:</span> {product.rating.toFixed(1)} / 5</p>
            <p><span className="font-semibold text-black dark:text-white">Seller:</span><Link to={`/sellers/${product.seller._id}`}> {seller?.username || 'Unknown'} </Link></p>
            <p><span className="font-semibold text-black dark:text-white">Created:</span> {new Date(product.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
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
              className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              Add to Cart
            </button>

            {user?.role === 'seller' && user?.id === product.seller && (
              <>
                <Link to={`/products/edit/${product._id}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</Link>
                <Link to={`/products/delete/${product._id}`} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</Link>
              </>
            )}

            <Link to="/products" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              Back to Products
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-20">
        {user && user.role !== 'seller' && user.id !== product.seller && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const rating = Number((form.elements.namedItem('rating') as HTMLSelectElement).value);
                const comment = (form.elements.namedItem('comment') as HTMLTextAreaElement).value;
                try {
                  await addReview({ productId: product._id, rating, comment }).unwrap();
                  alert('Review submitted');
                  window.location.reload();
                } catch (err: any) {
                  alert(err?.data?.message || 'Error submitting review');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="rating" className="block mb-1 font-medium">Rating</label>
                <select name="rating" id="rating" required className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded">
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
              <div>
                <label htmlFor="comment" className="block mb-1 font-medium">Comment</label>
                <textarea name="comment" id="comment" rows={3} required className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded" placeholder="Write your review here..." />
              </div>
              <button type="submit" className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200">
                Submit Review
              </button>
            </form>
          </div>
        )}

        {product.reviews?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
            <div className="space-y-4">
              {product.reviews.map((review: any, index: number) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-600 rounded-md p-4">
                  <p className="text-yellow-600 font-bold">⭐ {review.rating} / 5</p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{review.comment}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
