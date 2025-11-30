// authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  username: string       // ✅ بدل "name" بـ "username"
  email: string
  role: 'admin' | 'seller' | 'user'
  photo?: string
  phone?: string
  address?: string
  stripeAccountId: string | null
}

interface AuthState {
  user: User | null
  token: string | null
}

const initialState: AuthState = {
  token: null,
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ✅ تخزين التوكن فقط عند تسجيل الدخول أو /auth/refresh
    setCredentials: (
  state,
  action: PayloadAction<{ token: string | null; user: User }>
) => {
  state.token = action.payload.token
  state.user = action.payload.user
},

    // ✅ تحميل بيانات المستخدم بعد جلبها من /auth/me
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    // ✅ لتسجيل الخروج (اختياري إذا لزم)
    logout: (state) => {
      state.token = null
      state.user = null
    },
  },
})

export const { setCredentials, setUser, logout } = authSlice.actions
export default authSlice.reducer
