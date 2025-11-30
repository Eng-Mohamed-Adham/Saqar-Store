// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import {
  useUpdateUserMutation,
  useGetUserByIdQuery,
} from '../../features/users/usersApi';
import { setUser } from '../../features/auth/authSlice';
import LoadingOverlay from '../../services/overLayLoader';

interface FormValues {
  username: string;
  email: string;
  phone: string;
  address: string;
}

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: profile, isLoading } = useGetUserByIdQuery(user?.id ?? '', {
    skip: !user?.id,
  });

  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [base64Photo, setBase64Photo] = useState<string>('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64Photo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username,
        email: profile.email,
        phone: profile.phone ?? '',
        address: profile.address ?? '',
      });

      dispatch(
        setUser({
          id: profile._id,
          username: profile.username,
          email: profile.email,
          role: profile.role,
          photo: profile.photo ?? null,
          phone: profile.phone ?? '',
          address: profile.address ?? '',
        })
      );
    }
  }, [profile, reset, dispatch]);

  const onSubmit = async (data: FormValues) => {
    const fullData = {
      ...data,
      role: user?.role ?? '',
      stripeAccountId: user?.stripeAccountId ?? '',
      phone: data.phone ?? '',
      address: data.address ?? '',
      ...(base64Photo && { photo: base64Photo }),
    };

    try {
      const updated = await updateUser({ id: user?.id!, data: fullData }).unwrap();
      dispatch(
        setUser({
          id: updated.user._id,
          username: updated.user.username,
          email: updated.user.email,
          role: updated.user.role,
          photo: updated.user.photo ?? null,
          phone: updated.user.phone ?? '',
          address: updated.user.address ?? '',
        })
      );
      alert('Profile updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  if (isLoading || !user) return <LoadingOverlay />;

  return (
    <div className="min-h-screen pt-[100px] px-4 bg-[#F5F7FA] dark:bg-gray-900">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black dark:border-white shadow-lg mb-4">
            <img
              src={
                user.photo
                  ? user.photo.startsWith('http') || user.photo.startsWith('data:image')
                    ? user.photo
                    : `https://res.cloudinary.com/dsrmingwi/image/upload/${user.photo}`
                  : '/default.jpg'
              }
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              {...register('username')}
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Phone Number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <input
              {...register('address')}
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Address"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0 file:text-sm file:font-semibold
                  file:bg-black file:text-white hover:file:bg-neutral-800"
              lang="en"
            />
          </div>

          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={updating}
              className="bg-black hover:bg-neutral-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
