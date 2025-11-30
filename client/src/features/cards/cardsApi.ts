// src/features/product/productApi.ts
import { api } from '../../app/apiSlice';
import { Card, CreateCard, UpdateCard } from '../../types/card.types';

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
getAllCards: builder.query<
  { Card: Card[]; title: string; description: string; image: string; category: string;owner:string  },
  { category?: string; page?: number; sort?: string }
>({
  query: ({ category, page = 1, sort }) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (page) params.append('page', page.toString());
    if (sort) params.append('sort', sort);
    return `products?${params.toString()}`;
  },
  providesTags: (result) =>
    result?.products
      ? [
          ...result.products.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
          { type: 'Product', id: 'LIST' },
        ]
      : [{ type: 'Product', id: 'LIST' }],
}),


    getProductById: builder.query<Product, string>({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation<Product, CreateProductDto>({
      query: (newProduct) => ({
        url: 'products',
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<Product, { id: string; data: UpdateProductDto }>({
      query: ({ id, data }) => ({
        url: `products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),

    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
