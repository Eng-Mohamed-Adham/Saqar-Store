import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../app/store'
import { useGetUserFromTokenQuery } from '../features/auth/authApi'
import { setCredentials } from '../features/auth/authSlice'
import GlobalLoader from '../services/globalLoader'

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch()
  const auth = useSelector((state: RootState) => state.auth)

  // 👇 التحقق يتم فقط إذا لم يكن عندنا user موجود بالفعل
  const { data, isLoading } = useGetUserFromTokenQuery(undefined, {
    skip: !!auth.user, // ⬅️ نستخدمه لتجنب التكرار بعد ما يتم تحميل المستخدم
    refetchOnMountOrArgChange: true,
  })

  useEffect(() => {
    if (data?.token && data?.user) {
      dispatch(setCredentials({ token: data.token, user: data.user }))
    }
  }, [data, dispatch])

  // ✅ في أول تحميل للصفحة، انتظر تحميل البيانات أولًا
  if (!auth.user && isLoading) {
    return <GlobalLoader />
  }

  return <>{children}</>
}
