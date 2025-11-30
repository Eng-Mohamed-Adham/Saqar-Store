import { api } from '../../app/apiSlice'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  role: 'admin' | 'seller' | 'user'
  phone: string
  address: string
  photo: string
}

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'seller' | 'user'
  phone: string
  address: string
  photo: string
  stripeAccountId: string | null
}

export interface LoginResponse {
  accessToken: string
}

export interface RegisterResponse {
  message: string
  token: string
  user: User
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
        credentials: 'include',
      }),
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
        credentials: 'include',
      }),
    }),

  getUserFromToken: builder.query<
  { token: string; user: User },
  void>({
  query: () => ({
    url: '/auth/refresh',
    method: 'GET',
    credentials: 'include',
  }),
}),


   getMe: builder.query<{ user: User }, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
    }),



    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
        credentials: 'include',
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUserFromTokenQuery,
  useGetMeQuery,
  useLogoutMutation,
} = authApi
