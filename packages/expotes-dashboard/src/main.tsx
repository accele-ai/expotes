import './index.css'

import { NextUIProvider } from '@nextui-org/react'
import React from 'react'
import ReactDOM from 'react-dom/client'

import SDKProvider from './provider/SDKProvider.tsx'
import SessionProvider from './provider/SessionProvider.tsx'
import SWRProvider from './provider/SWRProvider.tsx'
import Router from './router.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NextUIProvider>
      <SWRProvider>
        <SDKProvider>
          <SessionProvider>
            <Router />
          </SessionProvider>
        </SDKProvider>
      </SWRProvider>
    </NextUIProvider>
  </React.StrictMode>,
)
