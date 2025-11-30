import { api } from '../../app/apiSlice';

export const searchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchItems: builder.query<any, string>({
      query: (q) => `/search?q=${q}`,
    }),
  }),
});

export const { useLazySearchItemsQuery } = searchApi;
