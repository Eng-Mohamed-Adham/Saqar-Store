import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useGetProductByIdQuery,
  useDeleteProductMutation,
} from '../../features/products/productApi';

const ProductDelete: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading, isError } = useGetProductByIdQuery(id!, {
    skip: !id,
  });

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const handleDelete = async () => {
    try {
      if (!id) return;
      await deleteProduct(id).unwrap();
      navigate('/products');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError || !product) return <div className="p-4 text-red-500">Failed to load product.</div>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-900 shadow rounded text-center">
      <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
        Confirm Product Deletion
      </h2>

      <p className="mb-2">Are you sure you want to delete the following product?</p>
      <p className="font-semibold text-lg">{product.name}</p>

      <div className="mt-6 flex justify-center space-x-4 rtl:space-x-reverse">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
        </button>

        <Link
          to="/products"
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded hover:opacity-80 transition"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
};

export default ProductDelete;
