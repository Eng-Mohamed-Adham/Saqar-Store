import { useGetUsersQuery } from '../../features/users/usersApi';
import { useSelector } from 'react-redux';
import { selectAllUsers } from '../../features/users/usersSlice';
import { RootState } from '../../app/store';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../../services/overLayLoader';

const UserList = () => {
  const { isLoading, isError, error } = useGetUsersQuery({ sellerOnly: true });
  const users = useSelector((state: RootState) => selectAllUsers(state));
  const navigate = useNavigate();

  if (isLoading) return <LoadingOverlay />;

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Failed to load users: {(error as any)?.data?.message || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="p-4 font-[Cairo]">
      <h2 className="text-xl font-bold mb-4">Sellers</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-800 text-center">
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Phone</th>
            <th className="border px-4 py-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id} className="text-center">
                <td className="border px-4 py-2">
                  <div className="flex items-center gap-2 justify-center">
                  
                    <span className="text-sm">{user.email}</span> 
                  </div>
                </td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.phone || '-'}</td>
                <td className="border px-4 py-2 capitalize">{user.role}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="border px-4 py-4 text-gray-500 dark:text-gray-400 text-center">
                No sellers available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
