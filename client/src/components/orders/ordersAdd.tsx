import React from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store'
import { useCreateOrderMutation } from '../../features/orders/ordersApi'
import { useCreateStripeSessionMutation } from '../../features/payments/paymentsApi' 
import { useNavigate } from 'react-router-dom'

interface FormValues {
  fullName: string
  address: string
  city: string
  country: string
  postalCode: string
  phone: string
  couponCode?: string
}

const CreateOrderPage: React.FC = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const user = useSelector((state: RootState) => state.auth.user)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const [createOrder, { isLoading }] = useCreateOrderMutation()
  const [createStripeSession] = useCreateStripeSessionMutation() // [ADDED]

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (cartItems.length === 0) {
      alert('السلة فارغة')
      return
    }

    const shippingAddress = {
      fullName: data.fullName,
      address: data.address,
      city: data.city,
      country: data.country,
      postalCode: data.postalCode,
      phone: data.phone,
    }

    try {
      const orderRes: any = await createOrder({
        items: cartItems.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          sellerId: item.sellerId,
        })),
        shippingAddress,
        couponCode: data.couponCode?.trim() || undefined,
        userId: user?.id, 
      }).unwrap()

      const orderId = orderRes?.orderId || orderRes?.order?._id
      if (!orderId) {
        console.error('No orderId in createOrder response:', orderRes)
        alert('Order created but missing orderId')
        return
      }

      const sessionRes = await createStripeSession({ orderId }).unwrap()
      if (sessionRes?.url) {
        window.location.href = sessionRes.url
      } else {
        alert('Payment link not received from server')
      }

    } catch (err: any) {
      console.error('💥Error creating order / session:', err)
      alert(err?.data?.message || 'Request creation failed')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 dark:text-white mt-[100px]">
      <div>
        <h2 className="text-3xl font-bold mb-6">Shipping Details</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('fullName', { required: true })} placeholder="Full Name"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-3 rounded-md focus:outline-none focus:border-black dark:focus:border-white" />

          <input {...register('address', { required: true })} placeholder="Address"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-3 rounded-md focus:outline-none focus:border-black dark:focus:border-white" />

          <input {...register('city', { required: true })} placeholder="City"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-3 rounded-md focus:outline-none focus:border-black dark:focus:border-white" />

          <input {...register('country', { required: true })} placeholder="Country"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-3 rounded-md focus:outline-none focus:border-black dark:focus:border-white" />

          <input {...register('postalCode', { required: true })} placeholder="Postal Code"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-3 rounded-md focus:outline-none focus:border-black dark:focus:border-white" />

          <input {...register('phone', { required: true })} placeholder="Phone Number"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-3 rounded-md focus:outline-none focus:border-black dark:focus:border-white" />

          <input {...register('couponCode')} placeholder="Coupon Code (optional)"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-3 rounded-md focus:outline-none focus:border-black dark:focus:border-white" />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-3 mt-4 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
          >
            {isLoading ? 'Processing...' : 'Confirm Order & Pay'}
          </button>
        </form>
      </div>

      <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
        {cartItems.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Your cart is empty.</p>
        ) : (
          <ul className="space-y-3">
            {cartItems.map((item, i) => (
              <li key={i} className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 pb-2">
                <span className="text-gray-800 dark:text-gray-200">{item.name} × {item.quantity}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">${item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default CreateOrderPage
