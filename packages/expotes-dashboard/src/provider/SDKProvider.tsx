import React from 'react'

import { SDKContext } from '@/services/api'
import { usePersistStore } from '@/store/persist'

const SDKProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { teamId } = usePersistStore()
  return (
    <SDKContext.Provider
      value={{
        host: import.meta.env.PROD
          ? import.meta.env.VITE_API_URL
          : 'http://localhost:3000',
        headers: {
          ...(teamId ? { 'expotes-team-id': teamId } : {}),
        },
        options: {
          credentials: 'include',
        },
      }}
    >
      {children}
    </SDKContext.Provider>
  )
}
export default SDKProvider
