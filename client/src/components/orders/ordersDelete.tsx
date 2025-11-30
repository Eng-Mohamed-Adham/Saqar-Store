import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeleteOrderMutation } from '../../features/orders/ordersApi';
import { toast } from 'react-toastify';

const DeleteOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteOrder, { isLoading }] = useDeleteOrderMutation();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await deleteOrder(id!).unwrap();
      toast.success('Order deleted successfully');
      navigate('/orders/seller'); // Redirect to seller orders page
    } catch (err) {
      toast.error('Failed to delete the order');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-red-600">Delete Order</h2>
      <p className="mb-6 text-gray-700">
        Are you sure you want to delete this order? This action cannot be undone.
      </p>

      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        {isLoading ? 'Deleting...' : 'Yes, Delete'}
      </button>
    </div>
  );
};

export default DeleteOrder;
