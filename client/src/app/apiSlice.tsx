import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './store';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
    headers: {
  'Content-Type': 'application/json', 
},
prepareHeaders: (headers, { getState }) => {
  const token = (getState() as RootState).auth.token
  if (token) {
     headers.set('Authorization', `Bearer ${token}`)

    headers.set("authorization", `Bearer ${token}`)



  }
  return headers
}
,
  }),
  tagTypes: ['Product', 'User', 'Order','Offers','Contact','Messages','AuthUser','Notifications',
    'SellerReviews','Wishlist'
  ], 
  endpoints: () => ({}), 
});
