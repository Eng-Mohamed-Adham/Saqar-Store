import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useRegisterMutation } from './authApi'
import { useState } from 'react'

type FormValues = {
  username: string
  email: string
  password: string
  role: 'admin' | 'seller' | 'user'
  phone?: string
  address?: string
  photo?: string
}

const Register = () => {
  const [base64Photo, setBase64Photo] = useState<string | undefined>()

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const [register, { isLoading }] = useRegisterMutation()
  const navigate = useNavigate()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setBase64Photo(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const dataWithPhoto = { ...data, photo: base64Photo }
      await register(dataWithPhoto).unwrap()
      navigate('/login')
    } catch (err) {
      console.error('فشل الإضافة:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
      <div className="w-full max-w-lg space-y-8 mt-24">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Fill in your details to register
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* الاسم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              {...formRegister('username', { required: 'Full name is required' })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-black focus:border-black"
              placeholder="John Doe"
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
          </div>

          {/* البريد */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
            <input
              type="email"
              {...formRegister('email', { required: 'Email is required' })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-black focus:border-black"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          {/* كلمة المرور */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              {...formRegister('password', { required: 'Password is required', minLength: 6 })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-black focus:border-black"
              placeholder="••••••••"
            />
          </div>

          {/* نوع الحساب */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
            <select
              {...formRegister('role')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-black focus:border-black"
            >
              <option value="user">User</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          {/* الهاتف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <input
              {...formRegister('phone')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-black focus:border-black"
              placeholder="+123456789"
            />
          </div>

          {/* العنوان */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <input
              {...formRegister('address')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-black focus:border-black"
              placeholder="City, Country"
            />
          </div>

          {/* الصورة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="dark:text-white" />
          </div>

          {/* الزر */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-md shadow-sm text-white bg-black hover:bg-gray-800 transition-colors"
            >
              {isLoading ? 'Submitting...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
