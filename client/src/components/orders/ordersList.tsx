import React from 'react';
import { useGetMyOrdersQuery } from '../../features/orders/ordersApi';
import { useGetProductByIdQuery } from '../../features/products/productApi';
import LoadingOverlay from '../../services/overLayLoader';

interface OrderItemCardProps {
  productId: string;
  quantity: number;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({ productId, quantity }) => {
  const { data: product, isLoading, isError } = useGetProductByIdQuery(productId);

  if (isLoading) {
    return <LoadingOverlay/>;
  }

  if (isError || !product) {
    return <div className="text-sm text-red-500">Failed to load product</div>;
  }

const subtotal = quantity * product.price

  return (
    <div className="flex items-center gap-4 border-t pt-3">
      <img
        src={product.image ? `${product.image}` : '/fallback-product.jpg'}
        alt={product.name}
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex-1">
        <h4 className="font-semibold">{product.name}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Quantity: {quantity} × {product.price} ₪
        </p>
      </div>
      <div className="font-bold">{subtotal} ₪</div>
    </div>
  );
};

const MyOrdersPage: React.FC = () => {
  const { data: orders, isLoading, isError, error } = useGetMyOrdersQuery();

  if (isLoading) return <p>Loading your orders...</p>;
  if (isError) return <p>Error: {(error as any).data?.message}</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto pt-[100px]">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>
      {orders?.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm">Order ID: <span className="font-medium">{order._id}</span></p>
                  <p className="text-sm">Status: <span className="font-medium">{order.status}</span></p>
                  <p className="text-sm">Created: <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                </div>
                <p className="text-lg font-bold text-right">{(order.totalPrice).toFixed(2)} ₪</p>
              </div>

              {/* المنتجات داخل الطلب */}
              <div className="grid gap-4">
                {order.items.map((item: any, index: number) => (
                  <OrderItemCard
                    key={`${item.product}-${index}`}
                    productId={item.product}
                    quantity={item.quantity}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
