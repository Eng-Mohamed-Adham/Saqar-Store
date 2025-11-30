import { useForm } from 'react-hook-form';
import { useGetUserByIdQuery, useUpdateUserMutation } from '../../features/users/usersApi';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

type FormValues = {
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'user';
  phone?: string;
  address?: string;
  photo?: string;
};

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [base64Photo, setBase64Photo] = useState<string | undefined>();

  const { data: user, isLoading, isError } = useGetUserByIdQuery(id || '');
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  // Fill form once user data is loaded
  if (user) {
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    });
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64Photo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const dataWithPhoto = { ...data, photo: base64Photo };
      await updateUser({ id: id!, data: dataWithPhoto }).unwrap();
      navigate('/users');
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (isLoading) return <div className="p-4">Loading user data...</div>;
  if (isError || !user) return <div className="p-4 text-red-500">Failed to load user data.</div>;

  return (
    <div className="p-4 font-[Cairo] max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit User</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Profile Picture</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
        </div>

        <div>
          <label className="block mb-1">Full Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            {...register('email', { required: 'Email is required' })}
            type="email"
            className="w-full px-3 py-2 border rounded"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block mb-1">Role</label>
          <select {...register('role')} className="w-full px-3 py-2 border rounded">
            <option value="user">User</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Phone</label>
          <input {...register('phone')} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block mb-1">Address</label>
          <input {...register('address')} className="w-full px-3 py-2 border rounded" />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-neutral-800"
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  );
};

export default UserEdit;
