import { useNavigate, useParams } from 'react-router-dom';
import { useGetUserByIdQuery, useDeleteUserMutation } from '../../features/users/usersApi';

const UserDelete = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useGetUserByIdQuery(id || '');
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleDelete = async () => {
    try {
      await deleteUser(id!).unwrap();
      navigate('/users');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (isLoading) return <div className="p-4">Loading user data...</div>;
  if (isError || !user) return <div className="p-4 text-red-500">Failed to load user data.</div>;

  return (
    <div className="p-4 font-[Cairo] max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">Delete User</h2>
      <p>Are you sure you want to delete this user?</p>
      <p className="my-2 font-semibold">
        {user.name} ({user.email})
      </p>

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
        </button>
        <button
          onClick={() => navigate('/users')}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UserDelete;
