import React, { useMemo } from 'react'

import { FetchContext, SDKContext } from '@/services/api'
import { usePersistStore } from '@/store/persist'

const HOST = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5173'

const SDKProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { teamId } = usePersistStore()

  const options = useMemo(() => {
    return {
      headers: {
        ...(teamId ? { 'expotes-team-id': teamId } : {}),
      },
      options: {
        credentials: 'include' as const,
      },
    }
  }, [teamId])

  return (
    <FetchContext.Provider
      value={(input, init) =>
        fetch(`${HOST}${input}`, {
          // ...options,
          ...options.options,
          headers: {
            ...options.headers,
            ...init?.headers,
          },
          ...init,
        })
      }
    >
      <SDKContext.Provider
        value={{
          host: HOST,
          ...options,
        }}
      >
        {children}
      </SDKContext.Provider>
    </FetchContext.Provider>
  )
}
export default SDKProvider
