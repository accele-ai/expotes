import React from 'react'

import { SDKContext } from '@/services/api'
import { usePersistStore } from '@/store/persist'

const SDKProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { teamId } = usePersistStore()
  return (
    <SDKContext.Provider
      value={{
        host: 'http://localhost:5173',
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
