import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'wouter'

import { useSDK, useSDKMutation } from '@/services/api'
import { usePersistStore } from '@/store/persist'
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
  const { user, ...swr } = useUser()

  if (swr.isLoading) {
    return null
  }

  return (
    <SessionContext.Provider value={{ user, ...swr }}>
      {children}
    </SessionContext.Provider>
  )
}

/**
 * 用于保护路由, 当用户未登录时, 重定向到登录页面
 * @returns
 */
export function SessionGuard({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation()
  const [isReady, setIsReady] = useState(false)
  const user = useSession()

  useEffect(() => {
    if ((location === '/app' || location.startsWith('/app/')) && !user) {
      setLocation('login1', {
        replace: true,
      })
      return
    } else if (
      (location.startsWith('/login') || location.startsWith('/signup')) &&
      user
    ) {
      setLocation('/app', {
        replace: true,
      })
      return
    }
    setIsReady(true)
  }, [location, user])

  if (!isReady) {
    return null
  }

  return <>{children}</>
}

export const TeamContext = createContext<{ id: string } | null>(null)

export const TeamProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false)
  const { teamId, setTeamId } = usePersistStore()

  const { data: teams } = useSDK(sdk.v1.team.list, teamId ? null : [])

  useEffect(() => {
    if (!teamId && teams?.length && teams.length > 0) {
      setTeamId(teams[0].id)
    }
    setIsReady(true)
  }, [teamId, teams])

  if (!isReady) {
    return null
  }

  return (
    <TeamContext.Provider value={teamId ? { id: teamId } : null}>
      {children}
    </TeamContext.Provider>
  )
}

export const useTeam = () => {
  const [_, setLocation] = useLocation()
  const team = useContext(TeamContext)

  if (!team) {
    throw setLocation('/app/home?modal=createTeam')
  }

  return team
}
