// src/features/contact/contactApi.ts
import { api } from '../../app/apiSlice';

export const contactApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // 🟢 Send Message
    createContactMessage: builder.mutation({
      query: (data) => ({
        url: '/contact',
        method: 'POST',
        body: data,
      }),
    }),

    // 🔵Get Message For Admin
    getAllMessages: builder.query({
      query: () => '/contact',
      providesTags: ['Contact'],
    }),

    markMessageResolved: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Contact'],
    }),
  }),
});

export const {
  useCreateContactMessageMutation,
  useGetAllMessagesQuery,
  useMarkMessageResolvedMutation,
} = contactApi;
