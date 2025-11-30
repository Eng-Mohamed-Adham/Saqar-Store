import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useCreateProductMutation } from '../../features/products/productApi';
import { useNavigate } from 'react-router-dom';
import { CreateProductDto } from '../../types/products.types';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import ConnectStripeButton from '../../pages/ConnectStripePage';

const ProductAdd: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductDto>();

  const navigate = useNavigate();
  const [createProduct, { isLoading, isError, error }] = useCreateProductMutation();
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const { token, user } = useSelector((state: RootState) => state.auth);

  if (!user?.stripeAccountId) {
    return (
      <div className="max-w-xl mx-auto p-4 bg-white dark:bg-gray-900 shadow rounded text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">❌ You can't add products</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          You must connect your account with Stripe first in order to add products.
        </p>
        <ConnectStripeButton />
      </div>
    );
  }

  const onSubmit: SubmitHandler<CreateProductDto> = async (data) => {
    try {
      if (!imageFile) {
        alert('Please choose an image');
        return;
      }

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'ecommerce_uploads');

      const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dsrmingwi/image/upload', {
        method: 'POST',
        body: formData,
      });

      const cloudData = await cloudRes.json();
      const imageUrl = cloudData.secure_url;

      await createProduct({ ...data, image: imageUrl }).unwrap();
      reset();
      setImageFile(null);
      navigate('/products');
    } catch (err) {
      console.error('Failed to add product', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white dark:bg-gray-900 shadow rounded">
      <h2 className="text-xl font-bold mb-4">Add New Product</h2>

     {isError && (
  <p className="text-red-500 mb-2">
    Error:{' '}
    {(() => {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        'data' in error &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'message' in error.data
      ) {
        return (error.data as { message?: string }).message || 'An error occurred';
      }
      return 'An error occurred';
    })()}
  </p>
)}


      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white text-black dark:bg-gray-900 dark:text-white">
        <div>
          <label className="block text-sm mb-1">Product Name</label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="w-full px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            {...register('price', { required: 'Price is required', valueAsNumber: true })}
            className="w-full px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            rows={4}
            {...register('description', { required: 'Description is required' })}
            className="w-full px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Category</label>
          <input
            type="text"
            {...register('category', { required: 'Category is required' })}
            className="w-full px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
          />
          {errors.category && (
            <p className="text-red-500 text-sm">{errors.category.message}</p>
          )}
        </div>
         <div>
          <label className="block text-sm mb-1">Stock</label>
          <input
            type="Number"
            {...register('stock', { required: 'Stock is required' })}
            className="w-full px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
          />
          {errors.stock && (
            <p className="text-red-500 text-sm">{errors.stock.message}</p>
          )}
        </div>


        <div>
          <label className="block text-sm mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white hover:bg-primary-dark py-2 px-4 rounded-xl shadow-soft"
        >
          {isLoading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductAdd;