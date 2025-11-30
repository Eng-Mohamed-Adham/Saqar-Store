
export type UserRole = 'user' | 'seller' | 'admin'

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  token: string
}
