import React, { useState } from 'react';
import {
  useGetAllOffersQuery,
  useDeleteOfferMutation,
} from '../../features/offers/offerApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const OfferList = () => {
  const [expiredFilter, setExpiredFilter] = useState<'all' | 'true' | 'false'>('all');
  const user = useSelector((state: RootState) => state.auth.user);
  const [sellerId, setSellerId] = useState<string | undefined>(undefined);

  const navigate = useNavigate();
  const [deleteOffer] = useDeleteOfferMutation();

  const { data: offers = [], isLoading } = useGetAllOffersQuery(
    {
      ...(expiredFilter !== 'all' && { expired: expiredFilter }),
      ...(sellerId && { seller: sellerId }),
    },
    { skip: !user }
  );

  const handleDelete = async (id: string) => {
    if (confirm('Do you want to delete this offer?')) {
      await deleteOffer(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 dark:bg-gray-950 min-h-screen pt-[100px]">
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <select
          className="p-2 border rounded dark:bg-gray-900 dark:text-white dark:border-gray-700"
          value={expiredFilter}
          onChange={(e) => setExpiredFilter(e.target.value as 'all' | 'true' | 'false')}
        >
          <option value="all">All Offers</option>
          <option value="false">Active Offers</option>
          <option value="true">Expired Offers</option>
        </select>

        {user?.role === 'admin' && (
          <input
            className="p-2 border rounded dark:bg-gray-900 dark:text-white dark:border-gray-700"
            placeholder="Filter by Seller (ID)"
            value={sellerId ?? ''}
            onChange={(e) => setSellerId(e.target.value)}
          />
        )}

        {user?.role === 'seller' && (
          <button
            type="button"
            onClick={() => navigate('/offers/add')}
            className="ml-auto px-4 py-2 bg-black text-white rounded hover:bg-neutral-800"
          >
            + Add Offer
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer: any) => (
            <div
              key={offer._id}
              className="rounded-xl p-4 shadow-sm border dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              {offer.image && (
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
              )}

              <h2 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{offer.title}</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{offer.description}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Discount: {offer.discount}%</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Expires on: {new Date(offer.expiresAt).toLocaleDateString()}
              </p>

              {user?.role === 'admin' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Seller: {offer.seller?.username}</p>
              )}

              {user?.role === 'seller' && (
                <div className="flex gap-2 mt-3">
                  <button
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleDelete(offer._id)}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => navigate(`/offers/edit/${offer._id}`)}
                    className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfferList;