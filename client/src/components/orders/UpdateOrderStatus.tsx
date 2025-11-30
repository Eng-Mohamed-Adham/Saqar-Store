import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUpdateOrderStatusMutation } from '../../features/orders/ordersApi';
import { toast } from 'react-toastify';

const statusOptions = [
  'pending', 'processing', 'shipped', 'delivered', 'cancelled'
];

const UpdateOrderStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!status) return toast.error('Please select a new status');

    try {
      await updateStatus({ id: id!, data: { status } }).unwrap();
      toast.success('Order status updated successfully');
      navigate('/orders/seller');
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-xl font-bold mb-4">Update Order Status</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-700">
          Select New Status:
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        >
          <option value="">-- Select Status --</option>
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          {isLoading ? 'Updating...' : 'Update Status'}
        </button>
      </form>
    </div>
  );
};

export default UpdateOrderStatus;
