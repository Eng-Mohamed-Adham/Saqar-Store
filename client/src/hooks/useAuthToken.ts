import { useSelector } from 'react-redux'
import { RootState } from '../app/store'

export const useAuthToken = (): string | null => {
  const token = useSelector((state: RootState) => state.auth.token)
  return token
}
