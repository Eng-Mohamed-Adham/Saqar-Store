import { createSlice, PayloadAction } from '@reduxjs/toolkit'


interface CartItem {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  sellerId?: string
}

interface ShippingAddress {
  fullName: string
  address: string
  city: string
  country: string
  postalCode: string
  phone: string
}

interface CartState {
  items: CartItem[]
  shippingAddress: ShippingAddress
}

const initialState: CartState = {
  items: [],
  shippingAddress: {
    fullName: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
  },

}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(i => i.productId === action.payload.productId)
      if (existing) {
        existing.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.productId !== action.payload)
    },
    increaseQuantity: (state, action) => {
  const item = state.items.find(i => i.productId === action.payload);
  if (item) item.quantity += 1;
},
decreaseQuantity: (state, action) => {
  const item = state.items.find(i => i.productId === action.payload);
  if (item && item.quantity > 1) {
    item.quantity -= 1;
  }
},

    clearCart: (state) => {
      state.items = []
    },
  },
})

export const { addToCart, removeFromCart, clearCart,increaseQuantity,decreaseQuantity } = cartSlice.actions
export default cartSlice.reducer
