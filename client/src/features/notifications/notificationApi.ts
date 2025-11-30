import { api } from '../../app/apiSlice';

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ جلب كل الإشعارات
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),

    // ✅ تعيين إشعار واحد كمقروء
    markAsRead: builder.mutation({
      query: (id: string) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // ✅ تعيين جميع الإشعارات كمقروءة
    markAllAsRead: builder.mutation({
      query: () => ({
        url: `/notifications/mark-all-read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
