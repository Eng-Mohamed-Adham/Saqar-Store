import { api } from './apiSlice';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { productReducer } from '../features/products/productSlice';
import { userReducer } from '../features/users/usersSlice';
import cartReducer from '../features/cards/cardsSlice';

export const store = configureStore({
reducer: {
    auth: authReducer,
    products: productReducer,
    users: userReducer,
    cart: cartReducer,
    [api.reducerPath]: api.reducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
        .concat(api.middleware),
  
  
});


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;
