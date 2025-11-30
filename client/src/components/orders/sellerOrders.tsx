// src/pages/SellerOrders.tsx
import React from 'react';
import { useGetAllOrdersQuery } from '../../features/orders/ordersApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Link } from 'react-router-dom';

const SellerOrders: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: orders, isLoading, isError } = useGetAllOrdersQuery();
  if (isLoading) {
    return (
      <div className="text-center py-16 text-lg font-semibold text-gray-600 dark:text-gray-300">
        Loading orders...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-red-600 dark:text-red-400 font-semibold">
        An error occurred while loading orders.
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[100px] px-4 bg-[#F5F7FA] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
          Customer Orders
        </h2>

        {orders && orders.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center">No orders yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders?.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all duration-300 p-5"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Order ID:
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {order._id}
                  </span>
                </div>

                <div className="mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Customer:</span>{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {order.user?.username || 'Unknown'}
                  </span>
                </div>

                <div className="mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Products Count:</span>{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {order.items?.length}
                  </span>
                </div>

                <div className="mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Price:</span>{' '}
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {order.totalPrice} ₪
                  </span>
                </div>

                <div className="mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {order.status}
                  </span>
                </div>

                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Created At:</span>{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {new Date(order.createdAt).toLocaleDateString('en-US')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
