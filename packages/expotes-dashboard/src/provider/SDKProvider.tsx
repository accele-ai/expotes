import React from 'react'

import { SDKContext } from '@/services/api'

const SDKProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log(import.meta.env.BASE_URL)
  return (
    <SDKContext.Provider
      value={{
        host: 'http://localhost:5173',
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
