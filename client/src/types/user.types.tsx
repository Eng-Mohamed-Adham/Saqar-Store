export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'seller' | 'user'
  photo?: string
  phone?: string
  address?: string
  stripeAccountId:string
}
