import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from '../../features/products/productApi';
import { UpdateProductDto } from '../../types/products.types';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';

const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: product, isLoading, isError } = useGetProductByIdQuery(id!, { skip: !id });
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateProductDto>();

  useEffect(() => {
    if (product) {
      setValue('name', product.name);
      setValue('price', product.price);
      setValue('description', product.description);
      setValue('category', product.category);
      setValue('image', product.image);
    }
  }, [product, setValue]);

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ecommerce_uploads');

    const response = await fetch('https://api.cloudinary.com/v1_1/dsrmingwi/image/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.secure_url;
  };

  const onSubmit: SubmitHandler<UpdateProductDto> = async (data) => {
    try {
      if (!id) return;
      let imageUrl = data.image;
      if (selectedImage) {
        imageUrl = await uploadImageToCloudinary(selectedImage);
      }
      await updateProduct({ id, data: { ...data, image: imageUrl } }).unwrap();
      navigate('/products');
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const notOwner = product && user?.role === 'seller' && product.seller._id !== user.id;

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError || !product) return <div className="p-4 text-red-500">Failed to load product data.</div>;
  if (notOwner) return <div className="p-4 text-red-500">🚫 You are not authorized to edit this product.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white dark:bg-gray-900 shadow rounded">
      <h2 className="text-xl font-bold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          ></textarea>
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Category</label>
          <input
            type="text"
            {...register('category', { required: 'Category is required' })}
            className="w-full px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
          />
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">New Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setSelectedImage(file);
            }}
            className="w-full px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        {product.image && (
          <div>
            <label className="block text-sm mb-1">Current Image</label>
            <img src={product.image} alt="Product" className="w-32 h-auto rounded" />
          </div>
        )}

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-black hover:bg-black text-white py-2 rounded transition"
        >
          {isUpdating ? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductEdit;