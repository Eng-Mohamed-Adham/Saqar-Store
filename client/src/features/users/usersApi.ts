import { api } from '../../app/apiSlice';

interface User {
  _id: string
  username: string
  email: string
  role: string
  phone?: string
    photo?: string 
stripeAccountId:string
  address?: string
}


export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
     getUsers: builder.query<User[], { sellerOnly?: boolean } | void>({
      query: (params) => {
        const query = params?.sellerOnly ? '?sellerOnly=true' : '';
        return {
          url: `/users${query}`,
          credentials: 'include',
        };
      },
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
    }),
addUser: builder.mutation<User, Partial<User>>({
  query: (userData) => ({
    url: '/users',
    method: 'POST',
    body: userData, 
  }),
}),


    updateUser: builder.mutation<User, { id: string; data: Partial<User>  }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,

      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  banOrUnbanSeller: builder.mutation<void, string>({
  query: (sellerId) => ({
    url: `/dashboard/ban/${sellerId}`,
    method: 'PATCH',
  }),
  invalidatesTags: ['User'],
}),
   
  getSellers: builder.query<User[], void>({
      query: () => ({
        url: '/users?sellerOnly=true',
        credentials: 'include',
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetSellersQuery ,
useBanOrUnbanSellerMutation
} = userApi;
