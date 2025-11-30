import { api } from '../../app/apiSlice'
import { Order, CreateOrderDto, UpdateOrderStatusDto,CreateOrderResponse } from '../../types/order.types'

export const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
createOrder: builder.mutation<CreateOrderResponse, CreateOrderDto>({
  query: (data) => ({
    url: '/orders',
    method: 'POST',
    body: data,
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json', 
    },
  }),
}),


    getMyOrders: builder.query<Order[], void>({
      query: () => '/orders/my',
    }),

    getAllOrders: builder.query<Order[], void>({
      query: () => '/orders',
    }),

    updateOrderStatus: builder.mutation<Order, { id: string; data: UpdateOrderStatusDto }>({
      query: ({ id, data }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: data,
      }),
    }),

    deleteOrder: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
})

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = orderApi
