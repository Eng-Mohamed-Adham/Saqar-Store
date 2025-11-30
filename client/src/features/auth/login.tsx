import { useForm } from 'react-hook-form'
import { useLoginMutation, useGetMeQuery } from './authApi'
import { useDispatch } from 'react-redux'
import { setCredentials, setUser } from './authSlice'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

type LoginFormInputs = {
  email: string
  password: string
}

const Login = () => {
  const { register, handleSubmit } = useForm<LoginFormInputs>()
  const [login, { isLoading, error }] = useLoginMutation()
  const [token, setToken] = useState<string | null>(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const res = await login(data).unwrap()
      dispatch(setCredentials({ token: res.accessToken }))
      setToken(res.accessToken)
    } catch (err) {
      console.error('فشل تسجيل الدخول', err)
    }
  }

  const { data: userData, isSuccess: userFetched } = useGetMeQuery(undefined, {
    skip: !token,
  })

  useEffect(() => {
    if (userFetched && userData?.user) {
      dispatch(setUser(userData.user))
      switch (userData.user.role) {
        case 'admin':
          navigate('/admin/dashboard')
          break
        case 'seller':
          navigate('/products')
          break
        default:
          navigate('/')
      }
    }
  }, [userFetched, userData, dispatch, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8 mt-24">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Login to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please enter your credentials below
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email address
            </label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register('password', { required: true })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              placeholder="••••••••"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500">Invalid email or password.</p>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-black hover:bg-gray-800 transition-colors"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
