
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Unauthorized = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/products') 
    }, 15000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">🚫UnAuthorization!</h1>
      <p className="text-lg text-gray-300">
You Do Not Have Any Accessbility.      </p>
    </div>
  )
}

export default Unauthorized
