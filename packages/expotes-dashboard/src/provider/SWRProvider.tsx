import { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { useLocation } from 'wouter'

interface SWRProviderProps {
  children: ReactNode
}

const SWRProvider: React.FC<SWRProviderProps> = ({ children }) => {
  const [location, setLocation] = useLocation()

  return (
    <SWRConfig
      value={{
        onError: (error) => {
          if (error.status === 400 || error.status === 401) {
            if (!location.startsWith('/login')) {
              setLocation('/login')
            }
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}

export default SWRProvider
