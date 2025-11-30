import { api } from '../../app/apiSlice';
import { Product, CreateProductDto, UpdateProductDto } from '../../types/products.types';

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
getAllProducts: builder.query<
  { products: Product[]; total: number; page: number; pages: number; count: number },
  { category?: string; page?: number; sort?: string }
>({
query: (args = {}) => {
  const { category, page = 1, sort } = args;
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
    getMyProducts: builder.query({
  query: () => '/products/mine',
}),


    createProduct: builder.mutation<Product, CreateProductDto>({
      query: (newProduct) => ({
        url: 'products',
        method: 'POST',
        body: newProduct,
            credentials: 'include',
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
    addReview: builder.mutation({
  query: ({ productId, rating, comment }) => ({
    url: `/products/${productId}/review`,
    method: 'POST',
    body: { rating, comment },
    credentials: 'include', 
  }),
}),

  }),
  overrideExisting: false,
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useGetMyProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
    useAddReviewMutation,
} = productApi;
