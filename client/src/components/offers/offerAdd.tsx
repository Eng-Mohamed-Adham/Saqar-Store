import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateOfferMutation } from '../../features/offers/offerApi';
import { useNavigate } from 'react-router-dom';
import { useGetMyProductsQuery } from '../../features/products/productApi';

const OfferAdd = () => {
  const { register, handleSubmit } = useForm();
  const [createOffer] = useCreateOfferMutation();
  const navigate = useNavigate();

  const { data: products = [], isLoading: loadingProducts } = useGetMyProductsQuery();

  const [base64Image, setBase64Image] = useState<string | null>(null);

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
      data.products = Array.isArray(data.products)
        ? data.products.map((id: string) => id.trim())
        : [data.products];

      if (base64Image) {
        data.image = base64Image;
      }

      await createOffer(data).unwrap();
      navigate('/offers');
    } catch (err) {
      console.error(err);
      alert('Failed to create offer');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md mt-[100px]">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Add New Offer</h1>

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
          placeholder="Discount Percentage (%)"
          className="p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          {...register('expiresAt')}
          type="date"
          className="p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
          lang='en'
        />
        <input
          {...register('couponCode')}
          placeholder="Coupon Code (optional)"
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
          <label className="text-gray-700 dark:text-gray-300 font-semibold mb-1 block">
            Offer Image:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                       file:rounded file:border-0 file:text-sm file:font-semibold
                       file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>

        <label className="text-gray-700 dark:text-gray-300 font-semibold">Select Products:</label>
        {loadingProducts ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading products...</p>
        ) : (
          <select
            {...register('products')}
            multiple
            className="h-40 p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
          >
            {products.map((product: any) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>
        )}

        <button
          type="submit"
          className="p-2 bg-black hover:bg-green-700 text-white rounded transition duration-200"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default OfferAdd;
