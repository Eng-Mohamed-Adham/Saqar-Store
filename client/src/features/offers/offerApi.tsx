import { api } from '../../app/apiSlice';

export const offerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllOffers: builder.query({
      query: (params) => ({
        url: '/offers',
        params,
      }),
      providesTags: ['Offers'],
    }),
    getMyOffers: builder.query({
      query: () => '/offers/mine',
      providesTags: ['Offers'],
    }),
    getOfferById: builder.query({
      query: (id) => `/offers/${id}`,
    }),
    createOffer: builder.mutation({
      query: (data) => ({
        url: '/offers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Offers'],
    }),
    updateOffer: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/offers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Offers'],
    }),
    deleteOffer: builder.mutation({
      query: (id) => ({
        url: `/offers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Offers'],
    }),
  }),
});

export const {
  useGetAllOffersQuery,
  useGetMyOffersQuery,
  useGetOfferByIdQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = offerApi;
