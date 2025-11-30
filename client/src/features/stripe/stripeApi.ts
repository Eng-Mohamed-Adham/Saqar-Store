import { api } from '../../app/apiSlice';
import { User } from '../../types/user.types';

export const stripeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStripeConnectLink: builder.query<{ url: string }, void>({
      query: () => '/stripe/connect',
    }),
       createStripeExpressAccount: builder.mutation<{ url: string }, void>({
      query: () => ({
        url: '/stripe/connect',
        method: 'POST',
      }),
    }),
    saveStripeAccount: builder.mutation<User, { stripeAccountId: string }>({
  query: (body) => ({
    url: '/users/stripe-account',
    method: 'PUT',
    body,
  }),
}),
  }),
});

export const {
   useGetStripeConnectLinkQuery,
   useCreateStripeExpressAccountMutation,
   useSaveStripeAccountMutation
   } = stripeApi;
