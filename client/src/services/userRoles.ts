
import { useSelector } from 'react-redux'
import { RootState } from '../app/store'

export const useRoles = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role)

  return {
    isUser: role === 'user',
    isSeller: role === 'seller',
    isAdmin: role === 'admin',
    role,
    canEdit: role === 'seller' || role === 'admin',
  }
}
