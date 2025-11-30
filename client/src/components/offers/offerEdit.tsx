import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useGetOfferByIdQuery, useUpdateOfferMutation } from '../../features/offers/offerApi';
import { useParams, useNavigate } from 'react-router-dom';

const OfferEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { data: offer, isLoading } = useGetOfferByIdQuery(id);
  const [updateOffer] = useUpdateOfferMutation();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const [base64Image, setBase64Image] = useState<string | null>(null);

  useEffect(() => {
    if (offer) {
      reset({
        title: offer.title,
        description: offer.description,
        discount: offer.discount,
        expiresAt: offer.expiresAt?.substring(0, 10),
        couponCode: offer.couponCode,
        couponFor: offer.couponFor,
      });
    }
  }, [offer, reset]);

  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64Image(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: any) => {
    try {
      const sendData = {
        ...data,
        ...(base64Image && { image: base64Image }),
      };

      await updateOffer({ id, ...sendData }).unwrap();
      navigate('/offers');
    } catch (err) {
      console.error(err);
      alert('Failed to update the offer');
    }
  };

  if (isLoading)
    return <p className="p-4 text-gray-700 dark:text-gray-200">Loading...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Edit Offer</h1>

      {offer?.image && (
        <div className="mb-4 text-center">
          <img
            src={offer.image}
            alt="Offer Image"
            className="w-40 h-40 object-cover rounded-lg border shadow-md mx-auto"
          />
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Current Image</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <input
          {...register('title')}
          placeholder="Offer Title"
          className="p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <textarea
          {...register('description')}
          placeholder="Offer Description"
          className="p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          {...register('discount')}
          type="number"
          placeholder="Discount (%)"
          className="p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          {...register('expiresAt')}
          type="date"
          className="p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          {...register('couponCode')}
          placeholder="Coupon Code"
          className="p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <select
          {...register('couponFor')}
          className="p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
        >
          <option value="all">All Users</option>
          <option value="vip">VIP Only</option>
        </select>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">
            Change Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                       file:rounded file:border-0 file:text-sm file:font-semibold
                       file:bg-black file:text-white hover:file:bg-black"
          />
        </div>

        <button
          type="submit"
          className="p-2 bg-black hover:bg-black text-white rounded transition duration-200"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default OfferEdit;