import { api } from '../../app/apiSlice';

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboardData: builder.query({
      query: () => '/dashboard/admin',
    }),
  }),
});

export const { useGetAdminDashboardDataQuery } = dashboardApi;
