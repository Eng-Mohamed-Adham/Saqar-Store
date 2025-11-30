// src/features/payment/paymentApi.ts
import { api } from '../../app/apiSlice'



type CreateStripeSessionReq = {
  orderId: string
}

type CreateStripeSessionRes = {
  url: string
  sessionId?: string
}


export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({


     createStripeSession:builder.mutation<CreateStripeSessionRes, CreateStripeSessionReq>({
      query: (body) => ({
        url: 'payment/create-checkout-session',
        method: 'POST',
        body,
        credentials: 'include',

      }),
    }),
  }),
    overrideExisting: true, 

})

export const { useCreateStripeSessionMutation } = paymentApi

export interface StripeItem {
  name: string
  price: number
  quantity: number
}
