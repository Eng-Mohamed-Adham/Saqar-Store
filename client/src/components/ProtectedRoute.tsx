import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../app/store'

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: string[]
}) => {
  const { user } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  // 🔒 
  if (user === null) {
    return null 
  }

  // 👮‍♂️
  if (allowedRoles.includes(user.role)) {
    return <>{children}</>
  }

  // ❌unauthorized
  return <Navigate to="/unauthorized" state={{ from: location }} replace />
}

export default ProtectedRoute
