import { createContext, useContext } from 'react'

import { useSDK } from '@/services/api'
import { sdk } from '@expotes/sdk'
import { IUserDto } from '@expotes/sdk/structures'

/**
 * 获取当前登录的用户的 Request Hook
 */
export const useUser = () => {
  const swr = useSDK(sdk.v1.user.me, [], {
    onError: (error) => {
      if (error.status === 400 || error.status === 401) {
        // 过期
      }
    },
    onErrorRetry: (error) => {
      if (error.status === 400) {
        // 未登录
        return null
      }
    },
  })
  return { ...swr, user: swr.data ?? null }
}

const SessionContext = createContext<{
  user: IUserDto | null
  isLoading: boolean
}>({
  user: null,
  isLoading: true,
})

/**
 * 获取当前登录的用户, 应该被用来判断用户是否登录
 * @returns 当前登录的用户, 未登录时返回 null
 */
export const useSession = <T extends boolean = false>(
  optional: T = false as T,
): T extends true ? IUserDto | null : IUserDto => {
  const data = useContext(SessionContext)
  if (!optional && !data.isLoading && data === null) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return data.user as T extends true ? IUserDto | null : IUserDto
}

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return null
  }

  return (
    <SessionContext.Provider value={{ user, isLoading }}>
      {children}
    </SessionContext.Provider>
  )
}
