// [MODIFIED] Checkout.tsx — إنشاء Order أولاً ثم إنشاء Stripe Session عبر orderId فقط
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../app/store'
import { useCreateOrderMutation } from '../features/orders/ordersApi'
import { useCreateStripeSessionMutation } from '../features/payments/paymentsApi'
import { useNavigate } from 'react-router-dom'

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const shippingAddress = useSelector((state: RootState) => state.cart.shippingAddress)
  const userId = useSelector((state: RootState) => state.auth.user?._id) 
  const [createOrder] = useCreateOrderMutation()
  const [createStripeSession] = useCreateStripeSessionMutation()

  const handleCheckout = async () => {
    try {
      if (!cartItems || cartItems.length === 0) {
        alert('Empty Cart! Please add items to your cart before checking out.')
        return
      }

      const orderRes = await createOrder({
        items: cartItems.map((i) => ({
          product: i.productId ?? i.product, 
          quantity: i.quantity,
          sellerId: i.sellerId,

        })),
        shippingAddress,
        userId, 
      } as any).unwrap()

      const orderId = orderRes.orderId || orderRes.order?._id 
      if (!orderId) {
        alert('Order creation failed: missing orderId')
        return
      }

      const { url } = await createStripeSession({ orderId }).unwrap()

      if (url) {
        window.location.href = url 
      } else {
        alert('Something went wrong with the payment session.')
      }
    } catch (error: any) {
      console.error('❌ Checkout error:', error)
      alert(error?.data?.message || 'Failed to start checkout session.')
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white dark:bg-zinc-900 shadow rounded mt-[100px]">
      <h2 className="text-2xl font-bold mb-4">Review the Order</h2>

      <ul className="mb-6">
        {cartItems.map((item, idx) => (
          <li key={idx} className="mb-2">
            {item.name} × {item.quantity} = ${item.price * item.quantity}
          </li>
        ))}
      </ul>

      <button
        onClick={handleCheckout}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Payment Via Stripe
      </button>
    </div>
  )
}

export default CheckoutPage
