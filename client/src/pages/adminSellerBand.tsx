import React from 'react';
import { useGetUsersQuery, useBanOrUnbanSellerMutation } from '../features/users/usersApi';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminSellersPage = () => {
  const { data: users = [], isLoading, isError, refetch } = useGetUsersQuery({});
  const [banOrUnbanSeller, { isLoading: isBanning }] = useBanOrUnbanSellerMutation();

  const handleToggleBan = async (sellerId: string) => {
    try {
      await banOrUnbanSeller(sellerId).unwrap();
      toast.success('Seller status updated successfully');
      refetch(); // تحديث القائمة بعد التغيير
    } catch (err: any) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  if (isLoading) return <div className="p-4">Loading sellers...</div>;
  if (isError) return <div className="p-4 text-red-500">Failed to load sellers</div>;

  const sellers = users.filter((user) => user.role === 'seller');

  return (
    <div className="p-4 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-6">Sellers Management</h1>

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left text-sm uppercase tracking-wider">
              <th className="px-4 py-3 border-b">Name</th>
              <th className="px-4 py-3 border-b">Email</th>
              <th className="px-4 py-3 border-b">Banned</th>
              <th className="px-4 py-3 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller._id} className="border-t dark:border-gray-700">
                <td className="px-4 py-3">{seller.name}</td>
                <td className="px-4 py-3">{seller.email}</td>
                <td className="px-4 py-3">{seller.isBanned ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  <button
                    disabled={isBanning}
                    onClick={() => handleToggleBan(seller._id)}
                    className={`px-3 py-1 rounded text-white text-sm font-semibold 
                      ${seller.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} 
                      disabled:opacity-50`}
                  >
                    {isBanning ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : seller.isBanned ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSellersPage;
