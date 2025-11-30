// pages/SellerPage.tsx
import { useParams } from 'react-router-dom';
import {
  useGetSellerByIdQuery,
  useGetSellerReviewsQuery,
  useAddSellerReviewMutation,
} from '../features/sellers/sellerApi';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { useState } from 'react';
import moment from 'moment';

const SellerPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: seller, isLoading: sellerLoading } = useGetSellerByIdQuery(id!);
const { data: reviewData = { reviews: [], averageRating: 0 }, refetch } = useGetSellerReviewsQuery(id!);
const { reviews, averageRating } = reviewData;

  const [addReview] = useAddSellerReviewMutation();
  const user = useSelector((state: RootState) => state.auth.user);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addReview({ sellerId: id!, rating, comment }).unwrap();
      setSuccess('Review submitted successfully');
      setRating(0);
      setComment('');
      setError('');
      refetch();
    } catch (err: any) {
      setError(err?.data?.message || 'Something went wrong');
      setSuccess('');
    }
  };

  if (sellerLoading) return <div className="text-center py-10">Loading seller info...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white mt-[100px]">
      <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
            Seller Information
            </h2>        
        <div className="flex gap-4 items-center">
          <img src={seller.photo || '/default-avatar.png'} alt="Seller" className="w-20 h-20 rounded-full" />
          <div>
            <p><strong>Name:</strong> {seller.username}<span className="ml-2 text-yellow-500 text-sm">({averageRating.toFixed(1)} ★)</span>
</p>
            <p><strong>Email:</strong> {seller.email}</p>
            <p><strong>Phone:</strong> {seller.phone || 'N/A'}</p>
            <p><strong>Address:</strong> {seller.address || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Seller Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="border dark:border-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <img src={rev.user.photo || '/default-avatar.png'} className="w-8 h-8 rounded-full" />
                  <span className="font-medium">{rev.user.username}</span>
                  <span className="text-sm text-gray-500 ml-auto">{moment(rev.createdAt).fromNow()}</span>
                </div>
                <p className="text-yellow-500">Rating: {rev.rating} / 5</p>
                <p className="text-gray-700 dark:text-gray-300">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {user?.role === 'user' && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Add a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <select
              className="w-full p-2 rounded border dark:bg-gray-800"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
            >
              <option value={0}>Select Rating</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} - {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][r - 1]}
                </option>
              ))}
            </select>
            <textarea
              className="w-full p-2 rounded border dark:bg-gray-800"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Your comment"
              required
            />
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
          <button
  type="submit"
  className="bg-black hover:bg-black text-white px-4 py-2 rounded-xl shadow-md transition duration-200"
>
  Submit Review
</button>

          </form>
        </div>
      )}
    </div>
  );
};

export default SellerPage;
