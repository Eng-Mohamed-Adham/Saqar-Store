import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Product } from '../../types/products.types';
import { productApi } from './productApi';

const productsAdapter = createEntityAdapter<Product>({
  selectId: (product) => product._id,
});

const initialState = productsAdapter.getInitialState();

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // if you want to reset the products state
    resetProducts: () => initialState,
  },
  extraReducers: (builder) => {
    
builder.addMatcher(
  productApi.endpoints.getAllProducts.matchFulfilled,
  (state, action) => {
    productsAdapter.setAll(state, action.payload.products);
  }
);

    // After createProduct
    builder.addMatcher(
      productApi.endpoints.createProduct.matchFulfilled,
      (state, action) => {
        productsAdapter.addOne(state, action.payload);
      }
    );

    // بعد updateProduct
    builder.addMatcher(
      productApi.endpoints.updateProduct.matchFulfilled,
      (state, action) => {
        productsAdapter.upsertOne(state, action.payload);
      }
    );

    // بعد deleteProduct
    builder.addMatcher(
      productApi.endpoints.deleteProduct.matchFulfilled,
      (state, action, id) => {
        // لازم تمرر ID للـ mutation
        productsAdapter.removeOne(state, action.meta.arg.originalArgs);
      }
    );
  },
});

export const { resetProducts } = productSlice.actions;
export const productReducer = productSlice.reducer;

// ✅ Selectors جاهزة
export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectIds: selectProductIds,
  selectEntities: selectProductEntities,
} = productsAdapter.getSelectors((state: any) => state.products);
