import { useForm } from 'react-hook-form';
import { useAddUserMutation } from '../../features/users/usersApi';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

type FormValues = {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'seller' | 'user';
  phone?: string;
  address?: string;
  photo?: string;
};

const UserAdd = () => {
  const [base64Photo, setBase64Photo] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const [addUser, { isLoading }] = useAddUserMutation();
  const navigate = useNavigate();

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
      await addUser(dataWithPhoto).unwrap();
      navigate('/users');
    } catch (err) {
      console.error('Failed to add user:', err);
    }
  };

  return (
    <div className="p-4 font-[Cairo] max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Add New User</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Full Name</label>
          <input
            {...register('username', { required: 'Name is required' })}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.username && <p className="text-red-500">{errors.username.message}</p>}
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
          <label className="block mb-1">Password</label>
          <input
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum length is 6 characters' },
            })}
            type="password"
            className="w-full px-3 py-2 border rounded"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
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
          <input
            {...register('phone')}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Address</label>
          <input
            {...register('address')}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Profile Picture</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
        </div>

        <button
          type="submit"
          className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add User'}
        </button>
      </form>
    </div>
  );
};

export default UserAdd;
