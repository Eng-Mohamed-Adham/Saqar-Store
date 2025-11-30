export interface OrderItem {
  card: string
  quantity: number
}
export interface CreateOrderResponse {
  order: any; 
  checkoutUrl: string;
  orderId: string; 
}


export interface ShippingAddress {
  fullName: string
  address: string
  city: string
  country: string
  postalCode: string
  phone: string
}

export interface Order {
  _id: string
  user?: {
    _id: string
    name: string
    email: string
  }
  items: OrderItem[]
  totalPrice: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: ShippingAddress
  couponCode?: string
  discountAmount?: number
  createdAt: string
}
export interface CreateOrderDto {
  items: {
    card: string
    quantity: number
    orderId?: string 
  }[]
  shippingAddress: {
    fullName: string
    address: string
    city: string
    country: string
    postalCode: string
    phone: string
  }
}

export interface UpdateOrderStatusDto {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}
