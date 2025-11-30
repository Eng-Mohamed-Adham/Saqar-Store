// src/pages/ContactPage.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateContactMessageMutation } from '../features/contact/contactApi';
import GlobalLoader from '../services/globalLoader';

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>();

  const [createMessage, { isLoading, isSuccess, isError }] =
    useCreateContactMessageMutation();

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await createMessage(data).unwrap();
      reset();
    } catch (error) {
      // سيتم عرض الخطأ تحت الزر
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 shadow rounded-lg dark:shadow-lg dark:border dark:border-gray-700 mt-[100px]">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        📬 اتصل بنا
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-semibold text-gray-800 dark:text-gray-300">الاسم</label>
          <input
            type="text"
            className="w-full border px-4 py-2 rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block font-semibold text-gray-800 dark:text-gray-300">Email: </label>
          <input
            type="email"
            className="w-full border px-4 py-2 rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
            {...register('email', { required: ' Email is required' })}
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block font-semibold text-gray-800 dark:text-gray-300">Subject:</label>
          <input
            type="text"
            className="w-full border px-4 py-2 rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
            {...register('subject', { required: 'Subject is required' })}
          />
          {errors.subject && <p className="text-red-500">{errors.subject.message}</p>}
        </div>

        <div>
          <label className="block font-semibold text-gray-800 dark:text-gray-300">Message</label>
          <textarea
            className="w-full border px-4 py-2 rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
            rows={5}
            {...register('message', { required: 'Message is required' })}
          />
          {errors.message && <p className="text-red-500">{errors.message.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black hover:bg-blue-700 text-white py-2 rounded transition-colors"
        >
          {isLoading ? <GlobalLoader /> : 'Send Message'}
        </button>

        {isSuccess && <p className="text-green-600 dark:text-green-400 text-center mt-2">✅Done</p>}
        {isError && <p className="text-red-600 dark:text-red-400 text-center mt-2">❌ Cancled</p>}
      </form>
    </div>
  );
};

export default ContactPage;
