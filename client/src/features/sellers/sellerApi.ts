// features/sellers/sellerApi.ts
import { api } from '../../app/apiSlice';

export const sellerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSellerById: builder.query<any, string>({
      query: (id) => `/sellers/${id}`,
    }),
 getSellerReviews: builder.query<{ reviews: any[]; averageRating: number }, string>({
  query: (id) => `/sellers/${id}/reviews`,
  providesTags: ['SellerReviews'],
}),

    addSellerReview: builder.mutation<any, { sellerId: string; rating: number; comment: string }>({
      query: ({ sellerId, ...body }) => ({
        url: `/sellers/${sellerId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SellerReviews'],
    }),
  }),
});

export const {
  useGetSellerByIdQuery,
  useGetSellerReviewsQuery,
  useAddSellerReviewMutation,
} = sellerApi;
